/// React router dom
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import fullLogo from "../../../assets/images/star-police-academy-logo-white.png";
import emblemLogo from "../../../assets/images/star-police-academy-emblem.png";

const NavHader = () => {
  const { openMenuToggle, setOpenMenuToggle } = useContext(ThemeContext);
  const homePath = "/admin-dashboard";

  return (
    <div className="nav-header">
      <Link to={homePath} className="brand-logo star-police-brand-logo">
        <img
          className="logo-abbr star-police-logo-icon"
          src={emblemLogo}
          alt="Star Police Academy"
        />
        <img
          className="brand-title star-police-logo-full"
          src={fullLogo}
          alt="Star Police Academy"
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
