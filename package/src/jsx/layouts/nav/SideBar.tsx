import { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMenuList } from "./Menu";
import { ThemeContext } from "../../../context/ThemeContext";
import fullLogo from "../../../assets/images/star-police-academy-logo.png";
import emblemLogo from "../../../assets/images/star-police-academy-emblem.png";
import type { PanelType } from "../../starPolice/types";

interface SideBarProps {
  basePath?: string;
  panel?: PanelType;
}

function panelLabel(panel: PanelType, role?: string) {
  if (panel === "student") return "Student Panel";
  if (role === "admin") return "Staff Panel";
  return "Admin Panel";
}

const SideBar = ({ basePath = "/admin", panel = "admin" }: SideBarProps) => {
  const location = useLocation();
  const { setIconhover, openMenuToggle, setOpenMenuToggle, auth } = useContext(ThemeContext);
  const menuList = getMenuList(panel, auth);
  const currentSlug = location.pathname.split("/").pop() || "";

  useEffect(() => {
    const mainWrapper = document.querySelector("#main-wrapper") as HTMLDivElement | null;
    if (!mainWrapper) return;

    if (openMenuToggle) {
      mainWrapper.classList.add("menu-toggle");
    } else {
      mainWrapper.classList.remove("menu-toggle");
    }
  }, [openMenuToggle]);

  function hoverHandler() {
    const sidebarStyle = document.body.getAttribute("data-sidebar-style");
    setIconhover(Boolean(sidebarStyle?.includes("icon-hover")));
  }

  return (
    <>
      <button
        type="button"
        className="spa-sidebar-mobile-trigger"
        aria-label="Open navigation menu"
        onClick={() => setOpenMenuToggle(true)}
      >
        <i className="material-symbols-outlined">menu</i>
      </button>

      <aside
        className={`spa-sidebar spa-sidebar-${panel}`}
        onMouseEnter={hoverHandler}
        onMouseLeave={() => setIconhover(false)}
      >
        <div className="spa-sidebar-inner">
          <div className="spa-sidebar-header">
            <Link to={`${basePath}/dashboard`} className="spa-sidebar-logo">
              <img src={emblemLogo} alt="" className="spa-sidebar-logo-icon" aria-hidden="true" />
              <img src={fullLogo} alt="Star Police Academy" className="spa-sidebar-logo-full" />
            </Link>
            <button
              type="button"
              className="spa-sidebar-toggle-btn"
              aria-label="Toggle sidebar"
              onClick={() => setOpenMenuToggle(!openMenuToggle)}
            >
              <i className="material-symbols-outlined">
                {openMenuToggle ? "chevron_right" : "chevron_left"}
              </i>
            </button>
          </div>

          <p className="spa-sidebar-panel-label">{panelLabel(panel, auth?.role)}</p>

          <nav className="spa-sidebar-nav" aria-label="Main navigation">
            <ul className="spa-sidebar-menu">
              {menuList.map((item) => {
                const itemPath = item.to ? `${basePath}/${item.to}` : "#";
                const isActive = currentSlug === item.to;

                return (
                  <li key={item.title} className={isActive ? "is-active" : ""}>
                    <Link to={itemPath} className="spa-sidebar-link" title={item.title}>
                      <span className="spa-sidebar-link-icon">{item.iconStyle}</span>
                      <span className="spa-sidebar-link-text">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="spa-sidebar-footer">
            {auth?.name && (
              <div className="spa-sidebar-user">
                <span className="spa-sidebar-user-avatar">{auth.name.charAt(0).toUpperCase()}</span>
                <div className="spa-sidebar-user-meta">
                  <strong>{auth.name}</strong>
                  <span>{auth.email}</span>
                </div>
              </div>
            )}
            <p className="spa-sidebar-copyright">
              <strong>Star Police Academy</strong>
              <span>Vellore — No. 1 Police Academy in Tamil Nadu</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
