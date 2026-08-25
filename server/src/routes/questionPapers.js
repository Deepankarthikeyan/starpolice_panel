import express from "express";
import Alert from "../models/Alert.js";
import QuestionPaper from "../models/QuestionPaper.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";
import { hasAnyPermission } from "../permissions.js";
import { upload } from "../middleware/upload.js";
import { notifyAllUsers } from "../utils/notifications.js";

const router = express.Router();

function mapQuestionPaper(item) {
  return {
    id: item._id.toString(),
    paperName: item.paperName,
    date: item.date,
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
  if (mimeType === "application/pdf" || originalName.endsWith(".pdf")) return "pdf";
  return "document";
}

router.get(
  "/",
  authRequired,
  attachUser,
  (req, res, next) => {
    const user = req.currentUser;
    if (
      user.role === "superadmin" ||
      hasAnyPermission(user, ["admin:questions", "student:questions"])
    ) {
      return next();
    }
    return res.status(403).json({ message: "You do not have permission to view question papers." });
  },
  async (req, res) => {
    try {
      const filter = {};
      if (req.query.date) filter.date = req.query.date;

      const papers = await QuestionPaper.find(filter).sort({ createdAt: -1 }).limit(1000);
      res.json(papers.map(mapQuestionPaper));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:questions"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { paperName, date } = req.body;
      const file = req.file;

      if (!paperName?.trim()) {
        return res.status(400).json({ message: "Question paper name is required." });
      }
      if (!date) {
        return res.status(400).json({ message: "Date is required." });
      }
      if (!file) {
        return res.status(400).json({ message: "File is required." });
      }

      const entry = await QuestionPaper.create({
        paperName: paperName.trim(),
        date,
        name: file.originalname,
        category: detectCategory(file.mimetype, file.originalname),
        fileName: file.filename,
        mimeType: file.mimetype,
        fileUrl: `/uploads/${file.filename}`,
        uploadedBy: req.user.id,
        uploadedByName: req.user.name,
      });

      const alertTitle = "New Question Paper Uploaded";
      const alertMessage = `${paperName.trim()} has been uploaded for ${date}.`;

      await Alert.create({
        title: alertTitle,
        message: alertMessage,
        category: "general",
        createdBy: req.user.id,
        createdByName: req.user.name,
      });

      await notifyAllUsers({
        title: alertTitle,
        message: alertMessage,
        type: "upload",
      });

      res.status(201).json(mapQuestionPaper(entry));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:questions"),
  upload.single("file"),
  async (req, res) => {
    try {
      const paper = await QuestionPaper.findById(req.params.id);
      if (!paper) {
        return res.status(404).json({ message: "Question paper not found." });
      }

      const { paperName, date } = req.body;
      if (paperName?.trim()) paper.paperName = paperName.trim();
      if (date) paper.date = date;

      if (req.file) {
        paper.name = req.file.originalname;
        paper.category = detectCategory(req.file.mimetype, req.file.originalname);
        paper.fileName = req.file.filename;
        paper.mimeType = req.file.mimetype;
        paper.fileUrl = `/uploads/${req.file.filename}`;
      }

      await paper.save();
      res.json(mapQuestionPaper(paper));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:questions"),
  async (req, res) => {
    try {
      const deleted = await QuestionPaper.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Question paper not found." });
      }
      res.json({ message: "Question paper deleted." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
