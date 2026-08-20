export type UserRole = "superadmin" | "admin" | "staff" | "student";
export type PanelType = "admin" | "staff" | "student";
export type PermissionKey = string;
export type StaffType = "physical" | "subject";
export type ExamType = "physical_exam" | "written_exam";

export type FileCategory = "video" | "pdf" | "image" | "document";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  permissions: PermissionKey[];
  panel: PanelType;
  token: string;
  subjectIds?: string[];
  subjectNames?: string[];
  staffExamTypes?: ExamType[];
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  permissions: PermissionKey[];
  staffType?: StaffType | null;
  subjectIds?: string[];
  subjectNames?: string[];
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface SetupStatus {
  needsSuperAdmin: boolean;
}

export interface UploadedFile {
  id: string;
  date: string;
  title: string;
  name: string;
  category: FileCategory;
  fileUrl: string;
  mimeType?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderRole: UserRole;
  senderName: string;
  senderEmail: string;
  message: string;
  channel: "group" | "private";
  threadStudentId?: string | null;
  threadStaffId?: string | null;
  threadAdminId?: string | null;
  createdAt: string;
}

export interface MessagingContact {
  id: string;
  contactType: "student" | "staff" | "admin";
  name: string;
  subtitle?: string;
  role: UserRole | string;
  isActive?: boolean;
}

export interface DashboardStats {
  totalUploads: number;
  activeDays: number;
  studentMessages: number;
  adminReplies: number;
  categoryCounts: Record<string, number>;
  recentUploads: Array<{
    id: string;
    date: string;
    name: string;
    title: string;
    category: FileCategory;
  }>;
}

export interface StudentDashboardStats {
  materialCount: number;
  studyDays: number;
  adminMessages: number;
  latestUploads: Array<{
    id: string;
    date: string;
    name: string;
    title: string;
    category: FileCategory;
  }>;
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
