import { Link, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import logo from "../../../assets/images/star-police-academy-logo.png";
import { ThemeContext } from "../../../context/ThemeContext";
import PanelHeader from "../components/PanelHeader";
import "../styles.css";

const studentLinks = [
  { title: "Dashboard", to: "/student-panel/dashboard", icon: "dashboard" },
  { title: "Study Materials", to: "/student-panel/materials", icon: "folder_open" },
  { title: "Admin Interaction", to: "/student-panel/interaction", icon: "forum" },
  { title: "Monthly Calendar", to: "/student-panel/calendar", icon: "calendar_month" },
];

const StudentLayout = () => {
  const location = useLocation();
  const { openMenuToggle, setOpenMenuToggle } = useContext(ThemeContext);

  return (
    <div
      id="main-wrapper"
      className={`show star-police-nav ${openMenuToggle ? "menu-toggle" : ""}`}
    >
      <div className="nav-header">
        <Link to="/student-panel/dashboard" className="brand-logo">
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
            {studentLinks.map((link) => (
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
          <PanelHeader title="Student Panel" />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
