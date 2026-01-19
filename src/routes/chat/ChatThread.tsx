import { useChat } from "./context/ChatContext";
import { useQuery } from "react-query";
import axiosInstance from "@/config/axios-config";
import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatPage from "./components/molecules/ChatPage/ChatPage";
import { ChatInput } from "./components/molecules/ChatInput/ChatInput";

export const getThreadById = async (threadId: string) => {
  const { data } = await axiosInstance.get(`/threads/${threadId}`);
  return data;
};

const ChatThread = () => {
  const {
    input,
    setInput,
    handleSubmit: chatHandleSubmit,
    handleStop,
    isLoading,
    isLoadingHistory,
    setMessagesFromHistory,
  } = useChat();

  const formRef = useRef<HTMLFormElement>(null);

  const { threadId: urlThreadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const { isLoading: isLoadingThread } = useQuery(
    ["thread", urlThreadId],
    () => getThreadById(urlThreadId!),
    {
      enabled: !!urlThreadId && urlThreadId !== "new" && !!urlThreadId,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      cacheTime: 0,
      onSuccess: (data) => {
        setMessagesFromHistory(data.messages, data.id);
      },
      retry: 1,
      onError: (error: any) => {
        console.error("Failed to fetch thread history:", error);
        navigate("/ai/new", { replace: true });
      },
    },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    chatHandleSubmit(e);
  };

  if (isLoadingHistory || isLoadingThread) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <span className="text-sm">Loading conversation...</span>
        </div>
      </div>
    );
  }

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
};

export default ChatThread;
