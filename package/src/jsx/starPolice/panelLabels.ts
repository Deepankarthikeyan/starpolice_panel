import type { PanelType, UserRole } from "./types";

export function getPanelMotherMenu(panel?: PanelType) {
  if (panel === "student") return "Student Panel";
  if (panel === "staff") return "Staff Panel";
  return "Admin Panel";
}

export function formatAccountType(role?: UserRole) {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Staff";
  if (role === "student") return "Student";
  return "";
}
