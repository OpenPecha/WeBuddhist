import { WiStars } from "react-icons/wi";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { CiLocationArrow1 } from "react-icons/ci";
import { useChat } from "../../../context/ChatContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/config/AuthContext";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/config/axios-config";
import ChatPage from "../ChatPage/ChatPage";

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
        <div className="w-full flex justify-center pb-4 bg-white">
          <form onSubmit={handleSubmit} className="w-full max-w-3xl px-4">
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
  }

  return (
    <div className="text-center w-full h-full justify-center items-center flex flex-col bg-white">
      <p className="text-xl flex items-center justify-center gap-x-2 p-4  md:text-2xl">
        Explore Buddhist Wisdom{" "}
        <span>
          {" "}
          <WiStars size={40} />{" "}
        </span>
      </p>
      <div className="w-screen md:max-w-3xl border p-2 rounded-4xl">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-between border rounded-3xl bg-secondary p-4 w-full"
        >
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
        </form>
      </div>
    </div>
  );
};

export default InitialChat;
