import express from "express";
import Upload from "../models/Upload.js";
import Message from "../models/Message.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authRequired, adminOnly, async (_req, res) => {
  try {
    const uploads = await Upload.find().select("date category createdAt");
    const messages = await Message.find().select("senderRole createdAt");

    const categoryCounts = uploads.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});

    const calendarCounts = uploads.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] ?? 0) + 1;
      return acc;
    }, {});

    res.json({
      totalUploads: uploads.length,
      activeDays: Object.keys(calendarCounts).length,
      studentMessages: messages.filter((item) => item.senderRole === "student").length,
      adminReplies: messages.filter((item) => item.senderRole === "admin").length,
      categoryCounts,
      recentUploads: uploads
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((item) => ({
          date: item.date,
          category: item.category,
        })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
