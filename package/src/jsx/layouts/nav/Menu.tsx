import type { AuthUser, PanelType } from "../../starPolice/types";
import { hasPermission } from "../../starPolice/permissions";

const AdminMenuList = (auth?: AuthUser | null, panel: PanelType = "admin") => {
  const isStaff = panel === "staff" && auth?.role === "staff";
  const staffExamTypes = auth?.staffExamTypes || [];

  const items = [
    {
      title: "Dashboard",
      iconStyle: <i className="material-symbols-outlined">dashboard</i>,
      to: "dashboard",
      permission: "admin:dashboard" as const,
    },
    {
      title: "Daywise Upload",
      iconStyle: <i className="material-symbols-outlined">upload_file</i>,
      to: "daywise-upload",
      permission: "admin:uploads" as const,
    },
    {
      title: "Student Interaction",
      iconStyle: <i className="material-symbols-outlined">forum</i>,
      to: "student-interaction",
      permission: "admin:messages" as const,
    },
    {
      title: "Monthly Calendar",
      iconStyle: <i className="material-symbols-outlined">calendar_month</i>,
      to: "monthly-calendar",
      permission: "admin:calendar" as const,
    },
    {
      title: "Leads",
      iconStyle: <i className="material-symbols-outlined">contact_page</i>,
      to: "leads",
      permission: "admin:leads" as const,
    },
    {
      title: "Student Performance",
      iconStyle: <i className="material-symbols-outlined">fitness_center</i>,
      to: "student-performance",
      permission: "admin:performance" as const,
    },
    {
      title: "Physical Exam",
      iconStyle: <i className="material-symbols-outlined">sports_score</i>,
      to: "physical-exam",
      permission: "admin:performance" as const,
      examType: "physical_exam" as const,
    },
    {
      title: "Written Exam",
      iconStyle: <i className="material-symbols-outlined">edit_note</i>,
      to: "written-exam",
      permission: "admin:performance" as const,
      examType: "written_exam" as const,
    },
    {
      title: "Student Attendance",
      iconStyle: <i className="material-symbols-outlined">fact_check</i>,
      to: "student-attendance",
      permission: "admin:attendance" as const,
    },
    {
      title: "Student\u00a0Onboarding",
      iconStyle: <i className="material-symbols-outlined">person_add</i>,
      to: "student-onboarding",
      permission: "admin:onboarding" as const,
    },
    {
      title: "User Management",
      iconStyle: <i className="material-symbols-outlined">manage_accounts</i>,
      to: "user-management",
      permission: "admin:users" as const,
    },
    {
      title: "Subjects",
      iconStyle: <i className="material-symbols-outlined">menu_book</i>,
      to: "master/subjects",
      permission: "admin:master" as const,
      section: "master" as const,
    },
    {
      title: "Exams",
      iconStyle: <i className="material-symbols-outlined">assignment</i>,
      to: "master/exams",
      permission: "admin:master" as const,
      section: "master" as const,
    },
  ];

  return items.filter((item) => {
    if (!hasPermission(auth, item.permission)) {
      return false;
    }
    if (isStaff && item.examType) {
      return staffExamTypes.includes(item.examType);
    }
    if (isStaff && item.to === "student-performance") {
      return false;
    }
    return true;
  });
};

const StudentMenuList = (auth?: AuthUser | null) => {
  const items = [
    {
      title: "Dashboard",
      iconStyle: <i className="material-symbols-outlined">dashboard</i>,
      to: "dashboard",
      permission: "student:dashboard" as const,
    },
    {
      title: "Study Materials",
      iconStyle: <i className="material-symbols-outlined">folder_open</i>,
      to: "materials",
      permission: "student:materials" as const,
    },
    {
      title: "Admin Interaction",
      iconStyle: <i className="material-symbols-outlined">forum</i>,
      to: "interaction",
      permission: "student:messages" as const,
    },
    {
      title: "Monthly Calendar",
      iconStyle: <i className="material-symbols-outlined">calendar_month</i>,
      to: "calendar",
      permission: "student:calendar" as const,
    },
    {
      title: "My Performance",
      iconStyle: <i className="material-symbols-outlined">fitness_center</i>,
      to: "performance",
      permission: "student:performance" as const,
    },
  ];

  return items.filter((item) => hasPermission(auth, item.permission));
};

export const getMenuList = (panel: PanelType = "admin", auth?: AuthUser | null) =>
  panel === "student" ? StudentMenuList(auth) : AdminMenuList(auth, panel);

export const MenuList = AdminMenuList();
