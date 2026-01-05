import { useChat } from "./context/ChatContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/config/AuthContext";
import { useQuery } from "react-query";
import axiosInstance from "@/config/axios-config";
import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThreadHistory } from "./hooks/useThreadHistory";
import ChatPage from "./components/molecules/ChatPage/ChatPage";
import { Button } from "@/components/ui/button";
import { CiLocationArrow1 } from "react-icons/ci";

const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
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

  const { user } = useAuth0();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const { data: userInfo } = useQuery("userInfo", fetchUserInfo, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn,
  });

  const getUserEmail = () => {
    return user?.email || userInfo?.email || "test@webuddhist";
  };

  const { isLoading: isLoadingThread } = useThreadHistory(urlThreadId, {
    enabled: !!urlThreadId,
    onSuccess: (data) => {
      setMessagesFromHistory(data.messages, data.id);
    },
    onError: () => {
      navigate("/ai/new", { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    chatHandleSubmit(e, { email: getUserEmail() });
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
      <div className="w-full flex justify-center pb-4 bg-white">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full max-w-3xl px-4"
        >
          <div className="flex flex-col items-center justify-between border rounded-3xl bg-secondary p-4 w-full">
            <textarea
              value={input}
              rows={3}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();

                  if (isLoading) {
                    handleStop();
                    return;
                  }

                  if (input.trim()) {
                    formRef.current?.requestSubmit();
                  }
                }
              }}
              placeholder="Ask a question about Buddhist texts..."
              className="w-full p-2 focus:outline-none resize-none"
              disabled={isLoading}
            />

            <div className="flex justify-end w-full">
              <Button
                type={isLoading ? "button" : "submit"}
                variant="outline"
                size="icon"
                onClick={isLoading ? handleStop : undefined}
                className="cursor-pointer text-faded-grey group rounded-full hover:bg-background"
                disabled={!input.trim() && !isLoading}
              >
                <CiLocationArrow1
                  size={20}
                  className="group-hover:rotate-45 text-faded-grey transition-transform duration-300"
                />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatThread;
