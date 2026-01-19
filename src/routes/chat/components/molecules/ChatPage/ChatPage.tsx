import { useChat } from "../../../context/ChatContext";
import { useEffect, useRef } from "react";
import { MessageBubble } from "../../atom/MessageBubble";
import { FaSpinner } from "react-icons/fa6";
import { Queries } from "../../atom/Queries";

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
    <div className="overflow-y-scroll flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            const isStreamingThisMsg = isLoading && isLast;
            const showQueries =
              message.role === "assistant" &&
              message.queries &&
              isStreamingThisMsg &&
              !isThinking;

            return (
              <div key={message.id} className="flex flex-col">
                {message.role === "assistant" && message.queries && (
                  <Queries queries={message.queries} show={showQueries} />
                )}

                <MessageBubble
                  message={message}
                  isStreaming={isStreamingThisMsg}
                />
              </div>
            );
          })}

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
