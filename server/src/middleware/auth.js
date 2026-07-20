import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function adminPanelOnly(req, res, next) {
  if (!["superadmin", "admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin panel access required." });
  }
  next();
}

export function superAdminOnly(req, res, next) {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required." });
  }
  next();
}

export function studentPanelOnly(req, res, next) {
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Student panel access required." });
  }
  next();
}

export async function attachUser(req, res, next) {
  if (!req.user?.id) return next();
  const user = await User.findById(req.user.id).select("-password");
  req.currentUser = user;
  next();
}
