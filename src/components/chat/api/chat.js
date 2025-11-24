export async function streamChat(
  messages,
  onChunk,
  onSearchResults,
  onQueries,
  onFinish,
  onError,
  signal
) {
  try {
    const response = await fetch("/chat/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          processLine(buffer, onChunk, onSearchResults, onQueries, onFinish);
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        processLine(line, onChunk, onSearchResults, onQueries, onFinish);
      }
    }

    onFinish();
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
}

function processLine(line, onChunk, onSearchResults, onQueries, onFinish) {
  const trimmedLine = line.trim();
  if (!trimmedLine.startsWith("data:")) return;

  try {
    const jsonStr = trimmedLine.substring(5).trimStart();
    const data = JSON.parse(jsonStr);

    if (data.type === "search_results") {
      onSearchResults(data.data || []);
      if (data.queries) {
        onQueries(data.queries);
      }
    } else if (data.type === "answer") {
      onChunk(data.data || "");
    } else if (data.type === "done") {
      onFinish();
    }
  } catch (e) {
    // Ignore parse errors for partial lines
  }
}

export async function saveChatToBackend(email, question, response, threadId) {
  try {
    const result = await fetch("/webuddhist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        question,
        response: [response],
        threadId,
      }),
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    return await result.json();
  } catch (error) {
    console.error("Error saving chat to backend:", error);
    throw error;
  }
}
