import express from "express";
import Alert from "../models/Alert.js";
import { authRequired, adminOnly } from "../middleware/auth.js";
import { notifyAllUsers } from "../utils/notifications.js";

const router = express.Router();

function mapAlert(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    message: item.message,
    category: item.category,
    createdByName: item.createdByName,
    createdAt: item.createdAt,
  };
}

router.get("/", authRequired, async (_req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts.map(mapAlert));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const { title, message, category } = req.body;
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const alert = await Alert.create({
      title: title.trim(),
      message: message.trim(),
      category: category || "general",
      createdBy: req.user.id,
      createdByName: req.user.name,
    });

    await notifyAllUsers({
      title: "New Academy Alert",
      message: title.trim(),
      type: "alert",
    });

    res.status(201).json(mapAlert(alert));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const deleted = await Alert.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Alert not found." });
    }
    res.json({ message: "Alert deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
