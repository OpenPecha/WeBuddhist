import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatArea } from "./components/ChatArea";
import { useChatStore } from "./store/chatStore";
import { ChatSidebar } from "./components/Sidebar";
import ChatNavbar from "./components/all-navbar/ChatNavbar";
import ChatFooter from "./components/all-footer/ChatFooter";

export default function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { setActiveThread, threads, resetToNewChat } = useChatStore() as any;

  useEffect(() => {
    if (threadId === "new") {
      resetToNewChat();
    } else if (threadId) {
      const threadExists = threads.some((t: any) => t.id === threadId);
      if (threadExists) setActiveThread(threadId);
      else navigate("/ai/new", { replace: true });
    }
  }, [threadId, threads, setActiveThread, resetToNewChat, navigate]);

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden">
        <ChatSidebar />

        <div className="flex min-w-0 flex-1 flex-col bg-sidebar">
          <ChatNavbar className="shrink-0" />
          <div className="min-h-0 flex-1">
            <ChatArea
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          </div>
          <ChatFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
