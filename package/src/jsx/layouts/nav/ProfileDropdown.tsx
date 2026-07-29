import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import type { UserRole } from "../../starPolice/types";
import LogoutPage from "./Logout";
import profile from "../../../assets/images/user.jpg";

function formatRole(role: UserRole) {
  if (role === "superadmin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Student";
}

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="svg-main-icon">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <polygon points="0 0 24 0 24 24 0 24" />
      <path
        d="M12,11 C9.790861,11 8,9.209139 8,7 C8,4.790861 9.790861,3 12,3 C14.209139,3 16,4.790861 16,7 C16,9.209139 14.209139,11 12,11 Z"
        fill="#000000"
        fillRule="nonzero"
        opacity="0.3"
      />
      <path
        d="M3.00065168,20.1992055 C3.38825852,15.4265159 7.26191235,13 11.9833413,13 C16.7712164,13 20.7048837,15.2931929 20.9979143,20.2 C21.0095879,20.3954741 20.9979143,21 20.2466999,21 C16.541124,21 11.0347247,21 3.72750223,21 C3.47671215,21 2.97953825,20.45918 3.00065168,20.1992055 Z"
        fill="var(--primary)"
        fillRule="nonzero"
      />
    </g>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="svg-main-icon">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <rect x="0" y="0" width="24" height="24" />
      <path
        d="M21.9999843,15.009808 L22.0249378,15 L22.0249378,19.5857864 C22.0249378,20.1380712 21.5772226,20.5857864 21.0249378,20.5857864 C20.7597213,20.5857864 20.5053674,20.4804296 20.317831,20.2928932 L18.0249378,18 L5,18 C3.34314575,18 2,16.6568542 2,15 L2,6 C2,4.34314575 3.34314575,3 5,3 L19,3 C20.6568542,3 22,4.34314575 22,6 L22,15 C22,15.0032706 21.9999948,15.0065399 21.9999843,15.009808 Z M6.16794971,10.5547002 C7.67758127,12.8191475 9.64566871,14 12,14 C14.3543313,14 16.3224187,12.8191475 17.8320503,10.5547002 C18.1384028,10.0951715 18.0142289,9.47430216 17.5547002,9.16794971 C17.0951715,8.86159725 16.4743022,8.98577112 16.1679497,9.4452998 C15.0109146,11.1808525 13.6456687,12 12,12 C10.3543313,12 8.9890854,11.1808525 7.83205029,9.4452998 C7.52569784,8.98577112 6.90482849,8.86159725 6.4452998,9.16794971 C5.98577112,9.47430216 5.86159725,10.0951715 6.16794971,10.5547002 Z"
        fill="var(--primary)"
      />
    </g>
  </svg>
);

const InboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="svg-main-icon">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <rect x="0" y="0" width="24" height="24" />
      <path
        d="M21,12.0829584 C20.6747915,12.0283988 20.3407122,12 20,12 C16.6862915,12 14,14.6862915 14,18 C14,18.3407122 14.0283988,18.6747915 14.0829584,19 L5,19 C3.8954305,19 3,18.1045695 3,17 L3,8 C3,6.8954305 3.8954305,6 5,6 L19,6 C20.1045695,6 21,6.8954305 21,8 L21,12.0829584 Z M18.1444251,7.83964668 L12,11.1481833 L5.85557487,7.83964668 C5.4908718,7.6432681 5.03602525,7.77972206 4.83964668,8.14442513 C4.6432681,8.5091282 4.77972206,8.96397475 5.14442513,9.16035332 L11.6444251,12.6603533 C11.8664074,12.7798822 12.1335926,12.7798822 12.3555749,12.6603533 L18.8555749,9.16035332 C19.2202779,8.96397475 19.3567319,8.5091282 19.1603533,8.14442513 C18.9639747,7.77972206 18.5091282,7.6432681 18.1444251,7.83964668 Z"
        fill="#000000"
      />
      <circle fill="var(--primary)" opacity="0.3" cx="19.5" cy="17.5" r="2.5" />
    </g>
  </svg>
);

const ProfileDropdown = () => {
  const { auth } = useContext(ThemeContext);
  const basePath = auth?.panel === "student" ? "/student" : "/admin";

  const menuItems = [
    { label: "Profile", to: `${basePath}/profile`, icon: <ProfileIcon /> },
    {
      label: "Message",
      to: auth?.panel === "student" ? `${basePath}/interaction` : `${basePath}/student-interaction`,
      icon: <MessageIcon />,
    },
    { label: "Inbox", to: `${basePath}/inbox`, icon: <InboxIcon /> },
  ];

  return (
    <div className="card mb-0 spa-profile-dropdown">
      <div className="card-header p-3 border-0">
        <div className="d-flex align-items-center gap-3">
          <img src={profile} className="spa-profile-avatar" alt="" />
          <div className="min-w-0">
            <h4 className="mb-0 text-truncate">{auth?.name ?? "User"}</h4>
            <span className="text-muted">{auth ? formatRole(auth.role) : ""}</span>
          </div>
        </div>
      </div>
      <div className="card-body p-2">
        {menuItems.map((item) => (
          <Link key={item.label} to={item.to} className="dropdown-item ai-icon spa-profile-menu-item">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="card-footer border-0 p-2 text-center">
        <LogoutPage />
      </div>
    </div>
  );
};

export default ProfileDropdown;
