import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user, token) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
}

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials for the selected panel." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials for the selected panel." });
    }

    const token = createToken(user);
    res.json(publicUser(user, token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }
  res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

export default router;
