import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export const useChatStore = create()(
  persist(
    (set) => ({
      threads: [],
      activeThreadId: null,
      isLoading: false,

      createThread: () => {
        const newThread = {
          id: uuidv4(),
          title: "New Chat",
          messages: [],
          createdAt: Date.now(),
        };
        set((state) => ({
          threads: [newThread, ...state.threads],
          activeThreadId: newThread.id,
        }));
        return newThread.id;
      },

      deleteThread: (id) => {
        set((state) => {
          const newThreads = state.threads.filter((t) => t.id !== id);
          return {
            threads: newThreads,
            activeThreadId:
              state.activeThreadId === id
                ? newThreads[0]?.id || null
                : state.activeThreadId,
          };
        });
      },

      setActiveThread: (id) => {
        set({ activeThreadId: id });
      },

      resetToNewChat: () => {
        set({ activeThreadId: null });
      },

      addMessage: (threadId, message) => {
        set((state) => ({
          threads: state.threads.map((t) => {
            if (t.id !== threadId) return t;

            const newMessages = [
              ...t.messages,
              {
                ...message,
                id: uuidv4(),
                timestamp: Date.now(),
              },
            ];

            // Update title if it's the first user message
            let title = t.title;
            if (t.messages.length === 0 && message.role === "user") {
              title =
                message.content.slice(0, 30) +
                (message.content.length > 30 ? "..." : "");
            }

            return {
              ...t,
              messages: newMessages,
              title,
            };
          }),
        }));
      },

      updateLastMessage: (
        threadId,
        content,
        searchResults,
        queries,
        isFinalized = false
      ) => {
        set((state) => ({
          threads: state.threads.map((t) => {
            if (t.id !== threadId) return t;
            const lastMessage = t.messages[t.messages.length - 1];
            if (!lastMessage) return t;

            const updatedMessages = [...t.messages];
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content,
              ...(searchResults ? { searchResults } : {}),
              ...(queries ? { queries } : {}),
              isFinalized,
            };

            return { ...t, messages: updatedMessages };
          }),
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "chat-storage",
    }
  )
);
