import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  ACCESS_TOKEN,
  LOGGED_IN_VIA,
  REFRESH_TOKEN,
} from "../utils/constants.ts";

const AuthContext = createContext({});

export const PechaAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    const loggedInVia = localStorage.getItem(LOGGED_IN_VIA);
    if (accessToken && (refreshToken || loggedInVia === "pecha")) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsAuthLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string | null = null) => {
    sessionStorage.setItem(ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(LOGGED_IN_VIA, "pecha");
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
  };
  const contextValue = useMemo(
    () => ({ isLoggedIn, login, logout, isAuthLoading }),
    [isLoggedIn, isAuthLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
