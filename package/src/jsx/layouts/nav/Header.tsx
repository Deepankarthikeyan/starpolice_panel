import { useState, useEffect, useContext, useCallback, type MouseEvent } from "react";

import { Link } from "react-router-dom";
/// Scroll
import { Dropdown } from "react-bootstrap";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../../starPolice/api";
import { usePolling } from "../../starPolice/usePolling";
import type { AppNotification } from "../../starPolice/types";

import ProfileDropdown from "./ProfileDropdown";

/// Image
import profile from "../../../assets/images/user.jpg";

interface propType {
  onNote: () => void;
  onNotification?: () => void;
  onProfile?: () => void;
  toggle?: string;
  title?: string;
  onBox?: () => void;
  onClick?: () => void;
}

const Header = ({ onNote }: propType) => {
  const { auth } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!auth?.token) return;
    const summary = await api.getNotificationSummary();
    setNotifications(summary.items);
    setUnreadCount(summary.unreadCount);
  }, [auth?.token]);

  usePolling(loadNotifications, 30000, Boolean(auth?.token));

  const notificationIconClass = (type: AppNotification["type"]) => {
    if (type === "message") return "media-info";
    if (type === "upload") return "media-success";
    if (type === "alert") return "media-danger";
    return "media-primary";
  };

  const markAllRead = async (event: MouseEvent) => {
    event.preventDefault();
    try {
      await api.markAllNotificationsRead();
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  //For header fixed
  const [headerFix, setheaderFix] = useState(false);
  useEffect(() => {
    const onScroll = () => setheaderFix(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [themeMode, setThemeMode] = useState<boolean>(false);
  const handleThemeMode = () => {
    if (document.body.getAttribute("data-theme-version")?.includes("light")) {
      document.body.setAttribute("data-theme-version", "dark");
      setThemeMode(true);
    } else {
      document.body.setAttribute("data-theme-version", "light");
      setThemeMode(false);
    }
  };
  const [changeScreen, setChangeScreen] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState(false);
  const EnterFullScreen = () => {
    setFullscreen(!fullscreen);
    if (fullscreen) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const path = window.location.pathname.split("/");
  const name = path[path.length - 1].split("-");
  const filterName = name.length >= 3 ? name.filter((_, i) => i > 0) : name;
  const finalName = filterName.includes("app")
    ? filterName.filter((f) => f !== "app")
    : filterName.includes("ui")
    ? filterName.filter((f) => f !== "ui")
    : filterName.includes("uc")
    ? filterName.filter((f) => f !== "uc")
    : filterName.includes("basic")
    ? filterName.filter((f) => f !== "basic")
    : filterName.includes("jquery")
    ? filterName.filter((f) => f !== "jquery")
    : filterName.includes("table")
    ? filterName.filter((f) => f !== "table")
    : filterName.includes("page")
    ? filterName.filter((f) => f !== "page")
    : filterName.includes("email")
    ? filterName.filter((f) => f !== "email")
    : filterName.includes("ecom")
    ? filterName.filter((f) => f !== "ecom")
    : filterName.includes("chart")
    ? filterName.filter((f) => f !== "chart")
    : filterName.includes("editor")
    ? filterName.filter((f) => f !== "editor")
    : filterName;
  return (
    <div className={`header ${headerFix ? "sticky" : ""}`}>
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left">
              <div
                className="dashboard_bar"
                style={{ textTransform: "capitalize" }}
              >
                {finalName.join(" ").length === 0
                  ? "Dashboard"
                  : finalName.join(" ") === "dashboard dark"
                  ? "Dashboard"
                  : finalName.join(" ")}
              </div>
            </div>
            <ul className="navbar-nav header-right">
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  to={"#"}
                  className={`nav-link bell dz-theme-mode ${
                    themeMode ? "active" : ""
                  }
					`}
                  onClick={() => handleThemeMode()}
                >
                  <i id="icon-light-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-sun"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  </i>
                  <i id="icon-dark-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-moon"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  </i>
                </Link>
              </li>
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  to={"#"}
                  className={`nav-link bell dz-fullscreen ${
                    changeScreen ? "active" : ""
                  }`}
                  onClick={() => {
                    EnterFullScreen();
                    setChangeScreen(!changeScreen);
                  }}
                >
                  <svg
                    id="icon-full-1"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="css-i6dzq1"
                  >
                    <path
                      d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                      style={{
                        strokeDasharray: "37, 57",
                        strokeDashoffset: "0",
                      }}
                    ></path>
                  </svg>
                  <svg
                    id="icon-minimize-1"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="A098AE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-minimize"
                  >
                    <path
                      d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                      style={{
                        strokeDasharray: "37, 57",
                        strokeDashoffset: "0",
                      }}
                    ></path>
                  </svg>
                </Link>
              </li>
              <Dropdown
                as="li"
                className="nav-item dropdown notification_dropdown "
              >
                <Dropdown.Toggle
                  variant=""
                  as="a"
                  className="nav-link bell bell-link i-false c-pointer nav-action"
                  onClick={() => onNote()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A098AE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-message-square"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </Dropdown.Toggle>
              </Dropdown>
              <Dropdown
                as="li"
                className="nav-item bell-icon blink notification_dropdown"
              >
                <Dropdown.Toggle
                  className="nav-link i-false c-pointer"
                  variant=""
                  as="a"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M25.3677 18.9391V9.86768C25.3677 4.70215 21.1655 0.5 16 0.5C10.8345 0.5 6.63232 4.70215 6.63232 9.86768V18.9397C4.96704 19.4224 3.73828 20.9544 3.73828 22.8374C3.73828 25.0386 5.5293 26.8296 7.73096 26.8296H11.377V26.877C11.377 29.4263 13.4507 31.5 16 31.5C18.5493 31.5 20.6231 29.4263 20.6231 26.8769V26.8296H24.2691C26.4707 26.8296 28.2617 25.0386 28.2617 22.7583C28.2617 20.9406 27.033 19.4198 25.3677 18.9391ZM9.63232 9.86768C9.63232 6.35645 12.4888 3.5 16 3.5C19.5112 3.5 22.3677 6.35645 22.3677 9.86768V18.7661H9.63232V9.86768ZM17.6231 26.8769C17.6231 27.772 16.895 28.5 16 28.5C15.105 28.5 14.377 27.772 14.377 26.8769V26.8296H17.623V26.8769H17.6231ZM24.269 23.8296H7.73096C7.1836 23.8296 6.73828 23.3843 6.73828 22.7583C6.73828 22.2114 7.18359 21.7661 7.73096 21.7661H24.2691C24.8164 21.7661 25.2617 22.2114 25.2617 22.8374C25.2617 23.3843 24.8164 23.8296 24.269 23.8296Z"
                      fill="#A098AE"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="badge light text-white bg-primary rounded-circle position-absolute top-0 end-0">
                      {unreadCount}
                    </span>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  className="dropdown-menu mt-2 dropdown-menu-end of-visible"
                >
                  <div className="dropdown-header">
                    <h4 className="title mb-0">Notification</h4>
                    <Link to={"#"} className="d-none">
                      <i className="flaticon-381-settings-6"></i>
                    </Link>
                  </div>
                  <div
                    id="DZ_W_Notification1"
                    className="widget-media dlab-scroll p-3"
                    style={{ height: "380px" }}
                  >
                    <ul className="timeline">
                      {notifications.length === 0 ? (
                        <li className="p-3 text-muted text-center">No notifications yet.</li>
                      ) : (
                        notifications.map((item) => (
                          <li key={item.id}>
                            <div className="timeline-panel">
                              <div
                                className={`media me-2 ${notificationIconClass(item.type)}`}
                              >
                                {item.type === "upload" ? (
                                  <i className="fa fa-file" />
                                ) : item.type === "message" ? (
                                  <i className="fa fa-comment" />
                                ) : (
                                  <i className="fa fa-bell" />
                                )}
                              </div>
                              <div className="media-body">
                                <h6 className="mb-1">{item.title}</h6>
                                <p className="mb-1 small">{item.message}</p>
                                <small className="d-block">
                                  {new Date(item.createdAt).toLocaleString()}
                                </small>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  <Link className="all-notification" to="#" onClick={markAllRead}>
                    Mark all as read <i className="ti-arrow-right" />
                  </Link>
                </Dropdown.Menu>
              </Dropdown>

              <li className="nav-item ">
                <Dropdown className="dropdown header-profile2">
                  <Dropdown.Toggle
                    variant=""
                    as="a"
                    className="nav-link i-false c-pointer ms-0"
                  >
                    <div className="header-info2 d-flex align-items-center">
                      <img src={profile} alt={auth?.name ?? "Profile"} />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    className="mt-1 dropdown-menu dropdown-menu-end p-0 border-0"
                  >
                    <ProfileDropdown />
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
