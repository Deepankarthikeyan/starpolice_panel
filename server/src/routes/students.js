import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";
import { defaultPermissionsForRole, sanitizePermissions } from "../permissions.js";

const router = express.Router();

function mapStudentProfile(profile = {}) {
  return {
    phone: profile.phone || "",
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : "",
    gender: profile.gender || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
    guardianName: profile.guardianName || "",
    guardianPhone: profile.guardianPhone || "",
    enrollmentNumber: profile.enrollmentNumber || "",
    batch: profile.batch || "",
    course: profile.course || "",
    enrollmentDate: profile.enrollmentDate
      ? new Date(profile.enrollmentDate).toISOString().slice(0, 10)
      : "",
    remarks: profile.remarks || "",
  };
}

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

function applyProfile(user, profile = {}) {
  if (!user.studentProfile) {
    user.studentProfile = {};
  }

  const fields = [
    "phone",
    "gender",
    "address",
    "city",
    "state",
    "pincode",
    "guardianName",
    "guardianPhone",
    "enrollmentNumber",
    "batch",
    "course",
    "remarks",
  ];

  fields.forEach((field) => {
    if (profile[field] !== undefined) {
      user.studentProfile[field] = String(profile[field] || "").trim();
    }
  });

  if (profile.dateOfBirth !== undefined) {
    user.studentProfile.dateOfBirth = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
  }

  if (profile.enrollmentDate !== undefined) {
    user.studentProfile.enrollmentDate = profile.enrollmentDate
      ? new Date(profile.enrollmentDate)
      : null;
  }
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
      const { name, email, password, profile, permissions } = req.body;
      if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
      }

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: "Email is already registered." });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashed,
        role: "student",
        isActive: false,
        permissions: sanitizePermissions("student", permissions),
        createdBy: req.user.id,
      });

      applyProfile(user, profile);
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
      const { name, email, password, profile, isActive } = req.body;
      const student = await User.findOne({ _id: req.params.id, role: "student" });
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }

      if (name?.trim()) {
        student.name = name.trim();
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

      if (profile) {
        applyProfile(student, profile);
      }

      await student.save();
      res.json(mapStudent(student));
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
