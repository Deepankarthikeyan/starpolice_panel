import express from "express";
import StudentPerformance from "../models/StudentPerformance.js";
import StudentOnboarding from "../models/StudentOnboarding.js";
import StudentAttendance from "../models/StudentAttendance.js";
import Exam from "../models/Exam.js";
import StudentExamMark from "../models/StudentExamMark.js";
import {
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission,
} from "../middleware/auth.js";

const router = express.Router();

const adminGuard = [
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:performance"),
];

const FEMALE_EVENTS = [
  { eventKey: "400mts_run", label: "400mts Run sec", benchmark: "2min 30 sec qualified" },
  { eventKey: "long_jump", label: "Long Jump m", benchmark: "3.75 / 3 m" },
  { eventKey: "ball_throw", label: "Ball Throw", benchmark: "24m / 17m" },
  { eventKey: "shot_put", label: "shot put", benchmark: "5.50m / 4.25m" },
  {
    eventKey: "sprint_200_100",
    label: "200m Run sec / 100m Run sec",
    benchmark: "33.00sec / 38.00sec — 15.50sec / 17.50sec",
  },
];

const MALE_EVENTS = [
  { eventKey: "run_1500mts", label: "1500mts Run sec", benchmark: "7min qualified" },
  { eventKey: "rope_climbing", label: "Rope Climbing", benchmark: "6m / 5m" },
  {
    eventKey: "jump_long_high",
    label: "Long Jump m / High Jump",
    benchmark: "4.50 / 3.80m — 1.40 / 1.20m",
  },
  {
    eventKey: "sprint_100_400",
    label: "100m Run sec / 400m Run sec",
    benchmark: "13.50 / 15.50sec — 70 / 80sec",
  },
];

const ALL_EVENTS = [...FEMALE_EVENTS, ...MALE_EVENTS];

function getCardTypeFromGender(gender = "") {
  const value = gender.toLowerCase();
  if (value.includes("female") || value === "f" || value.includes("woman") || value.includes("girl")) {
    return "female";
  }
  return "male";
}

function getEventDefinitions(cardType = "all") {
  if (cardType === "female") return FEMALE_EVENTS;
  if (cardType === "male") return MALE_EVENTS;
  return ALL_EVENTS;
}

function mergeEventsWithDefaults(saved = [], cardType = "all") {
  const definitions = getEventDefinitions(cardType);
  const byKey = new Map(saved.map((event) => [event.eventKey, event]));
  const legacySprint = byKey.get("sprint_run");
  if (legacySprint) {
    if (!byKey.has("sprint_200_100")) {
      byKey.set("sprint_200_100", { ...legacySprint, eventKey: "sprint_200_100" });
    }
    if (!byKey.has("sprint_100_400")) {
      byKey.set("sprint_100_400", { ...legacySprint, eventKey: "sprint_100_400" });
    }
    byKey.delete("sprint_run");
  }

  return definitions.map((definition) => {
    const existing = byKey.get(definition.eventKey);
    return existing
      ? { ...existing }
      : {
          eventKey: definition.eventKey,
          performance: "",
          singleStar: "",
          doubleStar: "",
          remarks: "",
        };
  });
}

function defaultEvents(cardType = "all") {
  return mergeEventsWithDefaults([], cardType);
}

function fullStudentName(student) {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
}

function isStarChecked(value) {
  return value === "1" || value === "true" || (typeof value === "string" && value.trim() !== "");
}

function computeExamPercent(exams, marksByExamId) {
  const activeExams = exams.filter((exam) => exam.isActive);
  let scored = 0;
  let total = 0;
  activeExams.forEach((exam) => {
    const mark = marksByExamId.get(exam._id.toString());
    const examTotal = Number(exam.totalMarks) || 0;
    if (!examTotal) return;
    total += examTotal;
    scored += Math.min(Number(mark?.scoredMarks) || 0, examTotal);
  });
  if (!total) return null;
  return Math.round((scored / total) * 100);
}

function computeAttendancePercent(records) {
  const total = records.length;
  if (!total) return null;
  const present = records.filter((item) => item.status === "present" || item.status === "late").length;
  return Math.round((present / total) * 100);
}

