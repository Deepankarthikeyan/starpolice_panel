import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import { authRequired } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { getEffectivePermissions } from "../permissions.js";
import {
  clearTestSuperAdminsIfNeeded,
  isTestSuperAdminEmail,
} from "../utils/clearTestSuperAdmins.js";
import { isRenderProduction } from "../config/production.js";
import { getJwtSecret } from "../config/jwt.js";
import { validateEmailOrThrow } from "../utils/emailValidation.js";
import {
  getTokenInfo,
  handleForgotPassword,
  requestOtpForToken,
  resendOtpForToken,
  verifyOtpForToken,
} from "../services/passwordAuth.js";

const router = express.Router();

function resolveRolePermissions(user) {
  return getEffectivePermissions(user);
}

function mapSubjectRefs(subjectRefs) {
  const subjectIds = [];
  const subjectNames = [];

  if (!subjectRefs?.length) {
    return { subjectIds, subjectNames };
  }

  for (const ref of subjectRefs) {
    if (ref && typeof ref === "object" && ref._id) {
      subjectIds.push(ref._id.toString());
      if (ref.name) subjectNames.push(ref.name);
    } else if (ref) {
      subjectIds.push(ref.toString());
    }
  }

  return { subjectIds, subjectNames };
}

async function getStaffAuthFields(user) {
  if (user.role !== "staff") {
    return { subjectIds: [], subjectNames: [], staffExamTypes: [] };
  }

  if (!user.populated("subjectIds")) {
    await user.populate("subjectIds", "name");
  }

  const { subjectIds, subjectNames } = mapSubjectRefs(user.subjectIds);
  if (!subjectIds.length) {
    return { subjectIds, subjectNames, staffExamTypes: [] };
  }

  const exams = await Exam.find({ subjectId: { $in: subjectIds }, isActive: true }).select("examType");
  const staffExamTypes = [...new Set(exams.map((exam) => exam.examType))];

  return { subjectIds, subjectNames, staffExamTypes };
}

function createToken(user, panel, staffFields = {}) {
  const permissions = resolveRolePermissions(user);

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      panel,
      isActive: user.role === "superadmin" ? true : user.isActive,
      permissions,
      ...staffFields,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

async function publicUser(user, token, panel) {
  const permissions = resolveRolePermissions(user);
  const staffFields = await getStaffAuthFields(user);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    permissions,
    panel,
    token,
    ...staffFields,
  };
}

function canAccessAdminPanel(user) {
  return user.role === "superadmin" || (user.role === "admin" && user.isActive);
}

function canAccessStaffPanel(user) {
  return user.role === "staff" && user.isActive;
}

function canAccessStudentPanel(user) {
  return user.role === "student" && user.isActive;
}

async function getSetupStatus() {
  await clearTestSuperAdminsIfNeeded();
  const superAdminCount = await User.countDocuments({ role: "superadmin" });
  return { needsSuperAdmin: superAdminCount === 0 };
}

