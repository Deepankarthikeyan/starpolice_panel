export type AttendanceStatus = "present" | "absent" | "late" | "leave" | "";

export interface StudentAttendanceRow {
  studentOnboardingId: string;
  studentId: string;
  fullName: string;
  batch: string;
  status: AttendanceStatus;
  attendanceId: string | null;
  updatedAt: string | null;
}

export interface StudentAttendanceDayResponse {
  date: string;
  rows: StudentAttendanceRow[];
}

export interface StudentAttendanceHistoryRecord {
  id: string;
  date: string;
  studentOnboardingId: string;
  status: Exclude<AttendanceStatus, "">;
  markedBy: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    studentId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    batch: string;
  };
}

export interface StudentAttendanceHistoryDay {
  date: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  records: StudentAttendanceHistoryRecord[];
}

export const ATTENDANCE_STATUS_OPTIONS: {
  value: Exclude<AttendanceStatus, "">;
  label: string;
  badgeClass: string;
}[] = [
  { value: "present", label: "Present", badgeClass: "badge-success" },
  { value: "absent", label: "Absent", badgeClass: "badge-danger" },
  { value: "late", label: "Late", badgeClass: "badge-warning" },
  { value: "leave", label: "Leave", badgeClass: "badge-info" },
];

export type AttendanceSortKey = "name-asc" | "name-desc" | "id-asc" | "id-desc";

export function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isAfterAttendanceCutoff(date = todayDateString()) {
  if (date !== todayDateString()) return false;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours > 18 || (hours === 18 && minutes >= 30);
}

export function statusLabel(status: AttendanceStatus) {
  return ATTENDANCE_STATUS_OPTIONS.find((option) => option.value === status)?.label || "Not marked";
}

export function statusBadgeClass(status: AttendanceStatus) {
  return ATTENDANCE_STATUS_OPTIONS.find((option) => option.value === status)?.badgeClass || "badge-light";
}

export function resolveMarkStatus(
  requested: Exclude<AttendanceStatus, "">,
  date = todayDateString()
): Exclude<AttendanceStatus, ""> {
  if (requested === "present" && isAfterAttendanceCutoff(date)) {
    return "late";
  }
  return requested;
}

export function defaultStatusForNewMark(date = todayDateString()): Exclude<AttendanceStatus, ""> | "" {
  if (isAfterAttendanceCutoff(date)) {
    return "late";
  }
  return "";
}

export function sortAttendanceRows(rows: StudentAttendanceRow[], sortKey: AttendanceSortKey) {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    if (sortKey === "name-desc") return b.fullName.localeCompare(a.fullName);
    if (sortKey === "id-asc") return a.studentId.localeCompare(b.studentId);
    if (sortKey === "id-desc") return b.studentId.localeCompare(a.studentId);
    return a.fullName.localeCompare(b.fullName);
  });
  return sorted;
}
