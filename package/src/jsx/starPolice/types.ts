export type UserRole = "admin" | "student";

export type FileCategory = "video" | "pdf" | "image" | "document";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  token: string;
}

export interface UploadedFile {
  id: string;
  date: string;
  name: string;
  category: FileCategory;
  fileUrl: string;
  mimeType?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  senderEmail: string;
  message: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUploads: number;
  activeDays: number;
  studentMessages: number;
  adminReplies: number;
  categoryCounts: Record<string, number>;
  recentUploads: Array<{ date: string; category: FileCategory }>;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyAlert {
  id: string;
  title: string;
  message: string;
  category: "general" | "server" | "social";
  createdByName: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "message" | "upload" | "alert" | "system";
  read: boolean;
  createdAt: string;
}
