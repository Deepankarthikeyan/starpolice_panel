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

export const getMenuList = () => AdminMenuList;

export const MenuList = AdminMenuList;
