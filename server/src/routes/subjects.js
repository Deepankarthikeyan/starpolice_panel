import express from "express";
import Subject from "../models/Subject.js";
import { authRequired, adminPanelOnly, attachUser, superAdminOnly } from "../middleware/auth.js";

const router = express.Router();

function mapSubject(subject) {
  return {
    id: subject._id.toString(),
    name: subject.name,
    isActive: subject.isActive,
    createdAt: subject.createdAt,
  };
}

router.get("/", authRequired, adminPanelOnly, attachUser, async (_req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects.map(mapSubject));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminPanelOnly, attachUser, superAdminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Subject name is required." });
    }

    const normalizedName = name.trim();
    const existing = await Subject.findOne({
      name: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({ message: "Subject already exists." });
    }

    const subject = await Subject.create({
      name: normalizedName,
      createdBy: req.user.id,
    });

    res.status(201).json(mapSubject(subject));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authRequired, adminPanelOnly, attachUser, superAdminOnly, async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ message: "Subject name cannot be empty." });
      }
      const normalizedName = name.trim();
      const existing = await Subject.findOne({
        name: { $regex: new RegExp(`^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        _id: { $ne: subject._id },
      });
      if (existing) {
        return res.status(409).json({ message: "Subject already exists." });
      }
      subject.name = normalizedName;
    }

    if (typeof isActive === "boolean") {
      subject.isActive = isActive;
    }

    await subject.save();
    res.json(mapSubject(subject));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminPanelOnly, attachUser, superAdminOnly, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    await subject.deleteOne();
    res.json({ message: "Subject deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
