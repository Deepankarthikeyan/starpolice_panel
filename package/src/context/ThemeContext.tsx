import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface AuthData {
  email: string;
  password: string;
}

// Define the shape of the AppContext
interface AppContextValue {
  openMenuToggle: boolean;
  setOpenMenuToggle: Dispatch<SetStateAction<boolean>>;
  auth: AuthData | null;
  setAuth: Dispatch<SetStateAction<AuthData | null>>;
  iconhover: boolean;
  setIconhover: Dispatch<SetStateAction<boolean>>;
}

// Provide a default state for the context
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
  const [auth, setAuth] = useState<AuthData | null>(null);
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
