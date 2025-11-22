export async function streamChat(
  messages,
  onChunk,
  onSearchResults,
  onFinish,
  onError,
  signal
) {
  try {
    const response = await fetch("/api/chat/stream", {
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
          processLine(buffer, onChunk, onSearchResults, onFinish);
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        processLine(line, onChunk, onSearchResults, onFinish);
      }
    }

    onFinish();
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
}

function processLine(line, onChunk, onSearchResults, onFinish) {
  const trimmedLine = line.trim();
  if (!trimmedLine.startsWith("data:")) return;

  try {
    const jsonStr = trimmedLine.substring(5).trimStart();
    const data = JSON.parse(jsonStr);

    if (data.type === "search_results") {
      onSearchResults(data.data || []);
    } else if (data.type === "answer") {
      onChunk(data.data || "");
    } else if (data.type === "done") {
      onFinish();
    }
  } catch (e) {
    // Ignore parse errors for partial lines
  }
}
