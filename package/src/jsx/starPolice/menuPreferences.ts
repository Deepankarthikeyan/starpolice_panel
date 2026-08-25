import {
  ADMIN_PERMISSIONS,
  STUDENT_PERMISSIONS,
  hasPermission,
} from "./permissions";
import type { AuthUser, PanelType } from "./types";

export interface SidebarMenuOption {
  to: string;
  title: string;
  description: string;
  section?: "master";
}

function descriptionForPermission(permission: string) {
  const match =
    ADMIN_PERMISSIONS.find((item) => item.key === permission) ||
    STUDENT_PERMISSIONS.find((item) => item.key === permission);
  return match?.description || "";
}

export function getSidebarMenuOptions(panel: PanelType, auth?: AuthUser | null): SidebarMenuOption[] {
  if (!auth) return [];

  if (panel === "student") {
    return [
      { to: "dashboard", title: "Dashboard", description: descriptionForPermission("student:dashboard"), permission: "student:dashboard" },
      { to: "materials", title: "Study Materials", description: descriptionForPermission("student:materials"), permission: "student:materials" },
      { to: "questions", title: "Questions", description: descriptionForPermission("student:questions"), permission: "student:questions" },
      {
        to: "interaction",
        title: "Admin & Staff Interaction",
        description: descriptionForPermission("student:messages"),
        permission: "student:messages",
      },
      { to: "calendar", title: "Monthly Calendar", description: descriptionForPermission("student:calendar"), permission: "student:calendar" },
      { to: "performance", title: "My Performance", description: descriptionForPermission("student:performance"), permission: "student:performance" },
    ]
      .filter((item) => hasPermission(auth, item.permission as never))
      .map(({ permission: _permission, ...item }) => item);
  }

  const isStaff = panel === "staff" && auth.role === "staff";
  const staffExamTypes = auth.staffExamTypes || [];

  const adminItems: Array<SidebarMenuOption & { permission: string; examType?: string }> = [
    { to: "dashboard", title: "Dashboard", description: descriptionForPermission("admin:dashboard"), permission: "admin:dashboard" },
    { to: "daywise-upload", title: "Daywise Upload", description: descriptionForPermission("admin:uploads"), permission: "admin:uploads" },
    { to: "questions", title: "Questions", description: descriptionForPermission("admin:questions"), permission: "admin:questions" },
    { to: "interaction", title: "Interaction", description: descriptionForPermission("admin:messages"), permission: "admin:messages" },
    { to: "monthly-calendar", title: "Monthly Calendar", description: descriptionForPermission("admin:calendar"), permission: "admin:calendar" },
    { to: "leads", title: "Leads", description: descriptionForPermission("admin:leads"), permission: "admin:leads" },
    { to: "student-performance", title: "Student Performance", description: descriptionForPermission("admin:performance"), permission: "admin:performance" },
    { to: "physical-exam", title: "Physical Exam", description: descriptionForPermission("admin:performance"), permission: "admin:performance", examType: "physical_exam" },
    { to: "written-exam", title: "Written Exam", description: descriptionForPermission("admin:performance"), permission: "admin:performance", examType: "written_exam" },
    { to: "student-attendance", title: "Student Attendance", description: descriptionForPermission("admin:attendance"), permission: "admin:attendance" },
    { to: "student-onboarding", title: "Student Onboarding", description: descriptionForPermission("admin:onboarding"), permission: "admin:onboarding" },
    { to: "user-management", title: "User Management", description: descriptionForPermission("admin:users"), permission: "admin:users" },
    { to: "master/subjects", title: "Subjects", description: descriptionForPermission("admin:master"), permission: "admin:master", section: "master" },
    { to: "master/exams", title: "Exams", description: descriptionForPermission("admin:master"), permission: "admin:master", section: "master" },
  ];

  return adminItems
    .filter((item) => {
      if (!hasPermission(auth, item.permission as never)) return false;
      if (isStaff && item.examType) return staffExamTypes.includes(item.examType as never);
      if (isStaff && item.to === "student-performance") return false;
      return true;
    })
    .map(({ permission: _permission, examType: _examType, ...item }) => item);
}

export function filterHiddenSidebarItems<T extends { to: string }>(
  items: T[],
  hiddenItems: string[] = [],
) {
  const hidden = new Set(hiddenItems);
  return items.filter((item) => !hidden.has(item.to));
}
