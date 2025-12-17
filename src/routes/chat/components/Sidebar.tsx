import { Link, useNavigate } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import { IoCreateOutline } from "react-icons/io5";
import { useChatStore } from "../store/chatStore.ts";
import logo from "@/assets/icons/pecha_icon.png";
import {
  Sidebar,
  SidebarContent,
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
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="logo" className="w-10 h-10" />
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarGroup>
        <SidebarGroupContent>
          <Button
            onClick={handleNewChat}
            className="w-full cursor-pointer"
            variant="outline"
          >
            <IoCreateOutline size={18} />
            <span>New Chat</span>
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">
                  No chats yet
                </div>
              ) : (
                threads.map((thread: any) => (
                  <SidebarMenuItem key={thread.id}>
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
                      <DropdownMenuTrigger asChild>
                        <button>
                          <MoreHorizontal size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
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
    </Sidebar>
  );
}
