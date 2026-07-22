import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { getStoredAuth } from "../jsx/starPolice/api";
import type { AuthUser, PanelType } from "../jsx/starPolice/types";

function resolveAuthForPath(pathname: string): AuthUser | null {
  const panel: PanelType = pathname.startsWith("/student") ? "student" : "admin";
  const stored = getStoredAuth(panel);
  if (!stored) return null;
  if (panel === "admin" && ["superadmin", "admin"].includes(stored.role)) return stored;
  if (panel === "student" && stored.role === "student") return stored;
  return null;
}

interface AppContextValue {
  openMenuToggle: boolean;
  setOpenMenuToggle: Dispatch<SetStateAction<boolean>>;
  auth: AuthUser | null;
  setAuth: Dispatch<SetStateAction<AuthUser | null>>;
  iconhover: boolean;
  setIconhover: Dispatch<SetStateAction<boolean>>;
}

const defaultState: AppContextValue = {
  openMenuToggle: false,
  setOpenMenuToggle: () => {},
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
  const [auth, setAuth] = useState<AuthUser | null>(() =>
    typeof window !== "undefined" ? resolveAuthForPath(window.location.pathname) : null
  );
  const [iconhover, setIconhover] = useState<boolean>(false);

  return (
    <ThemeContext.Provider
      value={{
        openMenuToggle,
        setOpenMenuToggle,
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
