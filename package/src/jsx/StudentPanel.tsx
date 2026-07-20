import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import { ThemeContext } from "../context/ThemeContext";
import StudentDashboard from "./starPolice/student/StudentDashboard";
import StudentMaterials from "./starPolice/student/StudentMaterials";
import StudentInteraction from "./starPolice/student/StudentInteraction";
import StudentCalendar from "./starPolice/student/StudentCalendar";

function StudentLayout() {
  const { openMenuToggle } = useContext(ThemeContext);
  return (
    <div id="main-wrapper" className={`show ${openMenuToggle ? "menu-toggle" : ""}`}>
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

const StudentPanel = () => {
  const { auth } = useContext(ThemeContext);

  if (!auth || auth.panel !== "student") {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="interaction" element={<StudentInteraction />} />
        <Route path="calendar" element={<StudentCalendar />} />
      </Route>
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
};

export default StudentPanel;
