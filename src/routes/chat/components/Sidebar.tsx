import { useNavigate } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import { IoCreateOutline } from "react-icons/io5";
import { useChatStore } from "../store/chatStore.ts";
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
  SidebarMenuAction,
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
      <SidebarHeader className="flex justify-between items-center">
        <Button onClick={handleNewChat} variant="ghost" size="icon">
          <IoCreateOutline size={18} />
          <span>New Chat</span>
        </Button>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="border-t border-dashed">
            History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threads.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-10 px-4">
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
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-40"
                      >
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
