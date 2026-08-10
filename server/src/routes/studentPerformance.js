import express from "express";
import StudentPerformance from "../models/StudentPerformance.js";
import StudentOnboarding from "../models/StudentOnboarding.js";
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

function mergeEventsWithDefaults(saved = []) {
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

  return ALL_EVENTS.map((definition) => {
    const existing = byKey.get(definition.eventKey);
    return existing
      ? { ...existing }
      : {
          eventKey: definition.eventKey,
          performance: definition.benchmark,
          singleStar: "",
          doubleStar: "",
          remarks: "",
        };
  });
}

function defaultEvents() {
  return mergeEventsWithDefaults();
}

function fullStudentName(student) {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
}

function mapPerformance(item, student) {
  return {
    id: item._id.toString(),
    studentOnboardingId: item.studentOnboardingId.toString(),
    userId: item.userId?.toString() || null,
    cardType: item.cardType,
    recordYear: item.recordYear,
    age: item.age,
    heightCm: item.heightCm,
    weightKg: item.weightKg,
    chestNormalCm: item.chestNormalCm,
    chestExpansionCm: item.chestExpansionCm,
    events: mergeEventsWithDefaults(item.events || []),
    attendancePresent: item.attendancePresent,
    attendanceAbsent: item.attendanceAbsent,
    attendanceLeave: item.attendanceLeave,
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
    age: body.age || "",
    heightCm: body.heightCm || "",
    weightKg: body.weightKg || "",
    chestNormalCm: body.chestNormalCm || "",
    chestExpansionCm: body.chestExpansionCm || "",
    events: Array.isArray(body.events) ? body.events : [],
    attendancePresent: body.attendancePresent || "",
    attendanceAbsent: body.attendanceAbsent || "",
    attendanceLeave: body.attendanceLeave || "",
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

    const rows = students.map((student) => {
      const performance = performanceByStudent.get(student._id.toString());
      return {
        studentOnboardingId: student._id.toString(),
        studentId: student.studentId,
        fullName: fullStudentName(student),
        batch: student.batch,
        gender: student.gender,
        userId: student.userId?.toString() || null,
        cardType: performance?.cardType || getCardTypeFromGender(student.gender),
        overallPerformance: performance?.overallPerformance || "",
        hasRecord: Boolean(performance),
        performanceId: performance?._id.toString() || null,
        updatedAt: performance?.updatedAt || null,
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
    payload.events = mergeEventsWithDefaults(payload.events);

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
