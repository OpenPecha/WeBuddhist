import { WiStars } from "react-icons/wi";
import { useRef } from "react";
import { useChat } from "../../../context/ChatContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/config/AuthContext";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/config/axios-config";
import ChatPage from "../ChatPage/ChatPage";
import { ChatInput } from "../ChatInput/ChatInput";

const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const InitialChat = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const {
    messages,
    input,
    setInput,
    handleSubmit: chatHandleSubmit,
    handleStop,
    isLoading,
  } = useChat();

  const queryClient = useQueryClient();

  const { user } = useAuth0();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const { data: userInfo } = useQuery("userInfo", fetchUserInfo, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn,
  });

  const getUserEmail = () => {
    return user?.email || userInfo?.email || "test@webuddhist";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const isInitialChat = messages.length === 0;
    chatHandleSubmit(e, {
      email: getUserEmail(),
      onSuccess: (threadId) => {
        if (isInitialChat && threadId) {
          queryClient.invalidateQueries(["threads"]);
        }
      },
    });
  };

  if (messages.length > 0) {
    return (
      <>
        <ChatPage />
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleStop={handleStop}
          formRef={formRef}
        />
      </>
    );
  }

  return (
    <div className="text-center w-full h-full justify-center items-center flex flex-col bg-white">
      <p className="text-xl flex items-center justify-center gap-x-2 p-0 md:p-4  md:text-2xl">
        Explore Buddhist Wisdom{" "}
        <span>
          {" "}
          <WiStars size={40} />{" "}
        </span>
      </p>
      <div className=" w-screen p-4 md:p-0 rounded-4xl">
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleStop={handleStop}
          formRef={formRef}
          isinitial={true}
        />
      </div>
    </div>
  );
};

export default InitialChat;
