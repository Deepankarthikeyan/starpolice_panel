import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { defaultPermissionsForRole } from "../permissions.js";

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

function createToken(user, panel) {
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
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user, token, panel) {
  const permissions = resolveRolePermissions(user);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    permissions,
    panel,
    token,
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

router.get("/setup", async (_req, res) => {
  try {
    const superAdminCount = await User.countDocuments({ role: "superadmin" });
    res.json({ needsSuperAdmin: superAdminCount === 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/register", async (req, res) => {
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

    const token = createToken(user, "admin");
    res.status(201).json(publicUser(user, token, "admin"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, panel } = req.body;
    if (!email || !password || !panel) {
      return res.status(400).json({ message: "Email, password, and panel are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
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

    const token = createToken(user, panel);
    res.json(publicUser(user, token, panel));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const permissions = resolveRolePermissions(user);

  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    permissions,
    panel: req.user.panel,
  });
});

export default router;