function computeOverallPercent(attendancePercent, physicalExamPercent, writtenExamPercent, physicalRating) {
  const values = [];
  if (attendancePercent !== null) values.push(attendancePercent);
  if (physicalExamPercent !== null) values.push(physicalExamPercent);
  if (writtenExamPercent !== null) values.push(writtenExamPercent);
  if (physicalRating) {
    const ratingMap = { excellent: 95, very_good: 85, good: 75, average: 65 };
    values.push(ratingMap[physicalRating] || 0);
  }
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function mapExamMark(mark, exam) {
  return {
    id: mark._id.toString(),
    examId: mark.examId.toString(),
    examName: exam?.name || "",
    examType: exam?.examType || "",
    subjectName: exam?.subjectId?.name || null,
    totalMarks: exam?.totalMarks || 0,
    scoredMarks: mark.scoredMarks,
    remarks: mark.remarks || "",
  };
}

function mapPerformance(item, student) {
  return {
    id: item._id.toString(),
    studentOnboardingId: item.studentOnboardingId.toString(),
    userId: item.userId?.toString() || null,
    cardType: item.cardType,
    recordYear: item.recordYear,
    recordDate: item.recordDate || new Date().toISOString().slice(0, 10),
    age: item.age,
    heightCm: item.heightCm,
    weightKg: item.weightKg,
    chestNormalCm: item.chestNormalCm,
    chestExpansionCm: item.chestExpansionCm,
    events: mergeEventsWithDefaults(item.events || [], item.cardType),
    overallPerformance: item.overallPerformance,
    trainerRemarks: item.trainerRemarks,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    student: student
      ? {
          studentId: student.studentId,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          fullName: fullStudentName(student),
          batch: student.batch,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
        }
      : null,
  };
}

function pickPerformanceFields(body) {
  return {
    cardType: body.cardType,
    recordYear: body.recordYear ? Number(body.recordYear) : new Date().getFullYear(),
    recordDate: body.recordDate || new Date().toISOString().slice(0, 10),
    age: body.age || "",
    heightCm: body.heightCm || "",
    weightKg: body.weightKg || "",
    chestNormalCm: body.chestNormalCm || "",
    chestExpansionCm: body.chestExpansionCm || "",
    events: Array.isArray(body.events) ? body.events : [],
    overallPerformance: body.overallPerformance || "",
    trainerRemarks: body.trainerRemarks || "",
  };
}

router.get("/event-definitions", authRequired, (_req, res) => {
  res.json({ female: FEMALE_EVENTS, male: MALE_EVENTS, all: ALL_EVENTS });
});

router.get("/students", adminGuard, async (_req, res) => {
  try {
    const students = await StudentOnboarding.find().sort({ createdAt: -1 });
    const performances = await StudentPerformance.find();
    const performanceByStudent = new Map(
      performances.map((item) => [item.studentOnboardingId.toString(), item])
    );
    const exams = await Exam.find({ isActive: true });
    const physicalExams = exams.filter((exam) => exam.examType === "physical_exam");
    const writtenExams = exams.filter((exam) => exam.examType === "written_exam");
    const allMarks = await StudentExamMark.find();
    const marksByStudent = new Map();
    allMarks.forEach((mark) => {
      const studentId = mark.studentOnboardingId.toString();
      if (!marksByStudent.has(studentId)) {
        marksByStudent.set(studentId, new Map());
      }
      marksByStudent.get(studentId).set(mark.examId.toString(), mark);
    });
    const attendanceRecords = await StudentAttendance.find();
    const attendanceByStudent = new Map();
    attendanceRecords.forEach((record) => {
      const studentId = record.studentOnboardingId.toString();
      if (!attendanceByStudent.has(studentId)) {
        attendanceByStudent.set(studentId, []);
      }
      attendanceByStudent.get(studentId).push(record);
    });

    const rows = students.map((student) => {
      const studentId = student._id.toString();
      const performance = performanceByStudent.get(studentId);
      const studentMarks = marksByStudent.get(studentId) || new Map();
      const studentAttendance = attendanceByStudent.get(studentId) || [];
      const attendancePercent = computeAttendancePercent(studentAttendance);
      const physicalExamPercent = computeExamPercent(physicalExams, studentMarks);
      const writtenExamPercent = computeExamPercent(writtenExams, studentMarks);
      const overallPercent = computeOverallPercent(
        attendancePercent,
        physicalExamPercent,
        writtenExamPercent,
        performance?.overallPerformance
      );

      return {
        studentOnboardingId: studentId,
        studentId: student.studentId,
        fullName: fullStudentName(student),
        batch: student.batch,
        gender: student.gender,
        mobileNumber: student.mobileNumber || "",
        userId: student.userId?.toString() || null,
        cardType: performance?.cardType || getCardTypeFromGender(student.gender),
        overallPerformance: performance?.overallPerformance || "",
        hasRecord: Boolean(performance),
        performanceId: performance?._id.toString() || null,
        updatedAt: performance?.updatedAt || null,
        attendancePercent,
        attendanceTotal: studentAttendance.length,
        physicalExamPercent,
        writtenExamPercent,
        overallPercent,
      };
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authRequired, attachUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "student") {
      return res.status(403).json({ message: "Student panel access required." });
    }

    const student = await StudentOnboarding.findOne({ userId: req.currentUser._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const performance = await StudentPerformance.findOne({ studentOnboardingId: student._id });
    if (!performance) {
      return res.json({
        hasRecord: false,
        student: {
          studentOnboardingId: student._id.toString(),
          studentId: student.studentId,
          fullName: fullStudentName(student),
          batch: student.batch,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
        },
        cardType: getCardTypeFromGender(student.gender),
        events: defaultEvents(getCardTypeFromGender(student.gender)),
      });
    }

    res.json({ hasRecord: true, ...mapPerformance(performance, student) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function buildStudentPerformanceDetail(student) {
  const performance = await StudentPerformance.findOne({ studentOnboardingId: student._id });
  const exams = await Exam.find({ isActive: true })
    .populate("subjectId", "name")
    .sort({ examType: 1, name: 1 });
  const marks = await StudentExamMark.find({ studentOnboardingId: student._id });
  const marksByExamId = new Map(marks.map((mark) => [mark.examId.toString(), mark]));
  const attendanceRecords = await StudentAttendance.find({ studentOnboardingId: student._id });

  const physicalExams = exams.filter((exam) => exam.examType === "physical_exam");
  const writtenExams = exams.filter((exam) => exam.examType === "written_exam");
  const attendancePercent = computeAttendancePercent(attendanceRecords);
  const physicalExamPercent = computeExamPercent(physicalExams, marksByExamId);
  const writtenExamPercent = computeExamPercent(writtenExams, marksByExamId);
  const overallPercent = computeOverallPercent(
    attendancePercent,
    physicalExamPercent,
    writtenExamPercent,
    performance?.overallPerformance
  );

  const cardType = performance?.cardType || getCardTypeFromGender(student.gender);
  const performancePayload = performance
    ? { hasRecord: true, ...mapPerformance(performance, student) }
    : {
        hasRecord: false,
        studentOnboardingId: student._id.toString(),
        userId: student.userId?.toString() || null,
        cardType,
        recordYear: new Date().getFullYear(),
        events: defaultEvents(cardType),
        student: {
          studentId: student.studentId,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          fullName: fullStudentName(student),
          batch: student.batch,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
        },
      };

  const mapExamWithMark = (exam) => {
    const mark = marksByExamId.get(exam._id.toString());
    return {
      examId: exam._id.toString(),
      name: exam.name,
      examType: exam.examType,
      subjectName: exam.subjectId?.name || null,
      totalMarks: exam.totalMarks,
      scoredMarks: mark?.scoredMarks ?? "",
      remarks: mark?.remarks || "",
      markId: mark?._id.toString() || null,
    };
  };

  return {
    student: {
      studentOnboardingId: student._id.toString(),
      studentId: student.studentId,
      fullName: fullStudentName(student),
      batch: student.batch,
      gender: student.gender,
      mobileNumber: student.mobileNumber || "",
      dateOfBirth: student.dateOfBirth,
    },
    summary: {
      attendancePercent,
      attendanceTotal: attendanceRecords.length,
      attendancePresent: attendanceRecords.filter(
        (item) => item.status === "present" || item.status === "late"
      ).length,
      physicalExamPercent,
      writtenExamPercent,
      overallPercent,
      overallPerformance: performance?.overallPerformance || "",
    },
    attendance: attendanceRecords
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((item) => ({ date: item.date, status: item.status })),
    physicalExams: physicalExams.map(mapExamWithMark),
    writtenExams: writtenExams.map(mapExamWithMark),
    performance: performancePayload,
  };
}

router.get("/me/detail", authRequired, attachUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "student") {
      return res.status(403).json({ message: "Student panel access required." });
    }

    const student = await StudentOnboarding.findOne({ userId: req.currentUser._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    res.json(await buildStudentPerformanceDetail(student));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/by-student/:studentOnboardingId/detail", adminGuard, async (req, res) => {
  try {
    const student = await StudentOnboarding.findById(req.params.studentOnboardingId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(await buildStudentPerformanceDetail(student));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/by-student/:studentOnboardingId/exam-marks", adminGuard, async (req, res) => {
  try {
    const student = await StudentOnboarding.findById(req.params.studentOnboardingId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const marks = Array.isArray(req.body.marks) ? req.body.marks : [];
    for (const entry of marks) {
      if (!entry?.examId) {
        return res.status(400).json({ message: "Each mark entry needs an examId." });
      }
      const exam = await Exam.findById(entry.examId);
      if (!exam) {
        return res.status(400).json({ message: "One or more exams were not found." });
      }
      const scored = Number(entry.scoredMarks);
      if (!Number.isFinite(scored) || scored < 0 || scored > exam.totalMarks) {
        return res.status(400).json({
          message: `Marks for ${exam.name} must be between 0 and ${exam.totalMarks}.`,
        });
      }
    }

    await Promise.all(
      marks.map((entry) =>
        StudentExamMark.findOneAndUpdate(
          { studentOnboardingId: student._id, examId: entry.examId },
          {
            studentOnboardingId: student._id,
            examId: entry.examId,
            scoredMarks: Number(entry.scoredMarks),
            remarks: entry.remarks || "",
            updatedBy: req.currentUser._id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.json({ message: "Exam marks saved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/by-student/:studentOnboardingId", adminGuard, async (req, res) => {
  try {
    const student = await StudentOnboarding.findById(req.params.studentOnboardingId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const performance = await StudentPerformance.findOne({ studentOnboardingId: student._id });
    if (!performance) {
      const cardType = getCardTypeFromGender(student.gender);
      return res.json({
        hasRecord: false,
        studentOnboardingId: student._id.toString(),
        userId: student.userId?.toString() || null,
        cardType,
        recordYear: new Date().getFullYear(),
        events: defaultEvents(cardType),
        student: {
          studentId: student.studentId,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          fullName: fullStudentName(student),
          batch: student.batch,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
        },
      });
    }

    res.json({ hasRecord: true, ...mapPerformance(performance, student) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/by-student/:studentOnboardingId", adminGuard, async (req, res) => {
  try {
    const student = await StudentOnboarding.findById(req.params.studentOnboardingId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const payload = pickPerformanceFields(req.body);
    const cardType = payload.cardType || getCardTypeFromGender(student.gender);
    payload.events = mergeEventsWithDefaults(payload.events, cardType);

    const performance = await StudentPerformance.findOneAndUpdate(
      { studentOnboardingId: student._id },
      {
        ...payload,
        cardType,
        studentOnboardingId: student._id,
        userId: student.userId || null,
        updatedBy: req.currentUser._id,
        $setOnInsert: { createdBy: req.currentUser._id },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(mapPerformance(performance, student));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/by-student/:studentOnboardingId", adminGuard, async (req, res) => {
  try {
    const result = await StudentPerformance.findOneAndDelete({
      studentOnboardingId: req.params.studentOnboardingId,
    });
    if (!result) {
      return res.status(404).json({ message: "Performance record not found." });
    }
    res.json({ message: "Performance record deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
