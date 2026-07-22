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

const ProfileDropdown = () => {
  const { auth } = useContext(ThemeContext);
  const basePath = auth?.panel === "student" ? "/student" : "/admin";

  const menuItems =
    auth?.panel === "student"
      ? [
          { label: "Dashboard", to: `${basePath}/dashboard` },
          { label: "Study Materials", to: `${basePath}/materials` },
          { label: "Interaction", to: `${basePath}/interaction` },
        ]
      : [
          { label: "Dashboard", to: `${basePath}/dashboard` },
          { label: "Daywise Upload", to: `${basePath}/daywise-upload` },
          { label: "Student Interaction", to: `${basePath}/student-interaction` },
          ...(auth?.role === "superadmin"
            ? [{ label: "User Management", to: `${basePath}/user-management` }]
            : []),
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
          <Link key={item.to} to={item.to} className="dropdown-item ai-icon spa-profile-menu-item">
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
