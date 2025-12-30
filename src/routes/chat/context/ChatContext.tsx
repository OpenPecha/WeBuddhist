import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface SearchResult {
  id: string;
  title: string;
  text: string;
  score: number;
  distance: number;
}

interface Queries {
  tibetan_bm25?: string;
  english_bm25?: string;
  tibetan_semantic?: string;
  english_semantic?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  searchResults?: SearchResult[];
  queries?: Queries;
  isComplete?: boolean;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  threadId: string | null;
  addUserMessage: (content: string) => void;
  addAssistantMessage: () => void;
  updateLastMessage: (
    content: string,
    searchResults?: SearchResult[],
    queries?: Queries,
    isComplete?: boolean,
  ) => void;
  setLoading: (loading: boolean) => void;
  setThinking: (thinking: boolean) => void;
  setThreadId: (id: string) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  const addUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      isComplete: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const addAssistantMessage = useCallback(() => {
    const newMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      searchResults: [],
      queries: undefined,
      isComplete: false,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const updateLastMessage = useCallback(
    (
      content: string,
      searchResults?: SearchResult[],
      queries?: Queries,
      isComplete: boolean = false,
    ) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content,
            ...(searchResults && { searchResults }),
            ...(queries && { queries }),
            isComplete,
          };
        }
        return newMessages;
      });
    },
    [],
  );

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setThinking = useCallback((thinking: boolean) => {
    setIsThinking(thinking);
  }, []);

  const setThreadIdCallback = useCallback((id: string) => {
    setThreadId(id);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setIsLoading(false);
    setIsThinking(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isThinking,
        threadId,
        addUserMessage,
        addAssistantMessage,
        updateLastMessage,
        setLoading,
        setThinking,
        setThreadId: setThreadIdCallback,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
