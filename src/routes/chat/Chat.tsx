import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatArea } from "./components/ChatArea";
import { useChatStore } from "./store/chatStore";
import { ChatSidebar } from "./components/Sidebar";

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
      if (threadExists) {
        setActiveThread(threadId);
      } else {
        navigate("/ai/new", { replace: true });
      }
    }
  }, [threadId, threads, setActiveThread, resetToNewChat, navigate]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatSidebar />
        <div className="flex-1 bg-sidebar">
          <ChatArea
            isSidebarOpen={isSidebarOpen}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
