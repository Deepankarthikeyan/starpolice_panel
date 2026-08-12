import express from "express";
import StudentAttendance, { ATTENDANCE_STATUSES } from "../models/StudentAttendance.js";
import StudentOnboarding from "../models/StudentOnboarding.js";
import {
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission,
} from "../middleware/auth.js";

const router = express.Router();

const attendanceGuard = [
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:attendance"),
];

function fullStudentName(student) {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
}

function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function mapAttendanceRecord(item, student) {
  return {
    id: item._id.toString(),
    date: item.date,
    studentOnboardingId: item.studentOnboardingId.toString(),
    status: item.status,
    markedBy: item.markedBy?.toString() || null,
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
        }
      : null,
  };
}

router.get("/today", attendanceGuard, async (_req, res) => {
  try {
    const date = todayDateString();
    const students = await StudentOnboarding.find().sort({ firstName: 1, lastName: 1, studentId: 1 });
    const records = await StudentAttendance.find({ date });
    const recordByStudent = new Map(records.map((item) => [item.studentOnboardingId.toString(), item]));

    const rows = students.map((student) => {
      const record = recordByStudent.get(student._id.toString());
      return {
        studentOnboardingId: student._id.toString(),
        studentId: student.studentId,
        fullName: fullStudentName(student),
        batch: student.batch,
        status: record?.status || "",
        attendanceId: record?._id.toString() || null,
        updatedAt: record?.updatedAt || null,
      };
    });

    res.json({ date, rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/today", attendanceGuard, async (req, res) => {
  try {
    const date = todayDateString();
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];

    for (const entry of entries) {
      if (!entry?.studentOnboardingId || !ATTENDANCE_STATUSES.includes(entry.status)) {
        return res.status(400).json({ message: "Each entry needs studentOnboardingId and a valid status." });
      }
    }

    const studentIds = entries.map((entry) => entry.studentOnboardingId);
    const students = await StudentOnboarding.find({ _id: { $in: studentIds } });
    const validIds = new Set(students.map((student) => student._id.toString()));

    for (const entry of entries) {
      if (!validIds.has(entry.studentOnboardingId)) {
        return res.status(400).json({ message: "One or more students were not found." });
      }
    }

    await Promise.all(
      entries.map((entry) =>
        StudentAttendance.findOneAndUpdate(
          { date, studentOnboardingId: entry.studentOnboardingId },
          {
            date,
            studentOnboardingId: entry.studentOnboardingId,
            status: entry.status,
            markedBy: req.currentUser._id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    const allStudents = await StudentOnboarding.find().sort({ firstName: 1, lastName: 1, studentId: 1 });
    const records = await StudentAttendance.find({ date });
    const recordByStudent = new Map(records.map((item) => [item.studentOnboardingId.toString(), item]));

    const rows = allStudents.map((student) => {
      const record = recordByStudent.get(student._id.toString());
      return {
        studentOnboardingId: student._id.toString(),
        studentId: student.studentId,
        fullName: fullStudentName(student),
        batch: student.batch,
        status: record?.status || "",
        attendanceId: record?._id.toString() || null,
        updatedAt: record?.updatedAt || null,
      };
    });

    res.json({ date, rows, message: "Attendance saved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/dates", attendanceGuard, async (_req, res) => {
  try {
    const summaries = await StudentAttendance.aggregate([
      {
        $group: {
          _id: "$date",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(
      summaries.map((item) => ({
        date: item._id,
        total: item.total,
        present: item.present,
        absent: item.absent,
        late: item.late,
        leave: item.leave,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/day/:date", attendanceGuard, async (req, res) => {
  try {
    const { date } = req.params;
    if (!isValidDateString(date)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const students = await StudentOnboarding.find().sort({ firstName: 1, lastName: 1, studentId: 1 });
    const records = await StudentAttendance.find({ date });
    const recordByStudent = new Map(records.map((item) => [item.studentOnboardingId.toString(), item]));

    const rows = students.map((student) => {
      const record = recordByStudent.get(student._id.toString());
      return {
        studentOnboardingId: student._id.toString(),
        studentId: student.studentId,
        fullName: fullStudentName(student),
        batch: student.batch,
        status: record?.status || "",
        attendanceId: record?._id.toString() || null,
        updatedAt: record?.updatedAt || null,
      };
    });

    const marked = rows.filter((row) => row.status);
    res.json({
      date,
      rows,
      total: marked.length,
      present: marked.filter((row) => row.status === "present").length,
      absent: marked.filter((row) => row.status === "absent").length,
      late: marked.filter((row) => row.status === "late").length,
      leave: marked.filter((row) => row.status === "leave").length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/history", attendanceGuard, async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const filter = {};

    if (typeof date === "string" && isValidDateString(date)) {
      filter.date = date;
    }

    if (typeof status === "string" && ATTENDANCE_STATUSES.includes(status)) {
      filter.status = status;
    }

    const records = await StudentAttendance.find(filter).sort({ date: -1, updatedAt: -1 });
    const studentIds = [...new Set(records.map((item) => item.studentOnboardingId.toString()))];
    const students = await StudentOnboarding.find({ _id: { $in: studentIds } });
    const studentById = new Map(students.map((student) => [student._id.toString(), student]));

    let mapped = records
      .map((item) => mapAttendanceRecord(item, studentById.get(item.studentOnboardingId.toString())))
      .filter((item) => item.student);

    if (typeof search === "string" && search.trim()) {
      const query = search.trim().toLowerCase();
      mapped = mapped.filter((item) => {
        const student = item.student;
        return (
          student.fullName.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          (student.batch || "").toLowerCase().includes(query)
        );
      });
    }

    const dates = [...new Set(mapped.map((item) => item.date))].sort((a, b) => b.localeCompare(a));

    const summary = dates.map((entryDate) => {
      const dayRecords = mapped.filter((item) => item.date === entryDate);
      return {
        date: entryDate,
        total: dayRecords.length,
        present: dayRecords.filter((item) => item.status === "present").length,
        absent: dayRecords.filter((item) => item.status === "absent").length,
        late: dayRecords.filter((item) => item.status === "late").length,
        leave: dayRecords.filter((item) => item.status === "leave").length,
        records: dayRecords.sort((a, b) => a.student.fullName.localeCompare(b.student.fullName)),
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/student/:studentOnboardingId/summary", attendanceGuard, async (req, res) => {
  try {
    const student = await StudentOnboarding.findById(req.params.studentOnboardingId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const records = await StudentAttendance.find({ studentOnboardingId: student._id });
    const total = records.length;
    const present = records.filter((item) => item.status === "present" || item.status === "late").length;
    const absent = records.filter((item) => item.status === "absent").length;
    const leave = records.filter((item) => item.status === "leave").length;
    const percent = total > 0 ? Math.round((present / total) * 100) : null;

    res.json({
      studentOnboardingId: student._id.toString(),
      total,
      present,
      absent,
      leave,
      percent,
      records: records
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((item) => ({
          date: item.date,
          status: item.status,
        })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
