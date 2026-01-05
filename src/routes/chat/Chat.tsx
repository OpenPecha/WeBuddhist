import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "./components/molecules/Sidebar-components/Sidebar";
import ChatNavbar from "./components/molecules/Sidebar-components/ChatNavbar";
import ChatFooter from "./components/molecules/Sidebar-components/ChatFooter";
import InitialChat from "./components/molecules/InitialChat/InitialChat";
import ChatPage from "./components/molecules/ChatPage/ChatPage";
import { ChatProvider, useChat } from "./context/ChatContext";
import InputField from "./components/atom/InputField";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/config/AuthContext";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "@/config/axios-config";
import { useState, useRef } from "react";
import { useChatMutation } from "./hooks/useChatMutation";

const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const ChatContent = () => {
  const {
    messages,
    isLoading,
    addUserMessage,
    addAssistantMessage,
    updateLastMessage,
    setLoading,
    setThinking,
    threadId,
    setThreadId,
  } = useChat();

  const [input, setInput] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth0();
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const { data: userInfo } = useQuery("userInfo", fetchUserInfo, {
    refetchOnWindowFocus: false,
    enabled: isLoggedIn,
  });

  const chatMutation = useChatMutation();

  const getUserEmail = () => {
    return user?.email || userInfo?.email || "test@webuddhist";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || chatMutation.isLoading) return;

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

    chatMutation.mutate(
      {
        email: getUserEmail(),
        query: userQuery,
        application: "webuddhist",
        device_type: "web",
        ...(threadId && { thread_id: threadId }),
        callbacks: {
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
            if (!threadId) {
              setThreadId(id);
            }
            queryClient.invalidateQueries(["threads", getUserEmail()]);
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
      },
      {
        onError: (error) => {
          console.error("Mutation error:", error);
          setLoading(false);
          setThinking(false);
          abortControllerRef.current = null;
        },
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

  if (messages.length === 0) {
    return <InitialChat />;
  }

  return (
    <>
      <ChatPage />
      <div className="w-full flex justify-center pb-4 bg-white">
        <InputField
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          handleStop={handleStop}
        />
      </div>
    </>
  );
};

export default function Chat() {
  return (
    <ChatProvider>
      <SidebarProvider>
        <div className="flex h-dvh w-full overflow-hidden">
          <ChatSidebar />

          <div className="flex min-w-0 flex-1 flex-col bg-sidebar">
            <ChatNavbar className="shrink-0" />
            <div className="min-h-0 flex-1 flex flex-col">
              <ChatContent />
            </div>
            <ChatFooter />
          </div>
        </div>
      </SidebarProvider>
    </ChatProvider>
  );
}
