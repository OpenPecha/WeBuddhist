import { BsBoxArrowRight } from "react-icons/bs";
import { FiUser } from "react-icons/fi";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/config/AuthContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, LOGGED_IN_VIA, REFRESH_TOKEN } from "@/utils/constants";

type AuthContextValue = {
  isLoggedIn: boolean;
};
type AuthUserType = {
  logout: () => void;
};

export function SidebarUser() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth() as AuthContextValue;
  const { user, logout, isAuthenticated } = useAuth0();
  const { logout: pechaLogout } = useAuth() as AuthUserType;
  const { data: userInfo } = useUserInfo();

  const handleLogout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem(LOGGED_IN_VIA);
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    isLoggedIn && pechaLogout();
    isAuthenticated && logout();
    if (isLoggedIn && !isAuthenticated) {
      navigate("/login");
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full justify-start  rounded-none data-[state=open]:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={userInfo?.avatar_url || user?.picture}
                  alt={userInfo?.username || user?.name}
                />
                <AvatarFallback className="rounded-lg">P</AvatarFallback>
              </Avatar>

              <div className="ml-2 grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">
                  {userInfo?.username || user?.name}
                </span>
                {userInfo?.email || user?.email ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {userInfo?.email || user?.email}
                  </span>
                ) : null}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            className=" w-60 shadow-none"
          >
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <FiUser className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <BsBoxArrowRight className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
