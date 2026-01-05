import { WiStars } from "react-icons/wi";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CiLocationArrow1 } from "react-icons/ci";
import { useChat } from "../../../context/ChatContext";
import { streamChatAPI } from "../../../services/chatService";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/config/AuthContext";
import { useQuery } from "react-query";
import axiosInstance from "@/config/axios-config";

const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const InitialChat = () => {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    addUserMessage,
    addAssistantMessage,
    updateLastMessage,
    setLoading,
    setThinking,
    setThreadId,
    isLoading,
  } = useChat();

  const { user } = useAuth0();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const { data: userInfo } = useQuery("userInfo", fetchUserInfo, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn,
  });

  const getUserEmail = () => {
    return user?.email || userInfo?.email || "test@webuddhist";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input;
    setInput("");
    addUserMessage(userQuery);
    addAssistantMessage();

    setLoading(true);
    setThinking(true);

    let fullResponse = "";
    let currentSearchResults: any[] = [];
    let currentQueries: any = null;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await streamChatAPI(
      {
        email: getUserEmail(),
        query: userQuery,
        application: "webuddhist",
        device_type: "web",
      },
      {
        onToken: (token) => {
          setThinking(false);
          fullResponse += token;
          updateLastMessage(
            fullResponse,
            currentSearchResults,
            currentQueries,
            false,
          );
        },
        onSearchResults: (results) => {
          setThinking(false);
          currentSearchResults = [...results];
          updateLastMessage(
            fullResponse,
            currentSearchResults,
            currentQueries,
            false,
          );
        },
        onQueries: (queries) => {
          setThinking(false);
          currentQueries = queries;
          updateLastMessage(
            fullResponse,
            currentSearchResults,
            currentQueries,
            false,
          );
        },
        onThreadId: (id) => {
          setThreadId(id);
        },
        onComplete: () => {
          updateLastMessage(
            fullResponse,
            currentSearchResults,
            currentQueries,
            true,
          );
          setLoading(false);
          setThinking(false);
          abortControllerRef.current = null;
        },
        onError: (error) => {
          if (error.name === "AbortError") {
            return;
          }
          console.error("Chat error:", error);
          updateLastMessage(
            fullResponse + "\n\n[Error: Failed to get response]",
            currentSearchResults,
            currentQueries,
            true,
          );
          setLoading(false);
          setThinking(false);
          abortControllerRef.current = null;
        },
        signal: abortController.signal,
      },
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setThinking(false);
    }
  };

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
