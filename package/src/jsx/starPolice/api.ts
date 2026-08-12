import type {
  AcademyAlert,
  AppNotification,
  AuthUser,
  ChatMessage,
  DashboardStats,
  ManagedUser,
  Note,
  PanelType,
  SetupStatus,
  StudentDashboardStats,
  UploadedFile,
  Subject,
} from "./types";
import type { StudentOnboardingFormState, StudentOnboardingRecord } from "./admin/studentOnboardingDefaults";
import type { LeadFormState, LeadRecord, LeadStatus } from "./admin/leadDefaults";
import type {
  StudentPerformanceRecord,
  StudentPerformanceSummary,
} from "./admin/performanceDefaults";
import type {
  StudentAttendanceDayResponse,
  StudentAttendanceHistoryDay,
  StudentAttendanceDateSummary,
  StudentAttendanceDayDetail,
} from "./admin/attendanceDefaults";
import {
  defaultEvents,
  getCardTypeFromGender,
} from "./admin/performanceDefaults";

const API_BASE = import.meta.env.VITE_API_URL || "";

function resolvePanelFromPath(pathname: string): PanelType {
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/staff")) return "staff";
  return "admin";
}

function getStorageKey(panel?: PanelType) {
  const resolved = panel || resolvePanelFromPath(window.location.pathname);
  if (resolved === "student") return "AUTH_STUDENT";
  if (resolved === "staff") return "AUTH_STAFF";
  return "AUTH_ADMIN";
}

export function getStoredAuth(panel?: PanelType): AuthUser | null {
  const raw = localStorage.getItem(getStorageKey(panel));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(user: AuthUser) {
  localStorage.setItem(getStorageKey(user.panel), JSON.stringify(user));
}

export function clearAuth(panel: PanelType) {
  localStorage.removeItem(getStorageKey(panel));
}

function getToken(panel?: PanelType) {
  return getStoredAuth(panel)?.token ?? null;
}

function getLoginPath(panel: PanelType) {
  if (panel === "student") return "/student/login";
  if (panel === "staff") return "/staff/login";
  return "/admin/login";
}

function isSessionInvalid(status: number, message: string) {
  return (
    status === 401 &&
    (message === "Session expired. Please sign in again." ||
      message === "User not found." ||
      message === "Invalid or expired token." ||
      message === "Authentication required.")
  );
}

export function handleInvalidSession(panel?: PanelType) {
  const resolved = panel || resolvePanelFromPath(window.location.pathname);
  clearAuth(resolved);
  const loginPath = getLoginPath(resolved);
  if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup")) {
    window.location.replace(loginPath);
  }
}

