import { Link, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import logo from "../../../assets/images/star-police-academy-logo.png";
import { ThemeContext } from "../../../context/ThemeContext";
import PanelHeader from "../components/PanelHeader";
import "../styles.css";

const adminLinks = [
  { title: "Dashboard", to: "/admin/dashboard", icon: "dashboard" },
  { title: "Daywise Upload", to: "/admin/daywise-upload", icon: "upload_file" },
  { title: "Student Interaction", to: "/admin/student-interaction", icon: "forum" },
  { title: "Monthly Calendar", to: "/admin/monthly-calendar", icon: "calendar_month" },
];

const AdminLayout = () => {
  const location = useLocation();
  const { openMenuToggle, setOpenMenuToggle } = useContext(ThemeContext);

  return (
    <div
      id="main-wrapper"
      className={`show star-police-nav ${openMenuToggle ? "menu-toggle" : ""}`}
    >
      <div className="nav-header">
        <Link to="/admin/dashboard" className="brand-logo">
          <img src={logo} alt="Star Police Academy" />
        </Link>
        <div className="nav-control" onClick={() => setOpenMenuToggle(!openMenuToggle)}>
          <div className={`hamburger ${openMenuToggle ? "is-active" : ""}`}>
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </div>
      </div>

      <div className="deznav">
        <div className="deznav-scroll">
          <ul className="metismenu" id="menu">
            {adminLinks.map((link) => (
              <li key={link.to} className={location.pathname === link.to ? "mm-active" : ""}>
                <Link to={link.to} className="ai-icon">
                  <i className="material-symbols-outlined">{link.icon}</i>
                  <span className="nav-text">{link.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="content-body" style={{ minHeight: "100vh" }}>
        <div className="container-fluid">
          <PanelHeader title="Admin Panel" />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
