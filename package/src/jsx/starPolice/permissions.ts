export const ADMIN_PERMISSIONS = [
  { key: "admin:dashboard", label: "Dashboard", description: "View admin dashboard and statistics" },
  { key: "admin:uploads", label: "Daywise Upload", description: "Upload and manage study materials" },
  { key: "admin:messages", label: "Student Interaction", description: "Chat with students" },
  { key: "admin:calendar", label: "Monthly Calendar", description: "View the monthly calendar" },
  { key: "admin:users", label: "User Management", description: "Create and manage student accounts" },
] as const;

export const STUDENT_PERMISSIONS = [
  { key: "student:dashboard", label: "Dashboard", description: "View student dashboard" },
  { key: "student:materials", label: "Study Materials", description: "View uploaded study materials" },
  { key: "student:messages", label: "Admin Interaction", description: "Chat with admins" },
  { key: "student:calendar", label: "Monthly Calendar", description: "View the monthly calendar" },
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSIONS)[number]["key"];
export type StudentPermissionKey = (typeof STUDENT_PERMISSIONS)[number]["key"];
export type PermissionKey = AdminPermissionKey | StudentPermissionKey;

export const ALL_ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map((item) => item.key);
export const ALL_STUDENT_PERMISSION_KEYS = STUDENT_PERMISSIONS.map((item) => item.key);
export const ADMIN_PANEL_ROLES = ["superadmin", "admin", "staff"] as const;

export function isAdminPanelRole(role?: string) {
  return ADMIN_PANEL_ROLES.includes(role as (typeof ADMIN_PANEL_ROLES)[number]);
}

export function defaultPermissionsForRole(role: "admin" | "staff" | "student") {
  if (role === "admin") return [...ALL_ADMIN_PERMISSION_KEYS];
  if (role === "staff") {
    return ALL_ADMIN_PERMISSION_KEYS.filter((key) => key !== "admin:users");
  }
  return [...ALL_STUDENT_PERMISSION_KEYS];
}

export function hasPermission(
  user: { role: string; permissions?: string[] } | null | undefined,
  permission: PermissionKey
) {
  if (!user) return false;
  if (user.role === "superadmin") return true;
  return (user.permissions || []).includes(permission);
}
