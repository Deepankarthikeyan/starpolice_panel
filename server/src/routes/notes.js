import express from "express";
import Note from "../models/Note.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function mapNote(item) {
  return {
    id: item._id.toString(),
    content: item.content,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

router.get("/", authRequired, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes.map(mapNote));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Note content is required." });
    }

    const note = await Note.create({
      user: req.user.id,
      content: content.trim(),
    });

    res.status(201).json(mapNote(note));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authRequired, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Note content is required." });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { content: content.trim() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json(mapNote(note));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, async (req, res) => {
  try {
    const deleted = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json({ message: "Note deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
