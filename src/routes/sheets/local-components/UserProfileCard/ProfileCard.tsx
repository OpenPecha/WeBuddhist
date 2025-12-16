import { useAuth } from "../../../../config/AuthContext.js";
import { useQuery } from "react-query";
import axiosInstance from "../../../../config/axios-config.js";
import { useAuth0 } from "@auth0/auth0-react";

type UserInfo = {
  avatar_url?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
};

export const fetchUserInfo = async (): Promise<UserInfo> => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
type AuthContextValue = {
  isLoggedIn: boolean;
};
const ProfileCard = () => {
  const { isLoggedIn } = useAuth() as AuthContextValue;
  const { user } = useAuth0();

  const { data: userInfo, isLoading: userInfoIsLoading } = useQuery<UserInfo>(
    "userInfo",
    fetchUserInfo,
    { refetchOnWindowFocus: false, enabled: isLoggedIn },
  );

  if (userInfoIsLoading) {
    return (
      <div className="p-5 text-center text-sm italic text-gray-500">
        Loading...
      </div>
    );
  }
  return (
    <div className="w-full">
      {(userInfo?.username || user?.name) && (
        <div className="flex items-center justify-start mb-2.5 w-fit rounded-lg p-1">
          <div className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border border-[#e2e2e2] shrink-0 sm:h-[45px] sm:w-[45px]">
            <img
              src={userInfo?.avatar_url || user?.picture}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-2.5 flex flex-col items-start justify-center">
            <span className="text-sm font-semibold text-gray-800 sm:text-base">
              {capitalize(userInfo?.firstname || user?.given_name)}{" "}
              {capitalize(userInfo?.lastname || user?.family_name)}
            </span>
            <span className="-mt-0.5 text-xs text-gray-500">
              @{userInfo?.username || user?.nickname}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
