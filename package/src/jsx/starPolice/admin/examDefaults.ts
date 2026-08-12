import type { Subject } from "../types";

export type ExamType = "physical_exam" | "written_exam";

export interface Exam {
  id: string;
  name: string;
  examType: ExamType;
  subjectId?: string | null;
  subjectName?: string | null;
  totalMarks: number;
  isActive: boolean;
  createdAt: string;
}

export interface StudentExamMarkEntry {
  examId: string;
  name: string;
  examType: ExamType;
  subjectName?: string | null;
  totalMarks: number;
  scoredMarks: number | string;
  remarks: string;
  markId?: string | null;
}

export interface StudentPerformanceDetail {
  student: {
    studentOnboardingId: string;
    studentId: string;
    fullName: string;
    batch: string;
    gender: string;
    mobileNumber: string;
    dateOfBirth?: string;
  };
  summary: {
    attendancePercent: number | null;
    attendanceTotal: number;
    attendancePresent: number;
    physicalExamPercent: number | null;
    writtenExamPercent: number | null;
    overallPercent: number | null;
    overallPerformance: string;
  };
  attendance: Array<{ date: string; status: string }>;
  physicalExams: StudentExamMarkEntry[];
  writtenExams: StudentExamMarkEntry[];
  performance: import("./performanceDefaults").StudentPerformanceRecord & { hasRecord?: boolean };
}

export const EXAM_TYPE_OPTIONS: { value: ExamType; label: string }[] = [
  { value: "physical_exam", label: "Physical Exam" },
  { value: "written_exam", label: "Written Exam" },
];

export function examTypeLabel(type: ExamType) {
  return EXAM_TYPE_OPTIONS.find((item) => item.value === type)?.label || type;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

export function buildWhatsAppLink(mobileNumber: string, message: string) {
  const digits = mobileNumber.replace(/\D/g, "");
  if (!digits) return null;
  const phone = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildPerformanceWhatsAppMessage(
  studentName: string,
  studentId: string,
  summary: StudentPerformanceDetail["summary"]
) {
  return [
    `Star Police Academy — Performance Report`,
    `Student: ${studentName}`,
    `Register No.: ${studentId}`,
    `Attendance: ${formatPercent(summary.attendancePercent)}`,
    `Physical Exam: ${formatPercent(summary.physicalExamPercent)}`,
    `Written Exam: ${formatPercent(summary.writtenExamPercent)}`,
    `Overall: ${formatPercent(summary.overallPercent)}`,
  ].join("\n");
}

export function emptyExamForm(subjects: Subject[] = []) {
  return {
    name: "",
    examType: "written_exam" as ExamType,
    subjectId: subjects[0]?.id || "",
    totalMarks: "100",
  };
}
