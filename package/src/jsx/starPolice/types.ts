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
