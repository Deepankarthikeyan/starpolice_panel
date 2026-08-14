export const ADMIN_PERMISSIONS = [
  { key: "admin:dashboard", label: "Dashboard", description: "View admin dashboard and statistics" },
  { key: "admin:uploads", label: "Daywise Upload", description: "Upload and manage study materials" },
  { key: "admin:messages", label: "Student Interaction", description: "Chat with students" },
  { key: "admin:calendar", label: "Monthly Calendar", description: "View the monthly calendar" },
  { key: "admin:users", label: "User Management", description: "Create and manage student accounts" },
  { key: "admin:onboarding", label: "Student Onboarding", description: "Create and manage student onboarding records" },
  { key: "admin:leads", label: "Leads", description: "Manage prospective student leads" },
  { key: "admin:performance", label: "Student Performance", description: "Manage physical efficiency records" },
  { key: "admin:attendance", label: "Student Attendance", description: "Mark and review daily student attendance" },
  { key: "admin:master", label: "Master", description: "Manage master data such as subjects" },
] as const;

export const STUDENT_PERMISSIONS = [
  { key: "student:dashboard", label: "Dashboard", description: "View student dashboard" },
  { key: "student:materials", label: "Study Materials", description: "View uploaded study materials" },
  { key: "student:messages", label: "Admin Interaction", description: "Chat with admins" },
  { key: "student:calendar", label: "Monthly Calendar", description: "View the monthly calendar" },
  { key: "student:performance", label: "My Performance", description: "View attendance, exam, and overall performance" },
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSIONS)[number]["key"];
export type StudentPermissionKey = (typeof STUDENT_PERMISSIONS)[number]["key"];
export type PermissionKey = AdminPermissionKey | StudentPermissionKey;

export const SUPERADMIN_ONLY_PERMISSIONS: readonly PermissionKey[] = [
  "admin:users",
  "admin:onboarding",
  "admin:master",
];

export const ADMIN_ONLY_PERMISSIONS: readonly PermissionKey[] = ["admin:leads"];

export const ALL_ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map((item) => item.key);
export const STAFF_ADMIN_PERMISSION_KEYS = ALL_ADMIN_PERMISSION_KEYS.filter(
  (key) => !SUPERADMIN_ONLY_PERMISSIONS.includes(key) && !ADMIN_ONLY_PERMISSIONS.includes(key)
);
export const ADMIN_ROLE_PERMISSION_KEYS = ALL_ADMIN_PERMISSION_KEYS.filter(
  (key) => !SUPERADMIN_ONLY_PERMISSIONS.includes(key)
);
export const ALL_STUDENT_PERMISSION_KEYS = STUDENT_PERMISSIONS.map((item) => item.key);

export function defaultPermissionsForRole(role: "admin" | "staff" | "student") {
  if (role === "admin") return [...ADMIN_ROLE_PERMISSION_KEYS];
  if (role === "staff") return [...STAFF_ADMIN_PERMISSION_KEYS];
  return [...ALL_STUDENT_PERMISSION_KEYS];
}

export function getEffectivePermissions(
  user: { role: string; permissions?: string[] } | null | undefined
) {
  if (!user) return [];
  if (user.role === "superadmin") return [...ALL_ADMIN_PERMISSION_KEYS];
  if (user.permissions?.length) return user.permissions;
  if (user.role === "admin") return defaultPermissionsForRole("admin");
  if (user.role === "staff") return defaultPermissionsForRole("staff");
  if (user.role === "student") return defaultPermissionsForRole("student");
  return [];
}

export function hasPermission(
  user: { role: string; permissions?: string[] } | null | undefined,
  permission: PermissionKey
) {
  if (!user) return false;
  if (SUPERADMIN_ONLY_PERMISSIONS.includes(permission)) {
    return user.role === "superadmin";
  }
  if (ADMIN_ONLY_PERMISSIONS.includes(permission)) {
    return user.role === "superadmin" || user.role === "admin";
  }
  if (user.role === "superadmin") return true;
  return getEffectivePermissions(user).includes(permission);
}
