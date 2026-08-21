import { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMenuList } from "./Menu";
import { ThemeContext, MOBILE_NAV_QUERY } from "../../../context/ThemeContext";
import fullLogo from "../../../assets/images/star-police-academy-logo-white.png";
import emblemLogo from "../../../assets/images/star-police-academy-emblem.png";
import type { PanelType } from "../../starPolice/types";

interface SideBarProps {
  basePath?: string;
  panel?: PanelType;
}

function panelLabel(panel: PanelType) {
  if (panel === "student") return "Student Panel";
  if (panel === "staff") return "Staff Panel";
  return "Admin Panel";
}

const SideBar = ({ basePath = "/admin", panel = "admin" }: SideBarProps) => {
  const location = useLocation();
  const { setIconhover, openMenuToggle, setOpenMenuToggle, isMobileNav, auth } = useContext(ThemeContext);
  const menuList = getMenuList(panel, auth);
  const currentSlug = location.pathname.split("/").pop() || "";
  const drawerOpen = openMenuToggle && isMobileNav;

  function isOverlayViewport() {
    return window.matchMedia(MOBILE_NAV_QUERY).matches;
  }

  useEffect(() => {
    setOpenMenuToggle((open) => (isOverlayViewport() ? false : open));
  }, [location.pathname, setOpenMenuToggle]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuToggle(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, setOpenMenuToggle]);

  function hoverHandler() {
    const sidebarStyle = document.body.getAttribute("data-sidebar-style");
    setIconhover(Boolean(sidebarStyle?.includes("icon-hover")));
  }

  const closeMobileMenu = () => {
    if (isMobileNav || isOverlayViewport()) {
      setOpenMenuToggle(false);
    }
  };

  const toggleMenu = () => {
    setOpenMenuToggle((open) => !open);
  };

  return (
    <>
      {openMenuToggle && (
        <button
          type="button"
          className="spa-sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        id="spa-sidebar"
        className={`spa-sidebar spa-sidebar-${panel}${openMenuToggle ? " is-open" : ""}`}
        aria-hidden={isMobileNav ? !openMenuToggle : undefined}
        onMouseEnter={hoverHandler}
        onMouseLeave={() => setIconhover(false)}
      >
        <div className="spa-sidebar-accent" aria-hidden="true" />

        <div className="spa-sidebar-inner">
          <div className="spa-sidebar-header">
            <span className="spa-sidebar-panel">{panelLabel(panel)}</span>
            <button
              type="button"
              className="spa-sidebar-close"
              aria-label="Close navigation menu"
              onClick={closeMobileMenu}
            >
              <i className="material-symbols-outlined" aria-hidden="true">close</i>
            </button>
            <button
              type="button"
              className="spa-sidebar-collapse"
              aria-label="Toggle sidebar"
              onClick={toggleMenu}
            >
              <i className="material-symbols-outlined" aria-hidden="true">
                {openMenuToggle ? "chevron_right" : "chevron_left"}
              </i>
            </button>
          </div>

          <div className="spa-sidebar-meta">
            {auth?.name && (
              <div className="spa-sidebar-user">
                <span className="spa-sidebar-user-avatar">{auth.name.charAt(0).toUpperCase()}</span>
                <div className="spa-sidebar-user-info">
                  <strong>{auth.name}</strong>
                  <span>{auth.email}</span>
                </div>
              </div>
            )}
          </div>

          <nav className="spa-sidebar-nav" aria-label="Main navigation">
            <p className="spa-sidebar-nav-label">Menu</p>
            <ul className="spa-sidebar-menu">
              {menuList
                .filter((item) => !("section" in item && item.section === "master"))
                .map((item) => {
                  const itemPath = item.to ? `${basePath}/${item.to}` : "#";
                  const isActive = currentSlug === item.to || location.pathname.includes(item.to);

                  return (
                    <li key={item.title} className={isActive ? "is-active" : ""}>
                      <Link
                        to={itemPath}
                        className="spa-sidebar-link"
                        title={item.title}
                        onClick={closeMobileMenu}
                      >
                        <span className="spa-sidebar-link-icon">{item.iconStyle}</span>
                        <span className="spa-sidebar-link-text">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>

            {menuList.some((item) => "section" in item && item.section === "master") && (
              <>
                <p className="spa-sidebar-nav-label">Master</p>
                <ul className="spa-sidebar-menu">
                  {menuList
                    .filter((item) => "section" in item && item.section === "master")
                    .map((item) => {
                      const itemPath = item.to ? `${basePath}/${item.to}` : "#";
                      const isActive = location.pathname.includes(item.to);

                      return (
                        <li key={item.title} className={isActive ? "is-active" : ""}>
                          <Link
                            to={itemPath}
                            className="spa-sidebar-link"
                            title={item.title}
                            onClick={closeMobileMenu}
                          >
                            <span className="spa-sidebar-link-icon">{item.iconStyle}</span>
                            <span className="spa-sidebar-link-text">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </>
            )}
          </nav>

          <div className="spa-sidebar-footer">
            <Link to={`${basePath}/dashboard`} className="spa-sidebar-brand" onClick={closeMobileMenu}>
              <img src={emblemLogo} alt="" className="spa-sidebar-brand-icon" aria-hidden="true" />
              <img src={fullLogo} alt="Star Police Academy" className="spa-sidebar-brand-logo" />
            </Link>
            <p className="spa-sidebar-footer-title">Star Police Academy</p>
            <p className="spa-sidebar-footer-text">Vellore — No. 1 Police Academy in Tamil Nadu</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
