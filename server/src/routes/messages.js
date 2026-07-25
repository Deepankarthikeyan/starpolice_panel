import express from "express";
import Message from "../models/Message.js";
import { authRequired, attachUser } from "../middleware/auth.js";
import { hasAnyPermission } from "../permissions.js";
import { notifyAllAdmins, notifyAllStudents } from "../utils/notifications.js";

const router = express.Router();

function mapMessage(item) {
  return {
    id: item._id.toString(),
    senderRole: item.senderRole,
    senderName: item.senderName,
    senderEmail: item.senderEmail,
    message: item.message,
    createdAt: item.createdAt,
  };
}

router.get("/", authRequired, attachUser, (req, res, next) => {
  const user = req.currentUser;
  if (
    user.role === "superadmin" ||
    hasAnyPermission(user, ["admin:messages", "student:messages", "student:dashboard"])
  ) {
    return next();
  }
  return res.status(403).json({ message: "You do not have permission to view messages." });
}, async (_req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages.map(mapMessage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, attachUser, (req, res, next) => {
  const user = req.currentUser;
  const panel = req.user.panel;
  if (user.role === "superadmin") return next();
  if (panel === "admin" && hasAnyPermission(user, ["admin:messages"])) return next();
  if (panel === "student" && hasAnyPermission(user, ["student:messages"])) return next();
  return res.status(403).json({ message: "You do not have permission to send messages." });
}, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const entry = await Message.create({
      sender: req.user.id,
      senderRole: req.user.role,
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: message.trim(),
    });

    if (req.user.role === "student") {
      await notifyAllAdmins({
        title: "New Student Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (["admin", "superadmin"].includes(req.user.role)) {
      await notifyAllStudents({
        title: "Admin Reply",
        message: message.trim().slice(0, 80),
        type: "message",
      });
    }

    res.status(201).json(mapMessage(entry));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
