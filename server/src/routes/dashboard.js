import express from "express";
import Upload from "../models/Upload.js";
import Message from "../models/Message.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";

const router = express.Router();

function mapRecentUpload(item) {
  return {
    id: item._id.toString(),
    date: item.date,
    title: item.title || "",
    name: item.name,
    category: item.category,
  };
}

router.get("/stats", authRequired, adminPanelOnly, attachUser, requirePermission("admin:dashboard"), async (_req, res) => {
  try {
    const [totalUploads, activeDays, studentMessages, adminReplies, categoryGroups, recentUploads] =
      await Promise.all([
        Upload.countDocuments(),
        Upload.distinct("date"),
        Message.countDocuments({ senderRole: "student" }),
        Message.countDocuments({ senderRole: { $in: ["admin", "superadmin"] } }),
        Upload.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
        Upload.find().sort({ createdAt: -1 }).limit(5).select("date title name category"),
      ]);

    const categoryCounts = categoryGroups.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      totalUploads,
      activeDays: activeDays.length,
      studentMessages,
      adminReplies,
      categoryCounts,
      recentUploads: recentUploads.map(mapRecentUpload),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/student-stats", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Student panel access required." });
    }

    const [materialCount, studyDays, adminMessages, latestUploads] = await Promise.all([
      Upload.countDocuments(),
      Upload.distinct("date"),
      Message.countDocuments({ senderRole: { $in: ["admin", "superadmin"] } }),
      Upload.find().sort({ createdAt: -1 }).limit(6).select("date title name category"),
    ]);

    res.json({
      materialCount,
      studyDays: studyDays.length,
      adminMessages,
      latestUploads: latestUploads.map(mapRecentUpload),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