router.get("/setup", requireDb, async (_req, res) => {
  try {
    res.json(await getSetupStatus());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/prepare-signup", requireDb, async (_req, res) => {
  try {
    const { cleared, deletedCount } = await clearTestSuperAdminsIfNeeded();
    const status = await getSetupStatus();
    res.json({ ...status, cleared, deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/register", requireDb, async (req, res) => {
  try {
    const { name, email, password, panel } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !panel) {
      return res.status(400).json({ message: "Name, email, password, and panel are required." });
    }

    if (panel !== "admin") {
      return res.status(403).json({ message: "Student accounts are created by an admin." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    try {
      validateEmailOrThrow(email);
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }

    const superAdminCount = await User.countDocuments({ role: "superadmin" });
    const role = superAdminCount === 0 ? "superadmin" : "admin";
    const isActive = role === "superadmin";
    const normalizedEmail = email.toLowerCase().trim();

    if (role === "superadmin" && isRenderProduction()) {
      if (isTestSuperAdminEmail(normalizedEmail) || normalizedEmail.endsWith("@example.com")) {
        return res.status(400).json({
          message:
            "Use your real email address for the super admin account (not @example.com test addresses).",
        });
      }
    }

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin signup is closed. Contact the super admin for access.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      role,
      isActive,
      emailVerified: true,
    });

    const staffFields = await getStaffAuthFields(user);
    const token = createToken(user, "admin", staffFields);
    res.status(201).json(await publicUser(user, token, "admin"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", requireDb, async (req, res) => {
  try {
    const { email, password, panel } = req.body;
    if (!email || !password || !panel) {
      return res.status(400).json({ message: "Email, password, and panel are required." });
    }

    const loginId = email.toLowerCase().trim();
    let user = await User.findOne({ email: loginId });
    if (!user && loginId) {
      user = await User.findOne({ username: loginId });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (panel === "admin") {
      if (!canAccessAdminPanel(user)) {
        return res.status(403).json({
          message:
            user.role === "staff"
              ? "Staff accounts should sign in from the staff login page."
              : user.role === "admin" && !user.isActive
                ? "Your admin access has not been activated yet. Contact the super admin."
                : "You do not have admin panel access.",
        });
      }
    } else if (panel === "staff") {
      if (!canAccessStaffPanel(user)) {
        return res.status(403).json({
          message:
            user.role === "superadmin"
              ? "Super admin accounts should sign in from the admin login page."
              :             user.role === "staff" && !user.isActive
                ? "Your staff access has not been activated yet. Contact the super admin."
                : "You do not have staff panel access.",
        });
      }
    } else if (panel === "student") {
      if (!canAccessStudentPanel(user)) {
        return res.status(403).json({
          message: user.role === "student" && !user.isActive
            ? "Your student panel access has not been activated yet. Contact your admin."
            : "You do not have student panel access.",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid panel." });
    }

    const staffFields = await getStaffAuthFields(user);
    const token = createToken(user, panel, staffFields);
    res.json(await publicUser(user, token, panel));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }

  const permissions = resolveRolePermissions(user);
  const staffFields = await getStaffAuthFields(user);

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    permissions,
    panel: req.user.panel,
    ...staffFields,
  });
});

router.get("/verify-setup-token", requireDb, async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }
    const info = await getTokenInfo(String(token));
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/forgot-password", requireDb, async (req, res) => {
  try {
    const { email, panel, clientUrl } = req.body;
    if (!email?.trim() || !panel) {
      return res.status(400).json({ message: "Email and panel are required." });
    }
    const result = await handleForgotPassword(email, panel, clientUrl);
    const message = result.delivered
      ? "Password reset link sent to your email. Check your inbox and spam folder."
      : result.devMode
        ? "Email is not configured on this server. Ask your administrator to add email settings to the API."
        : "Email could not be sent. Contact your administrator.";
    res.json({
      message,
      ...result,
      setupUrl: result.devMode ? result.setupUrl : undefined,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/request-otp", requireDb, async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }
    const result = await requestOtpForToken(token, password, confirmPassword);
    res.json({
      message: "Verification code sent to your email.",
      email: result.email,
      devMode: result.emailResult?.devMode ?? false,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/resend-otp", requireDb, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }
    const result = await resendOtpForToken(token);
    res.json({
      message: "A new verification code has been sent to your email.",
      email: result.email,
      devMode: result.emailResult?.devMode ?? false,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/verify-otp", requireDb, async (req, res) => {
  try {
    const { token, otp } = req.body;
    if (!token || !otp) {
      return res.status(400).json({ message: "Token and verification code are required." });
    }
    const result = await verifyOtpForToken(token, otp);
    res.json({
      message:
        result.purpose === "reset"
          ? "Password updated successfully. You can sign in with your new password."
          : "Account activated successfully. You can sign in with your new password.",
      panel: result.panel,
      purpose: result.purpose,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
