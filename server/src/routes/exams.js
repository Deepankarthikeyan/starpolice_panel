import express from "express";
import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import { authRequired, adminPanelOnly, attachUser, superAdminOnly } from "../middleware/auth.js";

const router = express.Router();

function mapExam(exam) {
  const subjectRef = exam.subjectId;
  const subjectId =
    subjectRef
      ? typeof subjectRef === "object" && subjectRef._id
        ? subjectRef._id.toString()
        : subjectRef.toString()
      : null;
  const subjectName =
    subjectRef && typeof subjectRef === "object" && subjectRef.name ? subjectRef.name : null;

  return {
    id: exam._id.toString(),
    name: exam.name,
    examType: exam.examType,
    subjectId,
    subjectName,
    totalMarks: exam.totalMarks,
    isActive: exam.isActive,
    createdAt: exam.createdAt,
  };
}

router.get("/", authRequired, adminPanelOnly, attachUser, async (_req, res) => {
  try {
    const exams = await Exam.find().populate("subjectId", "name").sort({ examType: 1, name: 1 });
    res.json(exams.map(mapExam));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminPanelOnly, attachUser, superAdminOnly, async (req, res) => {
  try {
    const { name, examType, subjectId, totalMarks } = req.body;
    if (!name?.trim() || !examType || !totalMarks) {
      return res.status(400).json({ message: "Name, exam type, and total marks are required." });
    }
    if (!["physical_exam", "written_exam"].includes(examType)) {
      return res.status(400).json({ message: "Exam type must be physical_exam or written_exam." });
    }
    const marks = Number(totalMarks);
    if (!Number.isFinite(marks) || marks <= 0) {
      return res.status(400).json({ message: "Total marks must be a positive number." });
    }

    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(400).json({ message: "Selected subject not found." });
      }
    }

    const exam = await Exam.create({
      name: name.trim(),
      examType,
      subjectId: subjectId || null,
      totalMarks: marks,
      createdBy: req.user.id,
    });
    if (exam.subjectId) {
      await exam.populate("subjectId", "name");
    }
    res.status(201).json(mapExam(exam));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id", authRequired, adminPanelOnly, attachUser, superAdminOnly, async (req, res) => {
  try {
    const { name, examType, subjectId, totalMarks, isActive } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({ message: "Exam name cannot be empty." });
      }
      exam.name = name.trim();
    }

    if (examType !== undefined) {
      if (!["physical_exam", "written_exam"].includes(examType)) {
        return res.status(400).json({ message: "Exam type must be physical_exam or written_exam." });
      }
      exam.examType = examType;
    }

    if (subjectId !== undefined) {
      if (subjectId) {
        const subject = await Subject.findById(subjectId);
        if (!subject) {
          return res.status(400).json({ message: "Selected subject not found." });
        }
        exam.subjectId = subjectId;
      } else {
        exam.subjectId = null;
      }
    }

    if (totalMarks !== undefined) {
      const marks = Number(totalMarks);
      if (!Number.isFinite(marks) || marks <= 0) {
        return res.status(400).json({ message: "Total marks must be a positive number." });
      }
      exam.totalMarks = marks;
    }

    if (typeof isActive === "boolean") {
      exam.isActive = isActive;
    }

    await exam.save();
    if (exam.subjectId) {
      await exam.populate("subjectId", "name");
    }
    res.json(mapExam(exam));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminPanelOnly, attachUser, superAdminOnly, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }
    await exam.deleteOne();
    res.json({ message: "Exam deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
