import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import { authRequired } from "../middleware/auth.js";
import { requireDb } from "../middleware/requireDb.js";
import { getEffectivePermissions } from "../permissions.js";

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
    process.env.JWT_SECRET,
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

router.get("/setup", requireDb, async (_req, res) => {
  try {
    const superAdminCount = await User.countDocuments({ role: "superadmin" });
    res.json({ needsSuperAdmin: superAdminCount === 0 });
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

    const superAdminCount = await User.countDocuments({ role: "superadmin" });
    const role = superAdminCount === 0 ? "superadmin" : "admin";
    const isActive = role === "superadmin";

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

export default router;
