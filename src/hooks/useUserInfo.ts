import { useQuery } from "react-query";
import { useAuth } from "@/config/AuthContext";
import axiosInstance from "@/config/axios-config";

export const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

export const useUserInfo = () => {
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };

  return useQuery("userInfo", fetchUserInfo, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn,
  });
};
