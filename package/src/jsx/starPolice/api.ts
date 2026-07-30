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
} from "./types";
import type { StudentOnboardingFormState, StudentOnboardingRecord } from "./admin/studentOnboardingDefaults";

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
    permissions?: string[]
  ) {
    return request<ManagedUser>("/api/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, permissions }),
    });
  },

  updateUser(id: string, data: { name?: string; email?: string; password?: string }) {
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
};

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
