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
  const { auth, setOpenMenuToggle } = useContext(ThemeContext);
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
              <button
                type="button"
                className="spa-mobile-sidebar-toggle"
                aria-label="Open sidebar menu"
                onClick={() => setOpenMenuToggle((prev) => !prev)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
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
              <Dropdown as="li" className="nav-item  notification_dropdown">
                <Dropdown.Toggle
                  variant=""
                  as="a"
                  className="nav-link  ai-icon i-false c-pointer  me-0"
                >
                  <svg
                    width="20"
                    className="setting-svg"
                    height="20"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.2631 2.66667L11.4167 6.46615C10.9353 6.69779 10.4752 6.96458 10.0339 7.26563L6.32035 6.09636L2.58337 12.5703L5.39848 15.1484C5.28849 15.9648 5.33831 16.3672 5.39848 16.8516L2.58337 19.4297L6.32035 25.9037L10.0339 24.7344C10.4752 25.0354 10.9353 25.3022 11.4167 25.5339L12.2631 29.3333H19.737L20.5834 25.5339C21.0647 25.3022 21.5249 25.0354 21.9662 24.7344L25.6797 25.9037L29.4167 19.4297L26.6016 16.8516C26.6246 16.5682 26.6664 16.2845 26.6667 16C26.6678 15.7069 26.6216 15.4108 26.6016 15.1484L29.4167 12.5703L25.6797 6.09636L21.9662 7.26563C21.5249 6.96458 21.0647 6.69779 20.5834 6.46615L19.737 2.66667H12.2631ZM14.4037 5.33334H17.5964L18.2552 8.29167L18.9167 8.55209C19.6649 8.84512 20.3644 9.24846 20.9922 9.75001L21.5495 10.1927L24.4401 9.28386L26.0365 12.0495L23.8021 14.099L23.9089 14.8021C24.0346 15.5797 24.0101 16.4746 23.9089 17.1979L23.8021 17.901L26.0365 19.9505L24.4401 22.7162L21.5495 21.8073L20.9922 22.25C20.3644 22.7516 19.6649 23.1549 18.9167 23.4479L18.2552 23.7083L17.5964 26.6667H14.4037L13.7448 23.7083L13.0834 23.4479C12.3351 23.1549 11.6357 22.7516 11.0079 22.25L10.4506 21.8073L7.55994 22.7162L5.96358 19.9505L8.19796 17.901L8.09119 17.1979C7.96095 16.4046 7.98095 15.4967 8.09119 14.8021L8.19796 14.099L5.96358 12.0495L7.55994 9.28386L10.4506 10.1927L11.0079 9.75001C11.6357 9.24846 12.3351 8.84512 13.0834 8.55209L13.7448 8.29167L14.4037 5.33334ZM16 10.6667C13.0703 10.6667 10.6667 13.0703 10.6667 16C10.6667 18.9297 13.0703 21.3333 16 21.3333C18.9298 21.3333 21.3334 18.9297 21.3334 16C21.3334 13.0703 18.9298 10.6667 16 10.6667ZM16 13.3333C17.4886 13.3333 18.6667 14.5115 18.6667 16C18.6667 17.4886 17.4886 18.6667 16 18.6667C14.5115 18.6667 13.3334 17.4886 13.3334 16C13.3334 14.5115 14.5115 13.3333 16 13.3333Z"
                      fill="#A098AE"
                    />
                  </svg>
                </Dropdown.Toggle>
                <Dropdown.Menu
                  align="end"
                  className="mt-2 dropdown-menu dropdown-menu-end"
                >
                  <div
                    id="DZ_W_TimeLine02"
                    className="widget-timeline dlab-scroll style-1 p-3 height370"
                  >
                    <ul className="timeline">
                      <li>
                        <div className="timeline-badge primary" />
                        <Link
                          className="timeline-panel c-pointer text-muted"
                          to="#"
                        >
                          <span>10 minutes ago</span>
                          <h6 className="mb-0">
                            Youtube, a video-sharing website, goes live{" "}
                            <strong className="text-primary">$500</strong>.
                          </h6>
                        </Link>
                      </li>
                      <li>
                        <div className="timeline-badge info"></div>
                        <Link
                          className="timeline-panel c-pointer text-muted"
                          to="#"
                        >
                          <span>20 minutes ago</span>
                          <h6 className="mb-0">
                            New order placed{" "}
                            <strong className="text-info">#XF-2356.</strong>
                          </h6>
                          <p className="mb-0">
                            Quisque a consequat ante Sit amet magna at
                            volutapt...
                          </p>
                        </Link>
                      </li>
                      <li>
                        <div className="timeline-badge danger"></div>
                        <Link
                          className="timeline-panel c-pointer text-muted"
                          to="#"
                        >
                          <span>30 minutes ago</span>
                          <h6 className="mb-0">
                            john just buy your product{" "}
                            <strong className="text-warning">Sell $250</strong>
                          </h6>
                        </Link>
                      </li>
                      <li>
                        <div className="timeline-badge success"></div>
                        <Link
                          className="timeline-panel c-pointer text-muted"
                          to="#"
                        >
                          <span>15 minutes ago</span>
                          <h6 className="mb-0">
                            StumbleUpon is acquired by eBay.{" "}
                          </h6>
                        </Link>
                      </li>
                      <li>
                        <div className="timeline-badge warning"></div>
                        <Link
                          className="timeline-panel c-pointer text-muted"
                          to="#"
                        >
                          <span>20 minutes ago</span>
                          <h6 className="mb-0">
                            Mashable, a news website and blog, goes live.
                          </h6>
                        </Link>
                      </li>
                      <li>
                        <div className="timeline-badge dark"></div>
                        <Link
                          className="timeline-panel c-pointer text-muted"
                          to="#"
                        >
                          <span>20 minutes ago</span>
                          <h6 className="mb-0">
                            Mashable, a news website and blog, goes live.
                          </h6>
                        </Link>
                      </li>
                    </ul>
                  </div>
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
