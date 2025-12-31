import { Link, useNavigate } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import { IoCreateOutline } from "react-icons/io5";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaEllipsis } from "react-icons/fa6";
import { HistoryIcon } from "@/utils/Icon.tsx";
import { SidebarUser } from "./SidebarUser.tsx";
import smallimage from "@/assets/icons/pecha_icon.png";
import { CiLocationArrow1 } from "react-icons/ci";

export function ChatSidebar() {
  const navigate = useNavigate();

  const handleThreadClick = (threadId: string) => {
    navigate(`/ai/${threadId}`);
  };

  const handleNewChat = () => {
    navigate("/ai/new");
  };

  const handleDeleteClick = (threadId: string) => {};

  return (
    <Sidebar collapsible="icon" className="border-right">
      <SidebarHeader className="flex items-center py-4 px-2 justify-between group-data-[collapsible=icon]:flex-col">
        <Link
          to="/"
          className="flex items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
          aria-label="Home"
        >
          <img className="h-[30px]" src={smallimage} alt="Webuddhist" />
        </Link>
        <SidebarTrigger className="group-data-[collapsible=icon]" />
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleNewChat}
                  className="text-faded-grey"
                  tooltip="New Chat"
                >
                  <IoCreateOutline size={18} />
                  <span>New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sm flex items-center gap-2">
            <HistoryIcon /> History
          </SidebarGroupLabel>

          <SidebarGroupContent className="max-h-4/5 overflow-y-auto w-full">
            <SidebarMenu>
              {["dummy"].length === 0 ? (
                <div className="text-center text-faded-grey text-sm group-data-[collapsible=icon]:hidden">
                  No chats yet
                </div>
              ) : (
                [].map((thread: any) => (
                  <SidebarMenuItem
                    key={thread.id}
                    className="group-data-[collapsible=icon]:hidden"
                  >
                    <SidebarMenuButton
                      onClick={() => handleThreadClick(thread.id)}
                      isActive={false === thread.id}
                      className={`w-full justify-start ${
                        false === thread.id ? "text-primary" : "text-faded-grey"
                      }`}
                    >
                      <span className="truncate">{thread.title}</span>
                    </SidebarMenuButton>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="cursor-pointer outline-none absolute top-1.5 right-1 opacity-0 group-hover/menu-item:opacity-100 focus:opacity-100 group-data-[collapsible=icon]:hidden"
                        asChild
                      >
                        <button
                          aria-label="More options"
                          className="flex aspect-square w-5 items-center justify-center rounded-md hover:bg-sidebar-accent"
                        >
                          <FaEllipsis size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(thread.id)}
                        >
                          <BsTrash size={14} />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Link to="/">
        <div className="text-center bg-background group/nav-button p-2 flex items-center border rounded-sm m-2 justify-center gap-2 text-faded-grey text-sm group-data-[collapsible=icon]:hidden">
          <CiLocationArrow1
            size={16}
            className="cursor-pointer group-hover/nav-button:rotate-45 transition-transform duration-300"
            onClick={() => navigate("/")}
          />
          Navigate back to homepage
        </div>
      </Link>
      <SidebarSeparator />

      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
