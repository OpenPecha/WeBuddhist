import { useMutation } from "react-query";
import { streamChatAPI } from "../services/chatService";
import type { ChatStreamProps, StreamCallbacks } from "../services/chatService";

interface ChatMutationParams extends ChatStreamProps {
  callbacks: StreamCallbacks;
}
export const useChatMutation = () => {
  return useMutation<void, Error, ChatMutationParams>(
    async ({ callbacks, ...params }) => {
      await streamChatAPI(params, callbacks);
    },
    {
      retry: false,
      onError: (error) => {
        console.error("Chat mutation error:", error);
      },
    },
  );
};
