import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { authRequired, adminPanelOnly, superAdminOnly } from "../middleware/auth.js";

const router = express.Router();

function mapUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.role === "superadmin" ? true : user.isActive,
    createdAt: user.createdAt,
  };
}

router.get("/", authRequired, adminPanelOnly, async (req, res) => {
  try {
    const { type } = req.query;

    if (type === "admin") {
      if (req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Only super admin can list admins." });
      }
      const users = await User.find({ role: { $in: ["admin", "superadmin"] } })
        .select("-password")
        .sort({ createdAt: -1 });
      return res.json(users.map(mapUser));
    }

    if (type === "student") {
      const users = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
      return res.json(users.map(mapUser));
    }

    return res.status(400).json({ message: "Query type must be admin or student." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminPanelOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    if (role === "admin") {
      if (req.user.role !== "superadmin") {
        return res.status(403).json({ message: "Only super admin can create admin accounts." });
      }
    } else if (role === "student") {
      if (!["superadmin", "admin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin access required." });
      }
    } else {
      return res.status(400).json({ message: "Invalid role." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      role,
      isActive: false,
      createdBy: req.user.id,
    });

    res.status(201).json(mapUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/access", authRequired, adminPanelOnly, async (req, res) => {
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

    if (user.role === "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only super admin can manage admin access." });
    }

    if (user.role === "student" && !["superadmin", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admin access required." });
    }

    user.isActive = isActive;
    await user.save();

    res.json(mapUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminPanelOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({ message: "Super admin cannot be deleted." });
    }

    if (user.role === "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only super admin can delete admin accounts." });
    }

    await user.deleteOne();
    res.json({ message: "User deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
