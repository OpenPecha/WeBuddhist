import { useChat } from "../../../context/ChatContext";
import { useEffect, useRef } from "react";
import { MessageBubble } from "../../atom/MessageBubble";
import { FaSpinner } from "react-icons/fa6";
import { ACCESS_TOKEN } from "@/utils/constants";

interface ChatStreamProps {
  email: string;
  query: string;
  application: string;
  device_type: string;
  thread_id?: string;
}

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

interface StreamCallbacks {
  onToken: (token: string) => void;
  onSearchResults: (results: SearchResult[]) => void;
  onQueries: (queries: Queries) => void;
  onThreadId: (id: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

export const streamChatAPI = async (
  params: ChatStreamProps,
  callbacks: StreamCallbacks,
) => {
  const { email, query, application, device_type, thread_id } = params;
  const {
    onToken,
    onSearchResults,
    onQueries,
    onThreadId,
    onComplete,
    onError,
    signal,
  } = callbacks;

  try {
    const token = sessionStorage.getItem(ACCESS_TOKEN);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`/chats`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        query,
        application,
        device_type,
        ...(thread_id && { thread_id }),
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "search_results") {
              onSearchResults(parsed.data);
              if (parsed.queries) {
                onQueries(parsed.queries);
              }
            } else if (parsed.type === "token") {
              onToken(parsed.data);
            } else if (parsed.type === "done") {
              // Stream finished
            } else if (parsed.thread_id) {
              onThreadId(parsed.thread_id);
            }
          } catch {
            // Not JSON, ignore
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        onError(
          new Error(
            "Network error: Unable to reach the server. Please check your connection or CORS settings.",
          ),
        );
      } else {
        onError(error);
      }
    } else {
      onError(new Error("Unknown error occurred"));
    }
  }
};

const ChatPage = () => {
  const { messages, isLoading, isThinking } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isThinking]);

  return (
    <div className="overflow-y-scroll rounded-lg relative flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div key={message.id} className="flex flex-col">
              {message.role === "assistant" && message.queries && (
                <div className="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <p className="font-semibold">Search Queries:</p>
                  {message.queries.tibetan_bm25 && (
                    <p>བོད་ཡིག: {message.queries.tibetan_bm25}</p>
                  )}
                  {message.queries.english_bm25 && (
                    <p>English: {message.queries.english_bm25}</p>
                  )}
                </div>
              )}
              <MessageBubble
                message={message}
                isStreaming={isLoading && index === messages.length - 1}
              />
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2 text-gray-400 text-sm animate-pulse">
              <FaSpinner className="animate-spin" size={16} />
              Thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
