import "react-datepicker/dist/react-datepicker.css";
import "nouislider/distribute/nouislider.css";
import "ckeditor5/ckeditor5.css";
import "./assets/css/style.css";
import "./assets/css/star-police-brand.css";

import { Fragment, Suspense, useContext, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AdminPanel from "./jsx/AdminPanel";
import StudentPanel from "./jsx/StudentPanel";
import AdminLogin from "./jsx/pages/auth/AdminLogin";
import AdminSignup from "./jsx/pages/auth/AdminSignup";
import StudentLogin from "./jsx/pages/auth/StudentLogin";
import { ThemeContext } from "./context/ThemeContext";
import { clearAuth, getStoredAuth } from "./jsx/starPolice/api";
import type { AuthUser, PanelType } from "./jsx/starPolice/types";

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
  const location = useLocation();

  function resizeHandler() {
    if (window.innerWidth <= 775) {
      document.body.setAttribute("data-sidebar-style", "overlay");
    } else if (window.innerWidth >= 1024) {
      document.body.setAttribute("data-sidebar-style", "full");
    } else {
      document.body.setAttribute("data-sidebar-style", "mini");
    }
  }

  useEffect(() => {
    setTimeout(() => resizeHandler(), 100);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    const panel: PanelType = location.pathname.startsWith("/student") ? "student" : "admin";
    const stored = getStoredAuth(panel);
    if (stored) {
      if (
        (panel === "admin" && ["superadmin", "admin"].includes(stored.role)) ||
        (panel === "student" && stored.role === "student")
      ) {
        setAuth(stored);
        return;
      }
      clearAuth(panel);
    }
    setAuth(null);
  }, [location.pathname, setAuth]);

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

          <Route
            path="/admin/*"
            element={isAdminAuthed ? <AdminPanel /> : <Navigate to="/admin/login" replace />}
          />
          <Route
            path="/student/*"
            element={isStudentAuthed ? <StudentPanel /> : <Navigate to="/student/login" replace />}
          />

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Suspense>
    </Fragment>
  );
}

export default App;
