import {
  ADMIN_PERMISSIONS,
  STUDENT_PERMISSIONS,
} from "./permissions.js";

const MENU_DESCRIPTIONS = new Map(
  [...ADMIN_PERMISSIONS, ...STUDENT_PERMISSIONS].map((item) => [item.key, item.description])
);

export const STUDENT_MENU_ITEMS = [
  { to: "dashboard", permission: "student:dashboard", label: "Dashboard" },
  { to: "materials", permission: "student:materials", label: "Study Materials" },
  { to: "questions", permission: "student:questions", label: "Questions" },
  { to: "interaction", permission: "student:messages", label: "Interaction" },
  { to: "calendar", permission: "student:calendar", label: "Monthly Calendar" },
  { to: "performance", permission: "student:performance", label: "My Performance" },
];

export const ADMIN_MENU_ITEMS = [
  { to: "dashboard", permission: "admin:dashboard", label: "Dashboard" },
  { to: "daywise-upload", permission: "admin:uploads", label: "Daywise Upload" },
  { to: "questions", permission: "admin:questions", label: "Questions" },
  { to: "interaction", permission: "admin:messages", label: "Interaction" },
  { to: "monthly-calendar", permission: "admin:calendar", label: "Monthly Calendar" },
  { to: "leads", permission: "admin:leads", label: "Leads" },
  { to: "student-performance", permission: "admin:performance", label: "Student Performance" },
  { to: "physical-exam", permission: "admin:performance", label: "Physical Exam", examType: "physical_exam" },
  { to: "written-exam", permission: "admin:performance", label: "Written Exam", examType: "written_exam" },
  { to: "student-attendance", permission: "admin:attendance", label: "Student Attendance" },
  { to: "student-onboarding", permission: "admin:onboarding", label: "Student Onboarding" },
  { to: "user-management", permission: "admin:users", label: "User Management" },
  { to: "master/subjects", permission: "admin:master", label: "Subjects", section: "master" },
  { to: "master/exams", permission: "admin:master", label: "Exams", section: "master" },
];

export function getMenuDescription(permission) {
  return MENU_DESCRIPTIONS.get(permission) || "";
}

export function getAllowedMenuPaths(user, panel) {
  const permissions = user.permissions || [];
  const hasPermission = (permission) => {
    if (user.role === "superadmin") return true;
    return permissions.includes(permission);
  };

  if (panel === "student") {
    return STUDENT_MENU_ITEMS.filter((item) => hasPermission(item.permission)).map((item) => item.to);
  }

  const isStaff = panel === "staff" && user.role === "staff";
  const staffExamTypes = user.staffExamTypes || [];

  return ADMIN_MENU_ITEMS.filter((item) => {
    if (!hasPermission(item.permission)) return false;
    if (isStaff && item.examType) return staffExamTypes.includes(item.examType);
    if (isStaff && item.to === "student-performance") return false;
    return true;
  }).map((item) => item.to);
}

export function sanitizeSidebarHiddenItems(hiddenItems, allowedPaths) {
  if (!Array.isArray(hiddenItems)) return [];
  const allowed = new Set(allowedPaths);
  const unique = [];
  for (const item of hiddenItems) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || !allowed.has(trimmed) || unique.includes(trimmed)) continue;
    unique.push(trimmed);
  }
  if (unique.length >= allowedPaths.length) {
    const error = new Error("At least one sidebar menu item must remain visible.");
    error.statusCode = 400;
    throw error;
  }
  return unique;
}
