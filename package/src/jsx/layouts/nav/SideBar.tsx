import { useReducer, useEffect, useContext } from "react";
import { Collapse } from "react-bootstrap";
import { getMenuList } from "./Menu";
import SidebarBrand from "./SidebarBrand";
import { ThemeContext } from "../../../context/ThemeContext";
import type { PanelType } from "../../starPolice/types";

interface SideBarProps {
  basePath?: string;
  panel?: PanelType;
}

interface MenuItem {
  title: string;
  to?: string;
  iconStyle?: JSX.Element;
  update?: string;
  hasMenu?: boolean;
  classsChange?: string;
  content?: MenuItem[];
}

interface State {
  active: string;
  activeSubmenu: string;
}

const reducer = (
  previousState: State,
  updatedState: Partial<State>
): State => ({
  ...previousState,
  ...updatedState,
});

const initialState: State = {
  active: "",
  activeSubmenu: "",
};

const SideBar: React.FC<SideBarProps> = ({ basePath = "/admin", panel = "admin" }) => {
  const [state, setState] = useReducer(reducer, initialState);
  const { setIconhover, auth, openMenuToggle, setOpenMenuToggle } = useContext(ThemeContext);
  const menuList = getMenuList(panel, auth);
  const panelLabel = panel === "student" ? "Student Panel" : "Admin Panel";

  const handleMenuActive = (status: string) => {
    setState({ active: state.active === status ? "" : status });
  };

  const handleSubmenuActive = (status: string) => {
    setState({ activeSubmenu: state.activeSubmenu === status ? "" : status });
  };

  const path = window.location.pathname.split("/").pop() || "";

  useEffect(() => {
    menuList.forEach((data: MenuItem) => {
      if (path === data.to) {
        setState({ active: data.title });
      }
      data.content?.forEach((item) => {
        if (path === item.to) {
          setState({ active: data.title });
        }
        item.content?.forEach((ele) => {
          if (path === ele.to) {
            setState({ activeSubmenu: item.title, active: data.title });
          }
        });
      });
    });
  }, [path, menuList]);

  function hoverHandler() {
    if (document.body.getAttribute("data-sidebar-style")?.includes("icon-hover")) {
      setIconhover(true);
    } else {
      setIconhover(false);
    }
  }

  return (
    <div
      className={`dlabnav spa-modern-sidebar ${panel === "student" ? "spa-modern-sidebar--student" : ""}`}
      onMouseEnter={hoverHandler}
      onMouseLeave={() => setIconhover(false)}
    >
      <div className="dlabnav-scroll spa-sidebar-inner">
        <div className="spa-sidebar-top">
          <div className="spa-sidebar-panel-label">
            <span className="spa-sidebar-panel-dot" />
            <span className="spa-sidebar-panel-text">{panelLabel}</span>
          </div>
          <button
            type="button"
            className="spa-sidebar-toggle"
            aria-label={openMenuToggle ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setOpenMenuToggle((prev) => !prev)}
          >
            <span className="material-symbols-outlined">
              {openMenuToggle ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        <div className="spa-sidebar-menu">
          <ul className="metismenu spa-modern-nav" id="menu">
            {menuList.map((data: MenuItem, index: number) => {
              const menuClass = data.classsChange;
              if (menuClass === "menu-title") {
                return (
                  <li className={menuClass} key={index}>
                    {data.title}
                  </li>
                );
              }

              const itemPath = data.to ? `${basePath}/${data.to}` : "#";
              const isActive = state.active === data.title || path === data.to;

              return (
                <li
                  className={`spa-modern-nav-item ${isActive ? "mm-active" : ""}`}
                  key={index}
                >
                  {data.content && data.content.length > 0 ? (
                    <>
                      <a
                        href="#"
                        className="spa-modern-nav-link has-arrow"
                        onClick={(event) => {
                          event.preventDefault();
                          handleMenuActive(data.title);
                        }}
                      >
                        <span className="spa-modern-nav-icon">{data.iconStyle}</span>
                        <span className="nav-text spa-modern-nav-text">{data.title}</span>
                        {data.update && (
                          <span className="ms-1 badge badge-xs style-1 badge-danger">
                            {data.update}
                          </span>
                        )}
                      </a>
                      <Collapse in={state.active === data.title}>
                        <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                          {data.content.map((item, idx) => {
                            const subPath = item.to ? `${basePath}/${item.to}` : "#";
                            return (
                              <li
                                key={idx}
                                className={`${
                                  state.activeSubmenu === item.title ? "mm-active" : ""
                                }`}
                              >
                                {item.content && item.content.length > 0 ? (
                                  <>
                                    <a
                                      href={subPath}
                                      className={item.hasMenu ? "has-arrow" : ""}
                                      onClick={() => handleSubmenuActive(item.title)}
                                    >
                                      {item.title}
                                    </a>
                                    <Collapse in={state.activeSubmenu === item.title}>
                                      <ul
                                        className={`${
                                          menuClass === "mm-collapse" ? "mm-show" : ""
                                        }`}
                                      >
                                        {item.content.map((subItem, subIdx) => {
                                          const nestedPath = subItem.to
                                            ? `${basePath}/${subItem.to}`
                                            : "#";
                                          return (
                                            <li key={subIdx}>
                                              <a
                                                className={`${
                                                  path === subItem.to ? "mm-active" : ""
                                                }`}
                                                href={nestedPath}
                                              >
                                                {subItem.title}
                                              </a>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </Collapse>
                                  </>
                                ) : (
                                  <a
                                    href={subPath}
                                    className={`${path === item.to ? "mm-active" : ""}`}
                                  >
                                    {item.title}
                                  </a>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </Collapse>
                    </>
                  ) : (
                    <a
                      href={itemPath}
                      className={`spa-modern-nav-link ${path === data.to ? "is-active mm-active" : ""}`}
                    >
                      <span className="spa-modern-nav-icon">{data.iconStyle}</span>
                      <span className="nav-text spa-modern-nav-text">{data.title}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="spa-sidebar-footer">
          <SidebarBrand homePath={`${basePath}/dashboard`} variant="dark" />
          <div className="copyright spa-sidebar-copyright">
            <p>
              <strong>Star Police Academy</strong>
            </p>
            <p className="fs-12">Vellore — No. 1 Police Academy in Tamil Nadu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
