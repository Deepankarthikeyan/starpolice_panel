import type { UserRole } from "../../starPolice/types";

export const AdminMenuList = [
  {
    title: "Dashboard",
    iconStyle: <i className="material-symbols-outlined">dashboard</i>,
    to: "admin-dashboard",
  },
  {
    title: "Daywise Upload",
    iconStyle: <i className="material-symbols-outlined">upload_file</i>,
    to: "admin-daywise-upload",
  },
  {
    title: "Student Interaction",
    iconStyle: <i className="material-symbols-outlined">forum</i>,
    to: "admin-student-interaction",
  },
  {
    title: "Monthly Calendar",
    iconStyle: <i className="material-symbols-outlined">calendar_month</i>,
    to: "admin-monthly-calendar",
  },
];

export const StudentMenuList = [
  {
    title: "Dashboard",
    iconStyle: <i className="material-symbols-outlined">dashboard</i>,
    to: "student-dashboard",
  },
  {
    title: "Study Materials",
    iconStyle: <i className="material-symbols-outlined">folder_open</i>,
    to: "student-materials",
  },
  {
    title: "Admin Interaction",
    iconStyle: <i className="material-symbols-outlined">forum</i>,
    to: "student-interaction",
  },
  {
    title: "Monthly Calendar",
    iconStyle: <i className="material-symbols-outlined">calendar_month</i>,
    to: "student-calendar",
  },
];

export const getMenuList = (role?: UserRole) =>
  role === "student" ? StudentMenuList : AdminMenuList;

// Kept for backward compatibility where MenuList is imported directly.
export const MenuList = AdminMenuList;
