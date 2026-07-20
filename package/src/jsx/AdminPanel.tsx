import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import { ThemeContext } from "../context/ThemeContext";
import AdminDashboard from "./starPolice/admin/AdminDashboard";
import DaywiseUpload from "./starPolice/admin/DaywiseUpload";
import AdminStudentInteraction from "./starPolice/admin/StudentInteraction";
import MonthlyCalendar from "./starPolice/admin/MonthlyCalendar";
import UserManagement from "./starPolice/admin/UserManagement";

function AdminLayout() {
  const { openMenuToggle } = useContext(ThemeContext);
  return (
    <div id="main-wrapper" className={`show ${openMenuToggle ? "menu-toggle" : ""}`}>
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

const AdminPanel = () => {
  const { auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="daywise-upload" element={<DaywiseUpload />} />
        <Route path="student-interaction" element={<AdminStudentInteraction />} />
        <Route path="monthly-calendar" element={<MonthlyCalendar />} />
        <Route path="user-management" element={<UserManagement auth={auth} />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminPanel;
