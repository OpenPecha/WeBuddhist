import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatArea } from "../components/ChatArea";
import { useChatStore } from "../store/chatStore";
export default function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const resetToNewChat = useChatStore((state) => state.resetToNewChat);
  useEffect(() => {
    const newChat = new URLSearchParams(window.location.search).get("new");
    if (newChat) {
      resetToNewChat();
      window.history.replaceState({}, '', '/ai');
    }
  }, [resetToNewChat]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overallfont">
      <Sidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />
      <div className="flex-1">
        <ChatArea isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
}
