import { Fragment, Suspense, lazy, useContext, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ThemeContext } from "./context/ThemeContext";
import { validateStoredSession } from "./jsx/starPolice/api";
import type { AuthUser } from "./jsx/starPolice/types";

const AdminLayout = lazy(() => import("./jsx/PanelLayouts").then((m) => ({ default: m.AdminLayout })));
const StaffLayout = lazy(() => import("./jsx/PanelLayouts").then((m) => ({ default: m.StaffLayout })));
const StudentLayout = lazy(() => import("./jsx/PanelLayouts").then((m) => ({ default: m.StudentLayout })));
const AdminDashboard = lazy(() => import("./jsx/starPolice/admin/AdminDashboard"));
const DaywiseUpload = lazy(() => import("./jsx/starPolice/admin/DaywiseUpload"));
const AdminStudentInteraction = lazy(() => import("./jsx/starPolice/admin/StudentInteraction"));
const MonthlyCalendar = lazy(() => import("./jsx/starPolice/admin/MonthlyCalendar"));
const UserManagement = lazy(() => import("./jsx/starPolice/admin/UserManagement"));
const StudentOnboarding = lazy(() => import("./jsx/starPolice/admin/StudentOnboarding"));
const Leads = lazy(() => import("./jsx/starPolice/admin/Leads"));
const StudentPerformanceAdmin = lazy(() => import("./jsx/starPolice/admin/StudentPerformance"));
const StudentDashboard = lazy(() => import("./jsx/starPolice/student/StudentDashboard"));
const StudentMaterials = lazy(() => import("./jsx/starPolice/student/StudentMaterials"));
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
    function resizeHandler() {
      if (window.innerWidth <= 1023) {
        document.body.setAttribute("data-sidebar-style", "overlay");
      } else {
        document.body.setAttribute("data-sidebar-style", "full");
      }
    }

    setTimeout(() => resizeHandler(), 100);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
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

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="daywise-upload" element={<DaywiseUpload />} />
            <Route path="student-interaction" element={<AdminStudentInteraction />} />
            <Route path="monthly-calendar" element={<MonthlyCalendar />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="student-onboarding" element={<StudentOnboarding />} />
            <Route path="leads" element={<Leads />} />
            <Route path="student-performance" element={<StudentPerformanceAdmin />} />
            <Route path="profile" element={<PanelProfile />} />
            <Route path="inbox" element={<PanelInbox />} />
            <Route path="settings" element={<PanelSettings />} />
          </Route>

          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="daywise-upload" element={<DaywiseUpload />} />
            <Route path="student-interaction" element={<AdminStudentInteraction />} />
            <Route path="monthly-calendar" element={<MonthlyCalendar />} />
            <Route path="leads" element={<Leads />} />
            <Route path="student-performance" element={<StudentPerformanceAdmin />} />
            <Route path="profile" element={<PanelProfile />} />
            <Route path="inbox" element={<PanelInbox />} />
            <Route path="settings" element={<PanelSettings />} />
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="materials" element={<StudentMaterials />} />
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
    </Fragment>
  );
}

export default App;
