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
  StudentRecord,
  StudentProfileInput,
  UploadedFile,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "";

function getStorageKey(panel?: PanelType) {
  const resolved =
    panel || (window.location.pathname.startsWith("/student") ? "student" : "admin");
  return resolved === "student" ? "AUTH_STUDENT" : "AUTH_ADMIN";
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
    throw new Error(data.message || "Request failed");
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

  getStudents() {
    return request<StudentRecord[]>("/api/students");
  },

  getStudent(id: string) {
    return request<StudentRecord>(`/api/students/${id}`);
  },

  createStudent(
    name: string,
    email: string,
    password: string,
    profile: StudentProfileInput
  ) {
    return request<StudentRecord>("/api/students", {
      method: "POST",
      body: JSON.stringify({ name, email, password, profile }),
    });
  },

  updateStudent(
    id: string,
    payload: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
      profile?: Partial<StudentProfileInput>;
    }
  ) {
    return request<StudentRecord>(`/api/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteStudent(id: string) {
    return request<{ message: string }>(`/api/students/${id}`, {
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
};
