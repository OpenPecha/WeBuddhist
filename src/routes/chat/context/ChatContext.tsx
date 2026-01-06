import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import { streamChatAPI } from "../services/chatService";

export interface SearchResult {
  id: string;
  title: string;
  text: string;
  score?: number;
  distance?: number;
}

export interface Queries {
  tibetan_bm25?: string;
  english_bm25?: string;
  tibetan_semantic?: string;
  english_semantic?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  searchResults?: SearchResult[];
  queries?: Queries;
  isComplete?: boolean;
}

interface ChatState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isThinking: boolean;
  threadId: string | null;
  isLoadingHistory: boolean;
}

interface ChatContextType extends ChatState {
  setInput: (input: string) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    options?: { email?: string; onSuccess?: (threadId: string) => void },
  ) => void;
  handleStop: () => void;
  setThreadId: (id: string | null) => void;
  setMessagesFromHistory: (threadMessages: any[], threadId: string) => void;
  setLoadingHistory: (loading: boolean) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    input: "",
    isLoading: false,
    isThinking: false,
    threadId: null,
    isLoadingHistory: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateLastMessage = useCallback(
    (
      content: string,
      searchResults?: SearchResult[],
      queries?: Queries,
      isComplete: boolean = false,
    ) => {
      setState((prev) => {
        const messages = [...prev.messages];
        const lastIndex = messages.length - 1;

        if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
          messages[lastIndex] = {
            ...messages[lastIndex],
            content,
            ...(searchResults && { searchResults }),
            ...(queries && { queries }),
            isComplete,
          };
        }

        return { ...prev, messages };
      });
    },
    [],
  );

  const setInput = useCallback(
    (input: string) => {
      updateState({ input });
    },
    [updateState],
  );

  const handleSubmit = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement>,
      options?: { email?: string; onSuccess?: (threadId: string) => void },
    ) => {
      e.preventDefault();

      if (!state.input.trim() || state.isLoading) return;

      const userQuery = state.input;
      const isInitialChat = state.messages.length === 0;

      updateState({ input: "", isLoading: true, isThinking: true });

      addMessage({
        id: Date.now().toString(),
        role: "user",
        content: userQuery,
        isComplete: true,
      });

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        searchResults: [],
        queries: undefined,
        isComplete: false,
      });

      let fullResponse = "";
      let currentSearchResults: SearchResult[] = [];
      let currentQueries: Queries | null = null;
      let newThreadId: string | null = null;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await streamChatAPI(
        {
          email: options?.email || "test@webuddhist",
          query: userQuery,
          application: "webuddhist",
          device_type: "web",
          ...(state.threadId && { thread_id: state.threadId }),
        },
        {
          onToken: (token) => {
            updateState({ isThinking: false });
            fullResponse += token;
            updateLastMessage(
              fullResponse,
              currentSearchResults,
              currentQueries || undefined,
              false,
            );
          },
          onSearchResults: (results) => {
            updateState({ isThinking: false });
            currentSearchResults = [...results];
            updateLastMessage(
              fullResponse,
              currentSearchResults,
              currentQueries || undefined,
              false,
            );
          },
          onQueries: (queries) => {
            updateState({ isThinking: false });
            currentQueries = queries;
            updateLastMessage(
              fullResponse,
              currentSearchResults,
              currentQueries,
              false,
            );
          },
          onThreadId: (id) => {
            if (!state.threadId) {
              newThreadId = id;
              updateState({ threadId: id });
            }
          },
          onComplete: () => {
            updateLastMessage(
              fullResponse,
              currentSearchResults,
              currentQueries || undefined,
              true,
            );
            updateState({ isLoading: false, isThinking: false });
            abortControllerRef.current = null;

            if (isInitialChat && newThreadId && options?.onSuccess) {
              options.onSuccess(newThreadId);
            }
          },
          onError: (error) => {
            if (error.name === "AbortError") return;

            console.error("Chat error:", error);
            updateLastMessage(
              fullResponse + "\n\n[Error: Failed to get response]",
              currentSearchResults,
              currentQueries || undefined,
              true,
            );
            updateState({ isLoading: false, isThinking: false });
            abortControllerRef.current = null;
          },
          signal: controller.signal,
        },
      );
    },
    [
      state.input,
      state.isLoading,
      state.threadId,
      state.messages.length,
      addMessage,
      updateLastMessage,
      updateState,
    ],
  );

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      updateState({ isLoading: false, isThinking: false });
    }
  }, [updateState]);

  const setThreadId = useCallback(
    (id: string | null) => {
      updateState({ threadId: id });
    },
    [updateState],
  );

  const setLoadingHistory = useCallback(
    (loading: boolean) => {
      updateState({ isLoadingHistory: loading });
    },
    [updateState],
  );

  const setMessagesFromHistory = useCallback(
    (threadMessages: Message[], newThreadId: string) => {
      const convertedMessages: Message[] = threadMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        searchResults: msg.searchResults ?? undefined,
        isComplete: true,
      }));

      setState((prev) => ({
        ...prev,
        messages: convertedMessages,
        threadId: newThreadId,
        isLoadingHistory: false,
      }));
    },
    [],
  );

  const resetChat = useCallback(() => {
    setState({
      messages: [],
      input: "",
      isLoading: false,
      isThinking: false,
      threadId: null,
      isLoadingHistory: false,
    });
    abortControllerRef.current = null;
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      setInput,
      handleSubmit,
      handleStop,
      setThreadId,
      setMessagesFromHistory,
      setLoadingHistory,
      resetChat,
    }),
    [
      state,
      setInput,
      handleSubmit,
      handleStop,
      setThreadId,
      setMessagesFromHistory,
      setLoadingHistory,
      resetChat,
    ],
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
