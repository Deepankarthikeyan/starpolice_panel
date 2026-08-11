export const SUPERADMIN_ONLY_PERMISSIONS = ["admin:users", "admin:onboarding"];

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
];

export const STUDENT_PERMISSIONS = [
  { key: "student:dashboard", label: "Dashboard", description: "View student dashboard" },
  { key: "student:materials", label: "Study Materials", description: "View uploaded study materials" },
  { key: "student:messages", label: "Admin Interaction", description: "Chat with admins" },
  { key: "student:calendar", label: "Monthly Calendar", description: "View the monthly calendar" },
  { key: "student:performance", label: "Physical Performance", description: "View physical efficiency record" },
];

export const ALL_ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map((item) => item.key);
export const STAFF_ADMIN_PERMISSION_KEYS = ALL_ADMIN_PERMISSION_KEYS.filter(
  (key) => !SUPERADMIN_ONLY_PERMISSIONS.includes(key)
);
export const ALL_STUDENT_PERMISSION_KEYS = STUDENT_PERMISSIONS.map((item) => item.key);

export function defaultPermissionsForRole(role) {
  if (role === "admin" || role === "staff") return [...STAFF_ADMIN_PERMISSION_KEYS];
  if (role === "student") return [...ALL_STUDENT_PERMISSION_KEYS];
  return [];
}

export function sanitizePermissions(role, permissions) {
  const allowed =
    role === "admin" || role === "staff"
      ? STAFF_ADMIN_PERMISSION_KEYS
      : role === "student"
        ? ALL_STUDENT_PERMISSION_KEYS
        : [];

  if (!Array.isArray(permissions)) {
    return defaultPermissionsForRole(role);
  }

  const filtered = permissions.filter((permission) => allowed.includes(permission));
  return filtered.length > 0 ? filtered : defaultPermissionsForRole(role);
}

export function getEffectivePermissions(user) {
  if (!user) return [];
  if (user.role === "superadmin") {
    return defaultPermissionsForRole("admin");
  }
  if (user.permissions?.length) {
    return user.permissions;
  }
  return defaultPermissionsForRole(user.role);
}

export function hasPermission(user, permission) {
  if (!user) return false;
  if (SUPERADMIN_ONLY_PERMISSIONS.includes(permission)) {
    return user.role === "superadmin";
  }
  if (user.role === "superadmin") return true;
  return getEffectivePermissions(user).includes(permission);
}

export function hasAnyPermission(user, permissions) {
  return permissions.some((permission) => hasPermission(user, permission));
}
