import { createContext, useContext, useEffect, useState, useMemo } from "react";
import Userback from "@userback/widget";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../config/AuthContext.tsx";
import { useQuery } from "react-query";
import axiosInstance from "../config/axios-config.ts";
import { USERBACK_ID } from "../utils/constants.ts";
export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const UserbackContext = createContext({ userback: null });
const usebackId = import.meta.env.VITE_USERBACK_ID || USERBACK_ID;
export const UserbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userback, setUserback] = useState(null);
  const { user } = useAuth0();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const { data: userInfo } = useQuery("userInfo", fetchUserInfo, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn,
  });

  const mainUser = user || userInfo;
  useEffect(() => {
    if (!mainUser) return;
    const init = async (user: any) => {
      const id = user?.id || user?.email || "anonymous";
      const name = user?.name || user?.firstname || "Anonymous User";
      const email = user?.email || "anonymous@pecha.io";
      try {
        const options = {
          user_data: {
            id,
            info: {
              name,
              email,
            },
          },
        };
        const instance = await Userback(usebackId, options);
        setUserback(instance as any);
      } catch (error) {
        console.error("Failed to initialize Userback:", error);
        console.error("Error details:", {
          message: (error as any)?.message,
          stack: (error as any)?.stack,
          userbackId: usebackId,
          userData: user,
        });
      }
    };
    init(mainUser);
  }, [mainUser]);

  const contextValue = useMemo(() => ({ userback }), [userback]);

  return (
    <UserbackContext.Provider value={contextValue}>
      {children}
    </UserbackContext.Provider>
  );
};

export const useUserback = () => useContext(UserbackContext);
