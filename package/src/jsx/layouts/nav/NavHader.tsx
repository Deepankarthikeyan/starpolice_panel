/// React router dom
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import logo from "../../../assets/images/star-police-academy-logo.png";

const NavHader = () => {
  const { auth, openMenuToggle, setOpenMenuToggle } = useContext(ThemeContext);
  const homePath =
    auth?.role === "student" ? "/student-dashboard" : "/admin-dashboard";

  return (
    <div className="nav-header">
      <Link to={homePath} className="brand-logo">
        <img
          className="logo-abbr"
          src={logo}
          alt="Star Police Academy"
          style={{ maxHeight: 48, width: "auto" }}
        />
      </Link>

      <div
        className="nav-control"
        onClick={() => {
          setOpenMenuToggle(!openMenuToggle);
        }}
      >
        <div className={`hamburger ${openMenuToggle ? "is-active" : ""}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="22" y="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="22" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="11" y="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="11" y="22" width="4" height="4" rx="2" fill="#2A353A" />
            <rect width="4" height="4" rx="2" fill="#2A353A" />
            <rect y="11" width="4" height="4" rx="2" fill="#2A353A" />
            <rect x="22" y="22" width="4" height="4" rx="2" fill="#2A353A" />
            <rect y="22" width="4" height="4" rx="2" fill="#2A353A" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
