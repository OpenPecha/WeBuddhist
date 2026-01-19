import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "./components/molecules/Sidebar-components/Sidebar";
import ChatNavbar from "./components/molecules/Sidebar-components/ChatNavbar";
import ChatFooter from "./components/molecules/Sidebar-components/ChatFooter";
import { ChatProvider } from "./context/ChatContext";
import { Outlet } from "react-router-dom";

const ChatLayout = () => {
  return (
    <ChatProvider>
      <SidebarProvider>
        <div className="flex h-dvh w-full overflow-hidden">
          <ChatSidebar />
          <div className="flex min-w-0 flex-1 flex-col bg-sidebar">
            <ChatNavbar className="shrink-0" />
            <div className="min-h-0 flex-1 flex flex-col">
              <Outlet />
            </div>
            <ChatFooter />
          </div>
        </div>
      </SidebarProvider>
    </ChatProvider>
  );
};

export default ChatLayout;
