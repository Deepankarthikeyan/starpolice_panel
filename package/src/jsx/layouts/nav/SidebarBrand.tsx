import { Link } from "react-router-dom";
import fullLogo from "../../../assets/images/star-police-academy-logo.png";
import fullLogoWhite from "../../../assets/images/star-police-academy-logo-white.png";
import emblemLogo from "../../../assets/images/star-police-academy-emblem.png";

interface SidebarBrandProps {
  homePath: string;
  variant?: "light" | "dark";
}

const SidebarBrand = ({ homePath, variant = "dark" }: SidebarBrandProps) => (
  <Link to={homePath} className="star-police-sidebar-logo">
    <img
      className="star-police-logo-icon"
      src={emblemLogo}
      alt="Star Police Academy"
    />
    <img
      className="star-police-logo-full"
      src={variant === "dark" ? fullLogoWhite : fullLogo}
      alt="Star Police Academy"
    />
  </Link>
);

export default SidebarBrand;
