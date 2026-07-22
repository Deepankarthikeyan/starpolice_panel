import { Fragment, Suspense, useContext, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout, StudentLayout } from "./jsx/PanelLayouts";
import AdminDashboard from "./jsx/starPolice/admin/AdminDashboard";
import DaywiseUpload from "./jsx/starPolice/admin/DaywiseUpload";
import AdminStudentInteraction from "./jsx/starPolice/admin/StudentInteraction";
import MonthlyCalendar from "./jsx/starPolice/admin/MonthlyCalendar";
import UserManagement from "./jsx/starPolice/admin/UserManagement";
import StudentDashboard from "./jsx/starPolice/student/StudentDashboard";
import StudentMaterials from "./jsx/starPolice/student/StudentMaterials";
import StudentInteraction from "./jsx/starPolice/student/StudentInteraction";
import StudentCalendar from "./jsx/starPolice/student/StudentCalendar";
import AdminLogin from "./jsx/pages/auth/AdminLogin";
import AdminSignup from "./jsx/pages/auth/AdminSignup";
import StudentLogin from "./jsx/pages/auth/StudentLogin";
import { ThemeContext } from "./context/ThemeContext";
import type { AuthUser } from "./jsx/starPolice/types";

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
    function resizeHandler() {
      if (window.innerWidth <= 775) {
        document.body.setAttribute("data-sidebar-style", "overlay");
      } else if (window.innerWidth >= 1024) {
        document.body.setAttribute("data-sidebar-style", "full");
      } else {
        document.body.setAttribute("data-sidebar-style", "mini");
      }
    }

    setTimeout(() => resizeHandler(), 100);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const setPanelAuth = (user: AuthUser) => setAuth(user);

  const isAdminAuthed = auth?.panel === "admin" && ["superadmin", "admin"].includes(auth.role);
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
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="interaction" element={<StudentInteraction />} />
            <Route path="calendar" element={<StudentCalendar />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Suspense>
    </Fragment>
  );
}

export default App;
