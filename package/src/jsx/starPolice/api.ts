import type {
  AcademyAlert,
  AppNotification,
  AuthUser,
  ChatMessage,
  DashboardStats,
  ManagedUser,
  MessagingContact,
  Note,
  PanelType,
  QuestionPaper,
  SetupStatus,
  StudentDashboardStats,
  UploadedFile,
  Subject,
} from "./types";
import type { StudentOnboardingFormState, StudentOnboardingRecord } from "./admin/studentOnboardingDefaults";
import type { LeadFormState, LeadRecord, LeadStatus } from "./admin/leadDefaults";
import type { Exam, StudentPerformanceDetail } from "./admin/examDefaults";
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

function publicApiErrorMessage(status: number, message: unknown) {
  const text = typeof message === "string" ? message : "";
  if (
    text.includes("MONGODB_URI") ||
    text.includes("MongoDB Atlas") ||
    text.includes("Database is still starting") ||
    text.includes("secretOrPrivateKey")
  ) {
    return "The API is starting. Wait about 30 seconds and try again.";
  }
  if (text) return text;
  if (status === 404) {
    return "API endpoint not found. The server may need to be updated.";
  }
  if (status >= 500) {
    return "API is waking up or temporarily unavailable. Wait 30 seconds and try again.";
  }
  return `Request failed (${status})`;
}

function isMissingContactsEndpoint(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("API endpoint not found")
  );
}

function managedUserToMessagingContact(
  user: ManagedUser,
  contactType: "student" | "staff" | "admin",
): MessagingContact {
  let subtitle = user.email;
  if (contactType === "staff") {
    subtitle = user.subjectNames?.length ? user.subjectNames.join(", ") : "Staff member";
  }
  if (contactType === "admin" && user.role === "superadmin") {
    subtitle = "Super Admin";
  }
  if (!user.isActive && user.role !== "superadmin") {
    subtitle = `${subtitle} · Pending login`;
  }

  return {
    id: user.id,
    contactType,
    name: user.name,
    subtitle,
    role: user.role,
    isActive: user.isActive,
  };
}

async function legacyMessageContacts(
  scope?: "admin" | "staff" | "student",
  panel?: PanelType,
): Promise<MessagingContact[]> {
  const resolvedPanel = panel || resolvePanelFromPath(window.location.pathname);
  const auth = getStoredAuth(resolvedPanel);

  if (auth?.role !== "superadmin") {
    throw new Error(
      "Interaction requires an API update. Redeploy starpolice-api on Render from the latest master branch.",
    );
  }

  if (scope === "staff") {
    const users = await request<ManagedUser[]>("/api/users?type=staff");
    return users.map((user) => managedUserToMessagingContact(user, "staff"));
  }

  if (scope === "admin") {
    const users = await request<ManagedUser[]>("/api/users?type=admin");
    const me = await request<Omit<AuthUser, "token">>("/api/auth/me", {}, resolvedPanel);
    return users
      .filter((user) => user.id !== me.id)
      .map((user) => managedUserToMessagingContact(user, "admin"));
  }

  const users = await request<ManagedUser[]>("/api/users?type=student");
  return users.map((user) => managedUserToMessagingContact(user, "student"));
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

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};
  if (!response.ok) {
    let message = publicApiErrorMessage(response.status, data.message);
    if (isSessionInvalid(response.status, message)) {
      handleInvalidSession(panel);
    }
    throw new Error(message);
  }
  return data as T;
}

function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  onProgress: (percent: number) => void,
  panel?: PanelType,
  method = "POST",
  signal?: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Upload cancelled"));
      return;
    }

    const xhr = new XMLHttpRequest();
    const token = getToken(panel);
    const resolvedPanel = panel || resolvePanelFromPath(window.location.pathname);

    xhr.open(method, `${API_BASE}${path}`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || !event.total) return;
      const percent = Math.max(1, Math.min(100, (event.loaded / event.total) * 100));
      onProgress(percent);
    });
    xhr.upload.addEventListener("load", () => {
      onProgress(100);
    });

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", onAbort);
      let data: { message?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Invalid response"));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve(data as T);
        return;
      }

      const message = publicApiErrorMessage(xhr.status, data.message);
      if (isSessionInvalid(xhr.status, message)) {
        handleInvalidSession(resolvedPanel);
      }
      reject(new Error(message));
    });

    xhr.addEventListener("error", () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Upload failed"));
    });
    xhr.addEventListener("abort", () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Upload cancelled"));
    });

    onProgress(1);
    xhr.send(formData);
  });
}

