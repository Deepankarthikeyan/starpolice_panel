import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import { authRequired, adminPanelOnly, attachUser, superAdminOnly } from "../middleware/auth.js";
import { defaultPermissionsForRole, sanitizePermissions } from "../permissions.js";

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

function mapUser(user) {
  const subjectRef = user.subjectId;
  const subjectId =
    subjectRef
      ? typeof subjectRef === "object" && subjectRef._id
        ? subjectRef._id.toString()
        : subjectRef.toString()
      : null;
  const subjectName =
    subjectRef && typeof subjectRef === "object" && subjectRef.name ? subjectRef.name : null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    permissions: resolveRolePermissions(user),
    staffType: user.staffType || null,
    subjectId,
    subjectName,
    createdAt: user.createdAt,
  };
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
          .populate("subjectId", "name")
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
      const { name, email, password, role, permissions, staffType, subjectId } = req.body;
      if (!name?.trim() || !email?.trim() || !password || !role) {
        return res.status(400).json({ message: "Name, email, password, and role are required." });
      }

      if (role === "staff") {
        if (!staffType || !["physical", "subject"].includes(staffType)) {
          return res.status(400).json({ message: "Staff type must be physical or subject." });
        }
        if (staffType === "subject") {
          if (!subjectId) {
            return res.status(400).json({ message: "Subject is required for subject staff." });
          }
          const subject = await Subject.findById(subjectId);
          if (!subject) {
            return res.status(400).json({ message: "Selected subject not found." });
          }
        }
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "Email is already registered." });
      }

      if (!["admin", "staff", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role." });
      }

      const hashed = await bcrypt.hash(password, 10);
      const userData = {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashed,
        role,
        isActive: false,
        permissions: sanitizePermissions(role, permissions),
        createdBy: req.user.id,
      };

      if (role === "staff") {
        userData.staffType = staffType;
        userData.subjectId = staffType === "subject" ? subjectId : null;
      }

      const user = await User.create(userData);
      if (role === "staff" && user.subjectId) {
        await user.populate("subjectId", "name");
      }

      res.status(201).json(mapUser(user));
    } catch (error) {
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
      const { name, email, password, staffType, subjectId } = req.body;

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
        if (staffType !== undefined) {
          if (!["physical", "subject"].includes(staffType)) {
            return res.status(400).json({ message: "Staff type must be physical or subject." });
          }
          user.staffType = staffType;
          if (staffType === "physical") {
            user.subjectId = null;
          }
        }

        if (subjectId !== undefined || user.staffType === "subject") {
          const effectiveStaffType = staffType ?? user.staffType;
          if (effectiveStaffType === "subject") {
            const effectiveSubjectId = subjectId ?? user.subjectId?.toString();
            if (!effectiveSubjectId) {
              return res.status(400).json({ message: "Subject is required for subject staff." });
            }
            const subject = await Subject.findById(effectiveSubjectId);
            if (!subject) {
              return res.status(400).json({ message: "Selected subject not found." });
            }
            user.subjectId = effectiveSubjectId;
          }
        }
      }

      await user.save();
      if (user.subjectId) {
        await user.populate("subjectId", "name");
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
