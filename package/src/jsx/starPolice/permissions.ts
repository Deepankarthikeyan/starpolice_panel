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

export function defaultPermissionsForRole(role: "admin" | "student") {
  return role === "admin" ? [...ALL_ADMIN_PERMISSION_KEYS] : [...ALL_STUDENT_PERMISSION_KEYS];
}

export function resolvePermissions(user: { role: string; permissions?: string[] }) {
  if (user.role === "superadmin") return [...ALL_ADMIN_PERMISSION_KEYS];
  if (user.permissions?.length) return user.permissions;
  return defaultPermissionsForRole(user.role === "student" ? "student" : "admin");
}

export function hasPermission(
  user: { role: string; permissions?: string[] } | null | undefined,
  permission: PermissionKey
) {
  if (!user) return false;
  if (user.role === "superadmin") return true;
  return resolvePermissions(user).includes(permission);
}
