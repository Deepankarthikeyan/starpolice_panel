import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import { ThemeContext } from "../context/ThemeContext";

export function AdminLayout() {
  const { openMenuToggle, isMobileNav, auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "admin" || !["superadmin", "admin"].includes(auth.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div
      id="main-wrapper"
      className={`show ${openMenuToggle ? (isMobileNav ? "spa-mobile-nav-open" : "menu-toggle") : ""}`}
    >
      <Nav basePath="/admin" panel="admin" />
      <div className="content-body spa-content-body">
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer changeFooter="out-footer style-2" />
    </div>
  );
}

export function StaffLayout() {
  const { openMenuToggle, isMobileNav, auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "staff" || auth.role !== "staff") {
    return <Navigate to="/staff/login" replace />;
  }

  return (
    <div
      id="main-wrapper"
      className={`show ${openMenuToggle ? (isMobileNav ? "spa-mobile-nav-open" : "menu-toggle") : ""}`}
    >
      <Nav basePath="/staff" panel="staff" />
      <div className="content-body spa-content-body">
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer changeFooter="out-footer style-2" />
    </div>
  );
}

export function StudentLayout() {
  const { openMenuToggle, isMobileNav, auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "student" || auth.role !== "student") {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <div
      id="main-wrapper"
      className={`show ${openMenuToggle ? (isMobileNav ? "spa-mobile-nav-open" : "menu-toggle") : ""}`}
    >
      <Nav basePath="/student" panel="student" />
      <div className="content-body spa-content-body">
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
      <Footer changeFooter="out-footer style-2" />
    </div>
  );
}
