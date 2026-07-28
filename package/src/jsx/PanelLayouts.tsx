import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import { ThemeContext } from "../context/ThemeContext";

export function AdminLayout() {
  const { openMenuToggle, auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "admin" || !["superadmin", "admin", "staff"].includes(auth.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div
      id="main-wrapper"
      className={`show spa-modern-sidebar-shell ${openMenuToggle ? "menu-toggle" : ""}`}
    >
      <Nav basePath="/admin" />
      <div className="content-body" style={{ minHeight: window.screen.height + 20 }}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer changeFooter="out-footer style-2" />
    </div>
  );
}

export function StudentLayout() {
  const { openMenuToggle, auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "student" || auth.role !== "student") {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <div
      id="main-wrapper"
      className={`show spa-modern-sidebar-shell ${openMenuToggle ? "menu-toggle" : ""}`}
    >
      <Nav basePath="/student" panel="student" />
      <div className="content-body" style={{ minHeight: window.screen.height + 20 }}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer changeFooter="out-footer style-2" />
    </div>
  );
}
