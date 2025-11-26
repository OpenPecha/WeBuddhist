import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatArea } from "../components/ChatArea";

export default function Chat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
