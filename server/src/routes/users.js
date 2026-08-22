import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { authRequired, adminPanelOnly, attachUser, superAdminOnly } from "../middleware/auth.js";
import { defaultPermissionsForRole, sanitizePermissions } from "../permissions.js";
import { createInvitedUser, sendSetupInvite, panelForRole } from "../services/passwordAuth.js";
import { validateEmailOrThrow } from "../utils/emailValidation.js";

const router = express.Router();

function resolveRolePermissions(user) {
  if (user.role === "superadmin") {
    return defaultPermissionsForRole("admin");
  }
  if (user.permissions?.length) {
    return user.permissions;
  }
  if (user.role === "student") {
    return defaultPermissionsForRole("student");
  }
  if (user.role === "staff") {
    return defaultPermissionsForRole("staff");
  }
  return defaultPermissionsForRole("admin");
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

function mapUser(user) {
  const { subjectIds, subjectNames } = mapSubjectRefs(user.subjectIds);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    permissions: resolveRolePermissions(user),
    staffType: user.staffType || null,
    subjectIds,
    subjectNames,
    createdAt: user.createdAt,
  };
}

async function validateSubjectIds(subjectIds) {
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return { error: "At least one subject is required for staff." };
  }

  const uniqueIds = [...new Set(subjectIds.filter(Boolean))];
  const subjects = await Subject.find({ _id: { $in: uniqueIds } });
  if (subjects.length !== uniqueIds.length) {
    return { error: "One or more selected subjects were not found." };
  }

  return { ids: uniqueIds };
}

router.get(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const { type } = req.query;

      if (type === "admin") {
        const users = await User.find({ role: "admin" }).select("-password").sort({ createdAt: -1 });
        return res.json(users.map(mapUser));
      }

      if (type === "staff") {
        const users = await User.find({ role: "staff" })
          .select("-password")
          .populate("subjectIds", "name")
          .sort({ createdAt: -1 });
        return res.json(users.map(mapUser));
      }

      if (type === "student") {
        const users = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
        return res.json(users.map(mapUser));
      }

      return res.status(400).json({ message: "Query type must be admin, staff, or student." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const { name, email, role, permissions, subjectIds, clientUrl } = req.body;
      if (!name?.trim() || !email?.trim() || !role) {
        return res.status(400).json({ message: "Name, email, and role are required." });
      }

      try {
        validateEmailOrThrow(email);
      } catch (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      let validatedSubjectIds = [];

      if (role === "staff") {
        const validation = await validateSubjectIds(subjectIds);
        if (validation.error) {
          return res.status(400).json({ message: validation.error });
        }
        validatedSubjectIds = validation.ids;
      }

      if (!["admin", "staff", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role." });
      }

      const { user, emailResult } = await createInvitedUser({
        name,
        email,
        role,
        permissions: sanitizePermissions(role, permissions),
        staffType: role === "staff" ? "subject" : null,
        subjectIds: role === "staff" ? validatedSubjectIds : undefined,
        createdBy: req.user.id,
        clientUrl,
      });

      if (role === "staff" && user.subjectIds?.length) {
        await user.populate("subjectIds", "name");
      }

      const devMode = emailResult?.devMode ?? false;
      res.status(201).json({
        ...mapUser(user),
        inviteSent: true,
        delivered: emailResult?.delivered ?? false,
        devMode,
        setupUrl: emailResult?.setupUrl,
        message: devMode
          ? "Account created. Email is not configured — share the setup link below with the user."
          : "Account created. An email has been sent to set up the password and activate panel access.",
      });
    } catch (error) {
      if (error.message === "Email is already registered.") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const { name, email, password, subjectIds } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.role === "superadmin") {
        return res.status(400).json({ message: "Super admin profile cannot be changed." });
      }

      if (name !== undefined) {
        if (!name?.trim()) {
          return res.status(400).json({ message: "Name cannot be empty." });
        }
        user.name = name.trim();
      }

      if (email !== undefined) {
        if (!email?.trim()) {
          return res.status(400).json({ message: "Email cannot be empty." });
        }
        try {
          validateEmailOrThrow(email);
        } catch (validationError) {
          return res.status(400).json({ message: validationError.message });
        }
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail !== user.email) {
          const existing = await User.findOne({ email: normalizedEmail });
          if (existing) {
            return res.status(409).json({ message: "Email is already registered." });
          }
          user.email = normalizedEmail;
        }
      }

      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      if (user.role === "staff") {
        if (subjectIds !== undefined) {
          const validation = await validateSubjectIds(subjectIds);
          if (validation.error) {
            return res.status(400).json({ message: validation.error });
          }
          user.subjectIds = validation.ids;
          user.staffType = "subject";
        } else if (!user.subjectIds?.length) {
          return res.status(400).json({ message: "At least one subject is required for staff." });
        }
      }

      await user.save();
      if (user.subjectIds?.length) {
        await user.populate("subjectIds", "name");
      }
      res.json(mapUser(user));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/access",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive boolean is required." });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.role === "superadmin") {
        return res.status(400).json({ message: "Super admin access cannot be changed." });
      }

      user.isActive = isActive;
      await user.save();

      res.json(mapUser(user));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/permissions",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "permissions array is required." });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.role === "superadmin") {
        return res.status(400).json({ message: "Super admin permissions cannot be changed." });
      }

      user.permissions = sanitizePermissions(user.role, permissions);
      await user.save();

      res.json(mapUser(user));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/resend-invite",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.role === "superadmin") {
        return res.status(400).json({ message: "Super admin cannot receive invites." });
      }

      if (user.emailVerified && user.isActive) {
        return res.status(400).json({ message: "This account is already active." });
      }

      const { clientUrl } = req.body;
      const { emailResult } = await sendSetupInvite(user, panelForRole(user.role), clientUrl);
      res.json({
        message: emailResult?.devMode
          ? "Email is not configured. Share the setup link below with the user."
          : "Invite email sent.",
        inviteSent: true,
        delivered: emailResult?.delivered ?? false,
        devMode: emailResult?.devMode ?? false,
        setupUrl: emailResult?.setupUrl,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.role === "superadmin") {
        return res.status(400).json({ message: "Super admin cannot be deleted." });
      }

      await user.deleteOne();
      res.json({ message: "User deleted." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
