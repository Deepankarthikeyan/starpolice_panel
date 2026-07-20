import express from "express";
import Message from "../models/Message.js";
import { authRequired } from "../middleware/auth.js";

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

router.get("/", authRequired, async (_req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages.map(mapMessage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, async (req, res) => {
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

    res.status(201).json(mapMessage(entry));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
