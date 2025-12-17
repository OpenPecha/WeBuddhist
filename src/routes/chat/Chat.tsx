import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { useChatStore } from "./store/chatStore";

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

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />
      <div className="flex-1">
        <ChatArea
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
