import { Fragment, Suspense, lazy, useContext, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ThemeContext } from "./context/ThemeContext";
import { validateStoredSession } from "./jsx/starPolice/api";
import { UploadQueueTray } from "./jsx/starPolice/shared/UploadTaskList";
import { restorePendingUploads } from "./jsx/starPolice/uploads/uploadQueueStore";
import type { AuthUser } from "./jsx/starPolice/types";

const AdminLayout = lazy(() => import("./jsx/PanelLayouts").then((m) => ({ default: m.AdminLayout })));
const StaffLayout = lazy(() => import("./jsx/PanelLayouts").then((m) => ({ default: m.StaffLayout })));
const StudentLayout = lazy(() => import("./jsx/PanelLayouts").then((m) => ({ default: m.StudentLayout })));
const AdminDashboard = lazy(() => import("./jsx/starPolice/admin/AdminDashboard"));
const DaywiseUpload = lazy(() => import("./jsx/starPolice/admin/DaywiseUpload"));
const AdminStudentInteraction = lazy(() => import("./jsx/starPolice/admin/StudentInteraction"));
const StaffInteraction = lazy(() => import("./jsx/starPolice/staff/StaffInteraction"));
const MonthlyCalendar = lazy(() => import("./jsx/starPolice/admin/MonthlyCalendar"));
const UserManagement = lazy(() => import("./jsx/starPolice/admin/UserManagement"));
const StudentOnboarding = lazy(() => import("./jsx/starPolice/admin/StudentOnboarding"));
const Leads = lazy(() => import("./jsx/starPolice/admin/Leads"));
const StudentPerformanceAdmin = lazy(() => import("./jsx/starPolice/admin/StudentPerformance"));
const StudentAttendance = lazy(() => import("./jsx/starPolice/admin/StudentAttendance"));
const SubjectManagement = lazy(() => import("./jsx/starPolice/admin/SubjectManagement"));
const ExamManagement = lazy(() => import("./jsx/starPolice/admin/ExamManagement"));
const PhysicalExamEntry = lazy(() =>
  import("./jsx/starPolice/admin/ExamMarksEntry").then((m) => ({ default: m.PhysicalExamEntry }))
);
const WrittenExamEntry = lazy(() =>
  import("./jsx/starPolice/admin/ExamMarksEntry").then((m) => ({ default: m.WrittenExamEntry }))
);
const StudentDashboard = lazy(() => import("./jsx/starPolice/student/StudentDashboard"));
const StudentMaterials = lazy(() => import("./jsx/starPolice/student/StudentMaterials"));
const StudentAdminInteraction = lazy(() => import("./jsx/starPolice/student/AdminInteraction"));
const StudentStaffInteraction = lazy(() => import("./jsx/starPolice/student/StaffInteraction"));
const StudentInteraction = lazy(() => import("./jsx/starPolice/student/StudentInteraction"));
const StudentCalendar = lazy(() => import("./jsx/starPolice/student/StudentCalendar"));
const StudentPerformance = lazy(() => import("./jsx/starPolice/student/StudentPerformance"));
const PanelProfile = lazy(() => import("./jsx/starPolice/shared/PanelProfile"));
const PanelSettings = lazy(() => import("./jsx/starPolice/shared/PanelSettings"));
const PanelInbox = lazy(() => import("./jsx/starPolice/shared/PanelInbox"));
const AdminLogin = lazy(() => import("./jsx/pages/auth/AdminLogin"));
const AdminSignup = lazy(() => import("./jsx/pages/auth/AdminSignup"));
const StaffLogin = lazy(() => import("./jsx/pages/auth/StaffLogin"));
const StudentLogin = lazy(() => import("./jsx/pages/auth/StudentLogin"));
const ForgotPassword = lazy(() => import("./jsx/pages/auth/ForgotPassword"));
const SetupPassword = lazy(() => import("./jsx/pages/auth/SetupPassword"));

function Preloader() {
  return (
    <div id="preloader">
      <div className="sk-three-bounce">
        <div className="sk-child sk-bounce1"></div>
        <div className="sk-child sk-bounce2"></div>
        <div className="sk-child sk-bounce3"></div>
      </div>
    </div>
  );
}

