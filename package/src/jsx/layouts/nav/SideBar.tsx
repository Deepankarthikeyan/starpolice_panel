import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMenuList } from "./Menu";
import { ThemeContext } from "../../../context/ThemeContext";
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

  useEffect(() => {
    let lastStyle = document.body.getAttribute("data-sidebar-style");

    function handleLayoutChange() {
      const style = document.body.getAttribute("data-sidebar-style");
      if (lastStyle === "overlay" && (style === "full" || style === "mini")) {
        setOpenMenuToggle(false);
      }
      lastStyle = style;
    }

    window.addEventListener("resize", handleLayoutChange);
    return () => window.removeEventListener("resize", handleLayoutChange);
  }, [setOpenMenuToggle]);

  function hoverHandler() {
    const sidebarStyle = document.body.getAttribute("data-sidebar-style");
    setIconhover(Boolean(sidebarStyle?.includes("icon-hover")));
  }

  const [sidebarStyle, setSidebarStyle] = useState(
    () => document.body.getAttribute("data-sidebar-style") || "full"
  );
  const isOverlay = sidebarStyle === "overlay";

  useEffect(() => {
    const updateSidebarStyle = () => {
      setSidebarStyle(document.body.getAttribute("data-sidebar-style") || "full");
    };
    window.addEventListener("resize", updateSidebarStyle);
    updateSidebarStyle();
    return () => window.removeEventListener("resize", updateSidebarStyle);
  }, []);

  useEffect(() => {
    if (isOverlay) {
      setOpenMenuToggle(false);
    }
  }, [location.pathname, isOverlay, setOpenMenuToggle]);

  useEffect(() => {
    if (isOverlay && openMenuToggle) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [isOverlay, openMenuToggle]);

  const closeMobileMenu = () => {
    if (isOverlay) {
      setOpenMenuToggle(false);
    }
  };

  return (
    <>
      {openMenuToggle && isOverlay && (
        <button
          type="button"
          className="spa-sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setOpenMenuToggle(false)}
        />
      )}

      <button
        type="button"
        className="spa-sidebar-mobile-trigger"
        aria-label={openMenuToggle ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpenMenuToggle(!openMenuToggle)}
      >
        <i className="material-symbols-outlined">{openMenuToggle && isOverlay ? "close" : "menu"}</i>
      </button>

      <aside
        className={`spa-sidebar spa-sidebar-${panel}`}
        onMouseEnter={hoverHandler}
        onMouseLeave={() => setIconhover(false)}
      >
        <div className="spa-sidebar-accent" aria-hidden="true" />

        <div className="spa-sidebar-inner">
          <div className="spa-sidebar-header">
            <span className="spa-sidebar-panel">{panelLabel(panel)}</span>
            <button
              type="button"
              className="spa-sidebar-collapse"
              aria-label="Toggle sidebar"
              onClick={() => setOpenMenuToggle(!openMenuToggle)}
            >
              <i className="material-symbols-outlined">
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
