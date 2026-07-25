import express from "express";
import Notification from "../models/Notification.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function mapNotification(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    message: item.message,
    type: item.type,
    read: item.read,
    createdAt: item.createdAt,
  };
}

router.get("/summary", authRequired, async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);
    res.json({
      items: notifications.map(mapNotification),
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications.map(mapNotification));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/unread-count", authRequired, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/read-all", authRequired, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/read", authRequired, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json(mapNotification(notification));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