export async function validateStoredSession(panel?: PanelType): Promise<AuthUser | null> {
  const resolved = panel || resolvePanelFromPath(window.location.pathname);
  const stored = getStoredAuth(resolved);
  if (!stored?.token) return null;

  try {
    const me = await request<Omit<AuthUser, "token">>("/api/auth/me", {}, resolved);
    const refreshed: AuthUser = { ...stored, ...me, token: stored.token };
    storeAuth(refreshed);
    return refreshed;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, panel?: PanelType): Promise<T> {
  const token = getToken(panel);
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || "Request failed";
    if (isSessionInvalid(response.status, message)) {
      handleInvalidSession(panel);
    }
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  getSetupStatus() {
    return request<SetupStatus>("/api/auth/setup");
  },

  register(name: string, email: string, password: string, panel: PanelType) {
    return request<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, panel }),
    });
  },

  login(email: string, password: string, panel: PanelType) {
    return request<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, panel }),
    });
  },

  getMe(panel?: PanelType) {
    return request<Omit<AuthUser, "token">>("/api/auth/me", {}, panel);
  },

  getUsers(type: "admin" | "staff" | "student") {
    return request<ManagedUser[]>(`/api/users?type=${type}`);
  },

  createUser(
    name: string,
    email: string,
    password: string,
    role: "admin" | "staff" | "student",
    permissions?: string[],
    staffType?: "physical" | "subject",
    subjectId?: string
  ) {
    return request<ManagedUser>("/api/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, permissions, staffType, subjectId }),
    });
  },

  updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      staffType?: "physical" | "subject";
      subjectId?: string | null;
    }
  ) {
    return request<ManagedUser>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  updateUserPermissions(id: string, permissions: string[]) {
    return request<ManagedUser>(`/api/users/${id}/permissions`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    });
  },

  setUserAccess(id: string, isActive: boolean) {
    return request<ManagedUser>(`/api/users/${id}/access`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  deleteUser(id: string) {
    return request<{ message: string }>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },

  getSubjects() {
    return request<Subject[]>("/api/subjects");
  },

  createSubject(name: string) {
    return request<Subject>("/api/subjects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  updateSubject(id: string, data: { name?: string; isActive?: boolean }) {
    return request<Subject>(`/api/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteSubject(id: string) {
    return request<{ message: string }>(`/api/subjects/${id}`, {
      method: "DELETE",
    });
  },

  getUploads(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return request<UploadedFile[]>(`/api/uploads${query}`);
  },

  uploadFiles(date: string, category: string, title: string, files: File[]) {
    const formData = new FormData();
    formData.append("date", date);
    formData.append("category", category);
    formData.append("title", title);
    files.forEach((file) => formData.append("files", file));
    return request<UploadedFile[]>("/api/uploads", {
      method: "POST",
      body: formData,
    });
  },

  deleteUpload(id: string) {
    return request<{ message: string }>(`/api/uploads/${id}`, {
      method: "DELETE",
    });
  },

  getMessages() {
    return request<ChatMessage[]>("/api/messages");
  },

  sendMessage(message: string) {
    return request<ChatMessage>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  getDashboardStats() {
    return request<DashboardStats>("/api/dashboard/stats");
  },

  getStudentDashboardStats() {
    return request<StudentDashboardStats>("/api/dashboard/student-stats");
  },

  getNotes() {
    return request<Note[]>("/api/notes");
  },

  createNote(content: string) {
    return request<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  updateNote(id: string, content: string) {
    return request<Note>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  },

  deleteNote(id: string) {
    return request<{ message: string }>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  },

  getAlerts() {
    return request<AcademyAlert[]>("/api/alerts");
  },

  createAlert(title: string, message: string, category?: AcademyAlert["category"]) {
    return request<AcademyAlert>("/api/alerts", {
      method: "POST",
      body: JSON.stringify({ title, message, category }),
    });
  },

  deleteAlert(id: string) {
    return request<{ message: string }>(`/api/alerts/${id}`, {
      method: "DELETE",
    });
  },

  getNotificationSummary() {
    return request<{ items: AppNotification[]; unreadCount: number }>("/api/notifications/summary");
  },

  getNotifications() {
    return request<AppNotification[]>("/api/notifications");
  },

  getUnreadNotificationCount() {
    return request<{ count: number }>("/api/notifications/unread-count");
  },

  markNotificationRead(id: string) {
    return request<AppNotification>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  markAllNotificationsRead() {
    return request<{ message: string }>("/api/notifications/read-all", {
      method: "PATCH",
    });
  },

  getStudentOnboardingRecords() {
    return request<StudentOnboardingRecord[]>("/api/student-onboarding");
  },

  getStudentOnboardingRecord(id: string) {
    return request<StudentOnboardingRecord>(`/api/student-onboarding/${id}`);
  },

  createStudentOnboarding(
    form: StudentOnboardingFormState,
    files: Partial<Record<string, File>>
  ) {
    return request<StudentOnboardingRecord>("/api/student-onboarding", {
      method: "POST",
      body: buildStudentOnboardingFormData(form, files),
    });
  },

  updateStudentOnboarding(
    id: string,
    form: StudentOnboardingFormState,
    files: Partial<Record<string, File>>
  ) {
    return request<StudentOnboardingRecord>(`/api/student-onboarding/${id}`, {
      method: "PUT",
      body: buildStudentOnboardingFormData(form, files),
    });
  },

  deleteStudentOnboarding(id: string) {
    return request<{ message: string }>(`/api/student-onboarding/${id}`, {
      method: "DELETE",
    });
  },

  getLeads(status?: LeadStatus) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<LeadRecord[]>(`/api/leads${query}`);
  },

  getLead(id: string) {
    return request<LeadRecord>(`/api/leads/${id}`);
  },

  createLead(form: LeadFormState) {
    return request<LeadRecord>("/api/leads", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },

  updateLead(id: string, form: LeadFormState) {
    return request<LeadRecord>(`/api/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
  },

  updateLeadStatus(id: string, status: LeadStatus, rejectionReason?: string) {
    return request<LeadRecord>(`/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejectionReason }),
    });
  },

  convertLeadToStudent(id: string) {
    return request<{ lead: LeadRecord; studentOnboardingId: string; studentId: string }>(
      `/api/leads/${id}/convert`,
      { method: "POST" }
    );
  },

  deleteLead(id: string) {
    return request<{ message: string }>(`/api/leads/${id}`, {
      method: "DELETE",
    });
  },

  getStudentPerformanceStudents() {
    return request<StudentPerformanceSummary[]>("/api/student-performance/students").catch(async () => {
      const records = await request<StudentOnboardingRecord[]>("/api/student-onboarding");
      return records.map(onboardingToPerformanceSummary);
    });
  },

  getStudentPerformanceByStudent(studentOnboardingId: string) {
    return request<StudentPerformanceRecord & { hasRecord?: boolean }>(
      `/api/student-performance/by-student/${studentOnboardingId}`
    ).catch(async () => {
      const record = await request<StudentOnboardingRecord>(`/api/student-onboarding/${studentOnboardingId}`);
      return onboardingToEmptyPerformance(record);
    });
  },

  saveStudentPerformance(studentOnboardingId: string, form: StudentPerformanceRecord) {
    return request<StudentPerformanceRecord>(`/api/student-performance/by-student/${studentOnboardingId}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
  },

  deleteStudentPerformance(studentOnboardingId: string) {
    return request<{ message: string }>(`/api/student-performance/by-student/${studentOnboardingId}`, {
      method: "DELETE",
    });
  },

  getMyStudentPerformance() {
    return request<StudentPerformanceRecord & { hasRecord?: boolean }>("/api/student-performance/me").catch(
      async () => {
        throw new Error("Physical performance records are not available until the API is updated.");
      }
    );
  },

  getTodayStudentAttendance() {
    return request<StudentAttendanceDayResponse>("/api/student-attendance/today");
  },

  saveTodayStudentAttendance(entries: { studentOnboardingId: string; status: string }[]) {
    return request<StudentAttendanceDayResponse & { message: string }>("/api/student-attendance/today", {
      method: "PUT",
      body: JSON.stringify({ entries }),
    });
  },

  getStudentAttendanceHistory(params?: { date?: string; status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<StudentAttendanceHistoryDay[]>(`/api/student-attendance/history${suffix}`);
  },

  getStudentAttendanceDates() {
    return request<StudentAttendanceDateSummary[]>("/api/student-attendance/dates");
  },

  getStudentAttendanceByDate(date: string) {
    return request<StudentAttendanceDayDetail>(`/api/student-attendance/day/${date}`);
  },
};

function fullOnboardingName(record: StudentOnboardingRecord) {
  return [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
}

function onboardingToPerformanceSummary(record: StudentOnboardingRecord): StudentPerformanceSummary {
  return {
    studentOnboardingId: record.id,
    studentId: record.studentId,
    fullName: fullOnboardingName(record),
    batch: record.batch,
    gender: record.gender,
    userId: record.userId,
    cardType: getCardTypeFromGender(record.gender),
    overallPerformance: "",
    hasRecord: false,
    performanceId: null,
    updatedAt: null,
  };
}

function onboardingToEmptyPerformance(record: StudentOnboardingRecord) {
  const cardType = getCardTypeFromGender(record.gender);
  return {
    hasRecord: false,
    studentOnboardingId: record.id,
    userId: record.userId,
    cardType,
    recordYear: new Date().getFullYear(),
    age: "",
    heightCm: "",
    weightKg: "",
    chestNormalCm: "",
    chestExpansionCm: "",
    events: defaultEvents(cardType),
    overallPerformance: "" as const,
    trainerRemarks: "",
    student: {
      studentOnboardingId: record.id,
      studentId: record.studentId,
      firstName: record.firstName,
      middleName: record.middleName,
      lastName: record.lastName,
      fullName: fullOnboardingName(record),
      batch: record.batch,
      gender: record.gender,
      dateOfBirth: record.dateOfBirth,
    },
  };
}

const STUDENT_ONBOARDING_TEXT_FIELDS: Array<keyof StudentOnboardingFormState> = [
  "firstName",
  "middleName",
  "lastName",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "nationality",
  "aadhaarOrPassport",
  "mobileNumber",
  "alternateMobileNumber",
  "email",
  "parentMobileNumber",
  "parentEmail",
  "addressLine1",
  "addressLine2",
  "city",
  "district",
  "state",
  "country",
  "pinCode",
  "fatherName",
  "fatherOccupation",
  "motherName",
  "motherOccupation",
  "guardianName",
  "guardianRelationship",
  "annualFamilyIncome",
  "schoolName",
  "previousQualification",
  "boardUniversity",
  "yearOfPassing",
  "percentageCgpa",
  "mediumOfInstruction",
  "course",
  "batch",
  "branchCampus",
  "section",
  "admissionDate",
  "modeOfLearning",
  "duration",
  "expectedCompletionDate",
  "emergencyContactName",
  "emergencyRelationship",
  "emergencyMobile",
  "emergencyAlternateNumber",
  "username",
  "loginEmail",
  "registrationFee",
  "courseFee",
  "scholarship",
  "discount",
  "paymentMethod",
  "paymentStatus",
  "transactionId",
  "receiptNumber",
  "medicalConditions",
  "allergies",
  "disabilities",
  "emergencyNotes",
  "languagesKnown",
  "computerSkills",
  "careerGoal",
  "preferredCommunicationLanguage",
  "declarationDate",
  "password",
  "confirmPassword",
];

function buildStudentOnboardingFormData(
  form: StudentOnboardingFormState,
  files: Partial<Record<string, File>>
) {
  const formData = new FormData();
  for (const key of STUDENT_ONBOARDING_TEXT_FIELDS) {
    const value = form[key];
    if (typeof value === "string" && value) {
      formData.append(key, value);
    }
  }
  formData.append("termsAccepted", String(form.termsAccepted));
  formData.append("privacyAccepted", String(form.privacyAccepted));
  formData.append("grantLogin", String(form.grantLogin));
  Object.entries(files).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });
  return formData;
}
