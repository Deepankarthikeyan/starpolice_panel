export type UserRole = "admin" | "student";

export type FileCategory = "video" | "pdf" | "image" | "document";

export interface AuthUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface UploadedFile {
  id: string;
  date: string;
  name: string;
  category: FileCategory;
  dataUrl: string;
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
