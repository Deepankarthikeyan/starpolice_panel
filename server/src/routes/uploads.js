import express from "express";
import Upload from "../models/Upload.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";
import { hasAnyPermission } from "../permissions.js";
import { upload } from "../middleware/upload.js";
import { notifyAllStudents } from "../utils/notifications.js";

const router = express.Router();

function mapUpload(item) {
  return {
    id: item._id.toString(),
    date: item.date,
    title: item.title || "",
    name: item.name,
    category: item.category,
    fileUrl: item.fileUrl,
    mimeType: item.mimeType,
    uploadedAt: item.createdAt,
    uploadedBy: item.uploadedByName,
  };
}

function detectCategory(mimeType, originalName) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || originalName.endsWith(".pdf")) return "pdf";
  return "document";
}

router.get("/", authRequired, attachUser, (req, res, next) => {
  const user = req.currentUser;
  if (
    user.role === "superadmin" ||
    hasAnyPermission(user, [
      "admin:uploads",
      "admin:calendar",
      "student:materials",
      "student:calendar",
      "student:dashboard",
    ])
  ) {
    return next();
  }
  return res.status(403).json({ message: "You do not have permission to view uploads." });
}, async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;

    const uploads = await Upload.find(filter).sort({ createdAt: -1 });
    res.json(uploads.map(mapUpload));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminPanelOnly, attachUser, requirePermission("admin:uploads"), upload.array("files", 10), async (req, res) => {
  try {
    const { date, category, title } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    const saved = [];
    for (const file of req.files || []) {
      const entry = await Upload.create({
        date,
        title: title.trim(),
        name: file.originalname,
        category: category || detectCategory(file.mimetype, file.originalname),
        fileName: file.filename,
        mimeType: file.mimetype,
        fileUrl: `/uploads/${file.filename}`,
        uploadedBy: req.user.id,
        uploadedByName: req.user.name,
      });
      saved.push(mapUpload(entry));
    }

    if (saved.length) {
      await notifyAllStudents({
        title: "New Study Material",
        message: `${saved.length} file(s) uploaded for ${date}`,
        type: "upload",
      });
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminPanelOnly, attachUser, requirePermission("admin:uploads"), async (req, res) => {
  try {
    const deleted = await Upload.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Upload not found." });
    }
    res.json({ message: "Upload deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
