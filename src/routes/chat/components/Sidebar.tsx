import { Link, useNavigate } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import { IoCreateOutline } from "react-icons/io5";
import { useChatStore } from "../store/chatStore.ts";
import logo from "@/assets/icons/pecha_icon.png";
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
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export function ChatSidebar() {
  const navigate = useNavigate();
  const {
    threads,
    activeThreadId,
    setActiveThread,
    deleteThread,
    resetToNewChat,
  } = useChatStore() as any;

  const handleThreadClick = (threadId: string) => {
    setActiveThread(threadId);
    navigate(`/ai/${threadId}`);
  };

  const handleNewChat = () => {
    resetToNewChat();
    navigate("/ai/new");
  };

  const handleDeleteClick = (threadId: string) => {
    deleteThread(threadId);
  };

  return (
    <Sidebar className=" border-none">
      <SidebarHeader className="flex items-center justify-between">
        <div>
          <div className="flex items-center justify-center  w-full">
            <Link to="/">
              <img src={logo} alt="logo" className="w-10 h-10" />
            </Link>
            <p className="text-lg font-medium text-[#363636]">WeBuddhist </p>
          </div>
        </div>

        <SidebarTrigger />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button
              onClick={handleNewChat}
              className="w-full cursor-pointer text-faded-grey"
              variant="outline"
            >
              <IoCreateOutline size={18} />
              <span>New Chat</span>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent className="max-h-4/5 overflow-y-auto">
            <SidebarMenu>
              {threads.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">
                  No chats yet
                </div>
              ) : (
                threads.map((thread: any) => (
                  <SidebarMenuItem key={thread.id}>
                    <div className="flex items-center justify-between">
                      <SidebarMenuButton
                        onClick={() => handleThreadClick(thread.id)}
                        isActive={activeThreadId === thread.id}
                        className={`
                        w-full justify-start
                        ${
                          activeThreadId === thread.id
                            ? "text-primary"
                            : " text-faded-grey"
                        }
                      `}
                      >
                        <span className="truncate">{thread.title}</span>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer" asChild>
                          <button>
                            <MoreHorizontal size={14} />
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
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
