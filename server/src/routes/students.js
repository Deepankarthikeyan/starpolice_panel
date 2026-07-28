import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";
import { defaultPermissionsForRole, sanitizePermissions } from "../permissions.js";
import { upload } from "../middleware/upload.js";
import {
  applyStudentProfile,
  buildFullName,
  generateStudentId,
  mapStudentProfile,
  setStudentDocument,
} from "../utils/studentProfile.js";

const router = express.Router();

function mapStudent(user) {
  const permissions = user.permissions?.length
    ? user.permissions
    : defaultPermissionsForRole("student");

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    permissions,
    profile: mapStudentProfile(user.studentProfile),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.get(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  async (_req, res) => {
    try {
      const students = await User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(students.map(mapStudent));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  async (req, res) => {
    try {
      const student = await User.findOne({ _id: req.params.id, role: "student" }).select("-password");
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
      res.json(mapStudent(student));
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
  requirePermission("admin:onboarding"),
  async (req, res) => {
    try {
      const { email, password, profile, permissions } = req.body;
      const profileData = profile || {};

      if (!profileData.firstName?.trim() || !profileData.lastName?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
          message: "First name, last name, email, and password are required.",
        });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "Email is already registered." });
      }

      if (profileData.username?.trim()) {
        const usernameTaken = await User.findOne({
          "studentProfile.username": profileData.username.trim().toLowerCase(),
        });
        if (usernameTaken) {
          return res.status(409).json({ message: "Username is already taken." });
        }
      }

      const fullName = buildFullName(profileData);
      const studentId = await generateStudentId();
      const hashed = await bcrypt.hash(password, 10);

      const user = new User({
        name: fullName,
        email: email.toLowerCase(),
        password: hashed,
        role: "student",
        isActive: false,
        permissions: sanitizePermissions("student", permissions),
        createdBy: req.user.id,
      });

      applyStudentProfile(user, profileData);
      user.studentProfile.studentId = studentId;
      await user.save();

      res.status(201).json(mapStudent(user));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  async (req, res) => {
    try {
      const { email, password, profile, isActive } = req.body;
      const student = await User.findOne({ _id: req.params.id, role: "student" });
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }

      if (profile) {
        if (profile.username?.trim()) {
          const usernameTaken = await User.findOne({
            "studentProfile.username": profile.username.trim().toLowerCase(),
            _id: { $ne: student._id },
          });
          if (usernameTaken) {
            return res.status(409).json({ message: "Username is already taken." });
          }
        }

        applyStudentProfile(student, profile);
        const fullName = buildFullName(student.studentProfile);
        if (fullName) {
          student.name = fullName;
        }
      }

      if (email?.trim()) {
        const normalizedEmail = email.toLowerCase().trim();
        const duplicate = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: student._id },
        });
        if (duplicate) {
          return res.status(409).json({ message: "Email is already registered." });
        }
        student.email = normalizedEmail;
      }

      if (password) {
        student.password = await bcrypt.hash(password, 10);
      }

      if (typeof isActive === "boolean") {
        student.isActive = isActive;
      }

      await student.save();
      res.json(mapStudent(student));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/:id/upload",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { field } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: "File is required." });
      }
      if (!field) {
        return res.status(400).json({ message: "Field name is required." });
      }

      const student = await User.findOne({ _id: req.params.id, role: "student" });
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      setStudentDocument(student, field, fileUrl);
      await student.save();

      res.json({
        field,
        fileUrl,
        profile: mapStudentProfile(student.studentProfile),
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
  requirePermission("admin:onboarding"),
  async (req, res) => {
    try {
      const student = await User.findOne({ _id: req.params.id, role: "student" });
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }

      await student.deleteOne();
      res.json({ message: "Student deleted." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
