import {Sidebar} from "../components/Sidebar";
import {ChatArea} from "../components/ChatArea";

function Chat() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

export default Chat;
