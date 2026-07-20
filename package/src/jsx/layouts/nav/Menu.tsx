import type { AuthUser } from "../../starPolice/types";

export const AdminMenuList = (_auth?: AuthUser | null) => {
  const items = [
    {
      title: "Dashboard",
      iconStyle: <i className="material-symbols-outlined">dashboard</i>,
      to: "dashboard",
    },
    {
      title: "Daywise Upload",
      iconStyle: <i className="material-symbols-outlined">upload_file</i>,
      to: "daywise-upload",
    },
    {
      title: "Student Interaction",
      iconStyle: <i className="material-symbols-outlined">forum</i>,
      to: "student-interaction",
    },
    {
      title: "Monthly Calendar",
      iconStyle: <i className="material-symbols-outlined">calendar_month</i>,
      to: "monthly-calendar",
    },
    {
      title: "User Management",
      iconStyle: <i className="material-symbols-outlined">manage_accounts</i>,
      to: "user-management",
    },
  ];

  return items;
};

export const StudentMenuList = [
  {
    title: "Dashboard",
    iconStyle: <i className="material-symbols-outlined">dashboard</i>,
    to: "dashboard",
  },
  {
    title: "Study Materials",
    iconStyle: <i className="material-symbols-outlined">folder_open</i>,
    to: "materials",
  },
  {
    title: "Admin Interaction",
    iconStyle: <i className="material-symbols-outlined">forum</i>,
    to: "interaction",
  },
  {
    title: "Monthly Calendar",
    iconStyle: <i className="material-symbols-outlined">calendar_month</i>,
    to: "calendar",
  },
];

export const getMenuList = (panel: "admin" | "student" = "admin", auth?: AuthUser | null) =>
  panel === "student" ? StudentMenuList : AdminMenuList(auth);

export const MenuList = AdminMenuList();