function App() {
  const { auth, setAuth } = useContext(ThemeContext);

  useEffect(() => {
    validateStoredSession().then((user) => {
      setAuth(user);
    });
  }, [setAuth]);

  useEffect(() => {
    if (!auth) return;
    void restorePendingUploads();
  }, [auth]);

  useEffect(() => {
    function resizeHandler() {
      if (window.innerWidth <= 1023) {
        document.body.setAttribute("data-sidebar-style", "overlay");
      } else {
        document.body.setAttribute("data-sidebar-style", "full");
      }
    }

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    window.addEventListener("orientationchange", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("orientationchange", resizeHandler);
    };
  }, []);

  const setPanelAuth = (user: AuthUser) => setAuth(user);

  const isAdminAuthed = auth?.panel === "admin" && ["superadmin", "admin"].includes(auth.role);
  const isStaffAuthed = auth?.panel === "staff" && auth.role === "staff";
  const isStudentAuthed = auth?.panel === "student" && auth.role === "student";

  return (
    <Fragment>
      <Suspense fallback={<Preloader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          <Route
            path="/admin/login"
            element={
              isAdminAuthed ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin setAuth={setPanelAuth} />
            }
          />
          <Route
            path="/admin/signup"
            element={
              isAdminAuthed ? <Navigate to="/admin/dashboard" replace /> : <AdminSignup setAuth={setPanelAuth} />
            }
          />
          <Route
            path="/staff/login"
            element={
              isStaffAuthed ? <Navigate to="/staff/dashboard" replace /> : <StaffLogin setAuth={setPanelAuth} />
            }
          />
          <Route
            path="/student/login"
            element={
              isStudentAuthed ? (
                <Navigate to="/student/dashboard" replace />
              ) : (
                <StudentLogin setAuth={setPanelAuth} />
              )
            }
          />

          <Route path="/admin/forgot-password" element={<ForgotPassword panel="admin" />} />
          <Route path="/staff/forgot-password" element={<ForgotPassword panel="staff" />} />
          <Route path="/student/forgot-password" element={<ForgotPassword panel="student" />} />
          <Route path="/auth/setup-password" element={<SetupPassword />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="daywise-upload" element={<DaywiseUpload />} />
            <Route path="interaction" element={<AdminStudentInteraction />} />
            <Route path="student-interaction" element={<Navigate to="interaction" replace />} />
            <Route path="monthly-calendar" element={<MonthlyCalendar />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="student-onboarding" element={<StudentOnboarding />} />
            <Route path="leads" element={<Leads />} />
            <Route path="student-performance" element={<StudentPerformanceAdmin />} />
            <Route path="physical-exam" element={<PhysicalExamEntry />} />
            <Route path="written-exam" element={<WrittenExamEntry />} />
            <Route path="student-attendance" element={<StudentAttendance />} />
            <Route path="master/subjects" element={<SubjectManagement />} />
            <Route path="master/exams" element={<ExamManagement />} />
            <Route path="profile" element={<PanelProfile />} />
            <Route path="inbox" element={<PanelInbox />} />
            <Route path="settings" element={<PanelSettings />} />
          </Route>

          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="daywise-upload" element={<DaywiseUpload />} />
            <Route path="interaction" element={<StaffInteraction />} />
            <Route path="staff-interaction" element={<Navigate to="interaction" replace />} />
            <Route path="student-interaction" element={<Navigate to="interaction" replace />} />
            <Route path="monthly-calendar" element={<MonthlyCalendar />} />
            <Route path="student-performance" element={<StudentPerformanceAdmin />} />
            <Route path="physical-exam" element={<PhysicalExamEntry />} />
            <Route path="written-exam" element={<WrittenExamEntry />} />
            <Route path="student-attendance" element={<StudentAttendance />} />
            <Route path="profile" element={<PanelProfile />} />
            <Route path="inbox" element={<PanelInbox />} />
            <Route path="settings" element={<PanelSettings />} />
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="admin-interaction" element={<StudentAdminInteraction />} />
            <Route path="staff-interaction" element={<StudentStaffInteraction />} />
            <Route path="interaction" element={<StudentInteraction />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="profile" element={<PanelProfile />} />
            <Route path="inbox" element={<PanelInbox />} />
            <Route path="settings" element={<PanelSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Suspense>
      <UploadQueueTray />
    </Fragment>
  );
}

export default App;
