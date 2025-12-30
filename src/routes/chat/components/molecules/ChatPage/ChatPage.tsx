import { useChat } from "../../../context/ChatContext";
import { useEffect, useRef } from "react";
import { MessageBubble } from "../../atom/MessageBubble";
import { FaSpinner } from "react-icons/fa6";

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
