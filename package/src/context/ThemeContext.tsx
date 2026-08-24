import {
  createContext,
  ReactNode,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { getStoredAuth } from "../jsx/starPolice/api";
import type { AuthUser, PanelType } from "../jsx/starPolice/types";

export const MOBILE_NAV_QUERY = "(max-width: 1199px)";

function readIsMobileNav() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_NAV_QUERY).matches;
}

function applySidebarStyle(isMobile: boolean) {
  document.body.setAttribute("data-sidebar-style", isMobile ? "overlay" : "full");
}

function resolveAuthForPath(pathname: string): AuthUser | null {
  const panel: PanelType = pathname.startsWith("/student")
    ? "student"
    : pathname.startsWith("/staff")
      ? "staff"
      : "admin";
  const stored = getStoredAuth(panel);
  if (!stored) return null;
  if (panel === "admin" && ["superadmin", "admin"].includes(stored.role)) return stored;
  if (panel === "staff" && stored.role === "staff") return stored;
  if (panel === "student" && stored.role === "student") return stored;
  return null;
}

interface AppContextValue {
  openMenuToggle: boolean;
  setOpenMenuToggle: Dispatch<SetStateAction<boolean>>;
  isMobileNav: boolean;
  auth: AuthUser | null;
  setAuth: Dispatch<SetStateAction<AuthUser | null>>;
  iconhover: boolean;
  setIconhover: Dispatch<SetStateAction<boolean>>;
}

const defaultState: AppContextValue = {
  openMenuToggle: false,
  setOpenMenuToggle: () => {},
  isMobileNav: false,
  auth: null,
  setAuth: () => {},
  iconhover: false,
  setIconhover: () => {},
};

export const ThemeContext = createContext<AppContextValue>(defaultState);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  const [openMenuToggle, setOpenMenuToggle] = useState<boolean>(false);
  const [isMobileNav, setIsMobileNav] = useState<boolean>(readIsMobileNav);
  const [auth, setAuth] = useState<AuthUser | null>(() =>
    typeof window !== "undefined" ? resolveAuthForPath(window.location.pathname) : null
  );
  const [iconhover, setIconhover] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_NAV_QUERY);
    const sync = () => {
      const mobile = media.matches;
      setIsMobileNav(mobile);
      applySidebarStyle(mobile);
      setOpenMenuToggle(false);
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  useEffect(() => {
    const drawerOpen = isMobileNav && openMenuToggle;
    document.body.classList.toggle("spa-drawer-open", drawerOpen);
    return () => document.body.classList.remove("spa-drawer-open");
  }, [isMobileNav, openMenuToggle]);

  return (
    <ThemeContext.Provider
      value={{
        openMenuToggle,
        setOpenMenuToggle,
        isMobileNav,
        auth,
        setAuth,
        iconhover,
        setIconhover,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
