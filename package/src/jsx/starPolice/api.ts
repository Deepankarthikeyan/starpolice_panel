import type {
  AcademyAlert,
  AppNotification,
  AuthUser,
  ChatMessage,
  DashboardStats,
  Note,
  UploadedFile,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  const raw = localStorage.getItem("AUTH");
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as AuthUser).token;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
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
  login(email: string, password: string, role: AuthUser["role"]) {
    return request<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  },

  getMe() {
    return request<Omit<AuthUser, "token">>("/api/auth/me");
  },

  getUploads(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return request<UploadedFile[]>(`/api/uploads${query}`);
  },

  uploadFiles(date: string, category: string, files: File[]) {
    const formData = new FormData();
    formData.append("date", date);
    formData.append("category", category);
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