export const api = {
  getSetupStatus() {
    return request<SetupStatus>("/api/auth/setup");
  },

  prepareSignup() {
    return request<SetupStatus & { cleared?: boolean; deletedCount?: number }>(
      "/api/auth/prepare-signup",
      { method: "POST" }
    );
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

  verifySetupToken(token: string) {
    return request<{
      valid: boolean;
      purpose?: "setup" | "reset";
      panel?: PanelType;
      email?: string;
      name?: string;
    }>(`/api/auth/verify-setup-token?token=${encodeURIComponent(token)}`);
  },

  forgotPassword(email: string, panel: PanelType) {
    return request<{
      message: string;
      sent?: boolean;
      delivered?: boolean;
      devMode?: boolean;
      setupUrl?: string;
    }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, panel, clientUrl: window.location.origin }),
    });
  },

  requestOtp(token: string, password: string, confirmPassword: string) {
    return request<{ message: string; email: string; devMode?: boolean }>("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  },

  resendOtp(token: string) {
    return request<{ message: string; email: string; devMode?: boolean }>("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  verifyOtp(token: string, otp: string) {
    return request<{ message: string; panel: PanelType; purpose: "setup" | "reset" }>(
      "/api/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({ token, otp }),
      }
    );
  },

  resendInvite(id: string) {
    return request<{
      message: string;
      inviteSent: boolean;
      delivered?: boolean;
      devMode?: boolean;
      setupUrl?: string;
    }>(`/api/users/${id}/resend-invite`, {
      method: "PATCH",
      body: JSON.stringify({ clientUrl: window.location.origin }),
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
    role: "admin" | "staff" | "student",
    permissions?: string[],
    subjectIds?: string[]
  ) {
    return request<ManagedUser & {
      inviteSent?: boolean;
      message?: string;
      delivered?: boolean;
      devMode?: boolean;
      setupUrl?: string;
    }>("/api/users", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        role,
        permissions,
        subjectIds,
        clientUrl: window.location.origin,
      }),
    });
  },

  updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      subjectIds?: string[];
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

  getExams() {
    return request<Exam[]>("/api/exams");
  },

  createExam(data: {
    name: string;
    examType: "physical_exam" | "written_exam";
    subjectId?: string | null;
    totalMarks: number;
  }) {
    return request<Exam>("/api/exams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateExam(
    id: string,
    data: {
      name?: string;
      examType?: "physical_exam" | "written_exam";
      subjectId?: string | null;
      totalMarks?: number;
      isActive?: boolean;
    }
  ) {
    return request<Exam>(`/api/exams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteExam(id: string) {
    return request<{ message: string }>(`/api/exams/${id}`, {
      method: "DELETE",
    });
  },

  getUploads(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return request<UploadedFile[]>(`/api/uploads${query}`);
  },

  uploadFiles(
    date: string,
    category: string,
    title: string,
    files: File[],
    onProgress?: (percent: number) => void,
  ) {
    const formData = new FormData();
    formData.append("date", date);
    formData.append("category", category);
    formData.append("title", title);
    files.forEach((file) => formData.append("files", file));

    if (onProgress) {
      return uploadWithProgress<UploadedFile[]>("/api/uploads", formData, onProgress);
    }

    return request<UploadedFile[]>("/api/uploads", {
      method: "POST",
      body: formData,
    });
  },

  uploadFile(
    date: string,
    category: string,
    title: string,
    file: File,
    options?: {
      onProgress?: (percent: number) => void;
      signal?: AbortSignal;
    },
  ) {
    const formData = new FormData();
    formData.append("date", date);
    formData.append("category", category);
    formData.append("title", title);
    formData.append("files", file);
    return uploadWithProgress<UploadedFile[]>(
      "/api/uploads",
      formData,
      options?.onProgress ?? (() => undefined),
      undefined,
      "POST",
      options?.signal,
    );
  },

  deleteUpload(id: string) {
    return request<{ message: string }>(`/api/uploads/${id}`, {
      method: "DELETE",
    });
  },

  getQuestionPapers(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return request<QuestionPaper[]>(`/api/question-papers${query}`);
  },

  uploadQuestionPaper(
    paperName: string,
    date: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) {
    const formData = new FormData();
    formData.append("paperName", paperName);
    formData.append("date", date);
    formData.append("file", file);
    if (onProgress) {
      return uploadWithProgress<QuestionPaper>("/api/question-papers", formData, onProgress);
    }
    return request<QuestionPaper>("/api/question-papers", {
      method: "POST",
      body: formData,
    });
  },

  updateQuestionPaper(
    id: string,
    data: { paperName?: string; date?: string; file?: File },
    onProgress?: (percent: number) => void,
  ) {
    const formData = new FormData();
    if (data.paperName) formData.append("paperName", data.paperName);
    if (data.date) formData.append("date", data.date);
    if (data.file) formData.append("file", data.file);
    if (onProgress) {
      return uploadWithProgress<QuestionPaper>(`/api/question-papers/${id}`, formData, onProgress, undefined, "PATCH");
    }
    return request<QuestionPaper>(`/api/question-papers/${id}`, {
      method: "PATCH",
      body: formData,
    });
  },

  deleteQuestionPaper(id: string) {
    return request<{ message: string }>(`/api/question-papers/${id}`, {
      method: "DELETE",
    });
  },

  getMessageContacts(scope?: "admin" | "staff" | "student") {
    const search = new URLSearchParams();
    if (scope) search.set("scope", scope);
    const query = search.toString();
    return request<MessagingContact[]>(`/api/messages/contacts${query ? `?${query}` : ""}`).catch(
      async (error) => {
        if (!isMissingContactsEndpoint(error)) {
          throw error;
        }
        return legacyMessageContacts(scope);
      },
    );
  },

  getMessages(params?: {
    channel?: "group" | "private";
    studentUserId?: string;
    staffUserId?: string;
    adminUserId?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.channel) search.set("channel", params.channel);
    if (params?.studentUserId) search.set("studentUserId", params.studentUserId);
    if (params?.staffUserId) search.set("staffUserId", params.staffUserId);
    if (params?.adminUserId) search.set("adminUserId", params.adminUserId);
    const query = search.toString();
    return request<ChatMessage[]>(`/api/messages${query ? `?${query}` : ""}`);
  },

  sendMessage(
    message: string,
    options?: {
      channel?: "group" | "private";
      studentUserId?: string;
      staffUserId?: string;
      adminUserId?: string;
    },
  ) {
    return request<ChatMessage>("/api/messages", {
      method: "POST",
      body: JSON.stringify({
        message,
        channel: options?.channel ?? "group",
        studentUserId: options?.studentUserId,
        staffUserId: options?.staffUserId,
        adminUserId: options?.adminUserId,
      }),
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
    files: Partial<Record<string, File>>,
    onProgress?: (percent: number) => void,
  ) {
    const formData = buildStudentOnboardingFormData(form, files);
    if (onProgress) {
      return uploadWithProgress<StudentOnboardingRecord>(
        "/api/student-onboarding",
        formData,
        onProgress,
      );
    }
    return request<StudentOnboardingRecord>("/api/student-onboarding", {
      method: "POST",
      body: formData,
    });
  },

  updateStudentOnboarding(
    id: string,
    form: StudentOnboardingFormState,
    files: Partial<Record<string, File>>,
    onProgress?: (percent: number) => void,
  ) {
    const formData = buildStudentOnboardingFormData(form, files);
    if (onProgress) {
      return uploadWithProgress<StudentOnboardingRecord>(
        `/api/student-onboarding/${id}`,
        formData,
        onProgress,
        undefined,
        "PUT",
      );
    }
    return request<StudentOnboardingRecord>(`/api/student-onboarding/${id}`, {
      method: "PUT",
      body: formData,
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

  getStudentPerformanceDetail(studentOnboardingId: string) {
    return request<StudentPerformanceDetail>(
      `/api/student-performance/by-student/${studentOnboardingId}/detail`
    );
  },

  saveStudentExamMarks(
    studentOnboardingId: string,
    marks: Array<{ examId: string; scoredMarks: number; remarks?: string }>
  ) {
    return request<{ message: string }>(`/api/student-performance/by-student/${studentOnboardingId}/exam-marks`, {
      method: "PUT",
      body: JSON.stringify({ marks }),
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

  getMyStudentPerformanceDetail() {
    return request<StudentPerformanceDetail>("/api/student-performance/me/detail");
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
    events: defaultEvents(),
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
  "residenceType",
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
  const skipKeys = new Set(["residenceType", "password", "confirmPassword", "paymentStatus", "materials"]);

  for (const key of STUDENT_ONBOARDING_TEXT_FIELDS) {
    if (skipKeys.has(key)) continue;
    const value = form[key];
    if (typeof value === "string" && value) {
      formData.append(key, value);
    }
  }

  formData.append("termsAccepted", String(form.termsAccepted));
  formData.append("privacyAccepted", String(form.privacyAccepted));
  formData.append("grantLogin", String(form.grantLogin));
  formData.append("residenceType", form.residenceType || "");
  formData.append("paymentStatus", form.paymentStatus || "Pending");
  formData.append("materials", JSON.stringify(form.materials || []));
  formData.append("clientUrl", window.location.origin);

  if (form.password) {
    formData.append("password", form.password);
  }
  if (form.confirmPassword) {
    formData.append("confirmPassword", form.confirmPassword);
  }

  Object.entries(files).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });
  return formData;
}
