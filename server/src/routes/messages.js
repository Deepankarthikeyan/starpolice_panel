import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { authRequired, attachUser } from "../middleware/auth.js";
import { hasAnyPermission } from "../permissions.js";
import { notifyAllAdmins, notifyAllStudents, notifyUsers } from "../utils/notifications.js";

const router = express.Router();

function mapMessage(item) {
  return {
    id: item._id.toString(),
    senderRole: item.senderRole,
    senderName: item.senderName,
    senderEmail: item.senderEmail,
    message: item.message,
    channel: item.channel || "group",
    threadStudentId: item.threadStudentId ? item.threadStudentId.toString() : null,
    createdAt: item.createdAt,
  };
}

function canViewMessages(user) {
  return (
    user.role === "superadmin" ||
    hasAnyPermission(user, ["admin:messages", "student:messages", "student:dashboard"])
  );
}

function canSendMessages(user, panel) {
  if (user.role === "superadmin") return true;
  if ((panel === "admin" || panel === "staff") && hasAnyPermission(user, ["admin:messages"])) {
    return true;
  }
  if (panel === "student" && hasAnyPermission(user, ["student:messages"])) return true;
  return false;
}

router.get("/", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    if (!canViewMessages(user)) {
      return res.status(403).json({ message: "You do not have permission to view messages." });
    }

    const channel = req.query.channel === "private" ? "private" : "group";
    const filter = { channel };

    if (channel === "private") {
      if (user.role === "student") {
        filter.threadStudentId = user._id;
      } else {
        const studentUserId = req.query.studentUserId;
        if (!studentUserId) {
          return res.status(400).json({ message: "studentUserId is required for private messages." });
        }
        const student = await User.findOne({ _id: studentUserId, role: "student" }).select("_id");
        if (!student) {
          return res.status(404).json({ message: "Student not found." });
        }
        filter.threadStudentId = student._id;
      }
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 }).limit(200);
    res.json(messages.map(mapMessage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    const panel = req.user.panel;
    if (!canSendMessages(user, panel)) {
      return res.status(403).json({ message: "You do not have permission to send messages." });
    }

    const { message, channel = "group", studentUserId } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const resolvedChannel = channel === "private" ? "private" : "group";
    let threadStudentId = null;

    if (resolvedChannel === "private") {
      if (user.role === "student") {
        threadStudentId = user._id;
      } else {
        if (!studentUserId) {
          return res.status(400).json({ message: "studentUserId is required for private messages." });
        }
        const student = await User.findOne({ _id: studentUserId, role: "student" }).select("_id name");
        if (!student) {
          return res.status(404).json({ message: "Student not found." });
        }
        threadStudentId = student._id;
      }
    }

    const entry = await Message.create({
      sender: req.user.id,
      senderRole: req.user.role,
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: message.trim(),
      channel: resolvedChannel,
      threadStudentId,
    });

    if (user.role === "student") {
      await notifyAllAdmins({
        title: "New Student Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (resolvedChannel === "group") {
      await notifyAllStudents({
        title: "Group Message",
        message: message.trim().slice(0, 80),
        type: "message",
      });
    } else if (threadStudentId) {
      await notifyUsers([threadStudentId], {
        title: "Private Message",
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
