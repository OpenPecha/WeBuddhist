import { FaEllipsis } from "react-icons/fa6";
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

type SidebarUserProps = {
  name: string;
  email?: string;
  avatarUrl?: string;
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
};

export function SidebarUser({
  name,
  email,
  avatarUrl,
  onProfileClick,
  onLogoutClick,
}: SidebarUserProps) {
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
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="rounded-lg">P</AvatarFallback>
              </Avatar>

              <div className="ml-2 grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{name}</span>
                {email ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
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
            <DropdownMenuItem onClick={onProfileClick}>
              <FiUser className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogoutClick}>
              <BsBoxArrowRight className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
