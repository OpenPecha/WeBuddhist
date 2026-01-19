import { ACCESS_TOKEN } from "../../../utils/constants";

export interface ChatStreamProps {
  query: string;
  application: string;
  device_type: string;
  thread_id?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  text: string;
  score: number;
  distance: number;
}

export interface Queries {
  tibetan_bm25?: string;
  english_bm25?: string;
  tibetan_semantic?: string;
  english_semantic?: string;
}

export interface StreamCallbacks {
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
  const { query, application, device_type, thread_id } = params;
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
    const response = await fetch(`/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "Bearer None",
      },
      body: JSON.stringify({
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
          } catch {}
        }
      }
    }
    onComplete();
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return;
    }
    onError(error as Error);
  }
};
