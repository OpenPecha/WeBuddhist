import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ChatPage from "./ChatPage";

const scrollIntoViewMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: scrollIntoViewMock,
    writable: true,
  });
});

const mockUseChat = vi.fn();

vi.mock("../../../context/ChatContext", () => ({
  useChat: () => mockUseChat(),
}));

const messageBubbleCalls: Array<{ message: any; isStreaming: boolean }> = [];
const queriesCalls: Array<{ queries: any; show: boolean }> = [];

vi.mock("../../atom/MessageBubble", () => ({
  MessageBubble: (props: any) => {
    messageBubbleCalls.push({
      message: props.message,
      isStreaming: props.isStreaming,
    });
    return (
      <div data-testid={`message-bubble-${props.message.id}`}>
        MessageBubble:{props.message.role}:{props.message.content}
      </div>
    );
  },
}));

vi.mock("../../atom/Queries", () => ({
  Queries: (props: any) => {
    queriesCalls.push({ queries: props.queries, show: props.show });
    return (
      <div
        data-testid={`queries-${Array.isArray(props.queries) ? props.queries.length : "x"}`}
        data-show={props.show ? "true" : "false"}
      >
        Queries
      </div>
    );
  },
}));

vi.mock("react-icons/fa6", () => ({
  FaSpinner: (props: any) => <span data-testid="spinner-icon" {...props} />,
}));

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scrollIntoViewMock.mockClear();
    messageBubbleCalls.length = 0;
    queriesCalls.length = 0;

    mockUseChat.mockReturnValue({
      messages: [],
      isLoading: false,
      isThinking: false,
    });
  });

  test("renders empty page without messages and without Thinking indicator by default", () => {
    render(<ChatPage />);

    expect(screen.queryByText("Thinking...")).not.toBeInTheDocument();
    expect(screen.queryByTestId("spinner-icon")).not.toBeInTheDocument();
    expect(messageBubbleCalls.length).toBe(0);
    expect(queriesCalls.length).toBe(0);
  });

  test("renders MessageBubble for each message", () => {
    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "user", content: "Hi" },
        { id: "m2", role: "assistant", content: "Hello" },
      ],
      isLoading: false,
      isThinking: false,
    });

    render(<ChatPage />);

    expect(screen.getByTestId("message-bubble-m1")).toBeInTheDocument();
    expect(screen.getByTestId("message-bubble-m2")).toBeInTheDocument();

    expect(messageBubbleCalls).toEqual([
      {
        message: { id: "m1", role: "user", content: "Hi" },
        isStreaming: false,
      },
      {
        message: { id: "m2", role: "assistant", content: "Hello" },
        isStreaming: false,
      },
    ]);
  });

  test("sets isStreaming=true only for the last message when isLoading=true", () => {
    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "user", content: "Q" },
        { id: "m2", role: "assistant", content: "A" },
      ],
      isLoading: true,
      isThinking: false,
    });

    render(<ChatPage />);

    expect(messageBubbleCalls[0].isStreaming).toBe(false);
    expect(messageBubbleCalls[1].isStreaming).toBe(true);
  });

  test("renders Queries for assistant messages that have queries; show=true only when streaming last msg AND not thinking", () => {
    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "assistant", content: "Old", queries: ["q1"] },
        { id: "m2", role: "assistant", content: "Last", queries: ["q2", "q3"] },
      ],
      isLoading: true,
      isThinking: false,
    });

    render(<ChatPage />);

    expect(queriesCalls.length).toBe(2);
    expect(queriesCalls[0]).toEqual({ queries: ["q1"], show: false });
    expect(queriesCalls[1]).toEqual({ queries: ["q2", "q3"], show: true });
  });

  test("does NOT show queries when isThinking=true (even if last assistant message is streaming)", () => {
    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "assistant", content: "Last", queries: ["q1"] },
      ],
      isLoading: true,
      isThinking: true,
    });

    render(<ChatPage />);

    expect(queriesCalls.length).toBe(1);
    expect(queriesCalls[0]).toEqual({ queries: ["q1"], show: false });
  });

  test('shows "Thinking..." indicator with spinner when isThinking=true', () => {
    mockUseChat.mockReturnValue({
      messages: [{ id: "m1", role: "user", content: "Hi" }],
      isLoading: false,
      isThinking: true,
    });

    render(<ChatPage />);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner-icon")).toBeInTheDocument();
  });

  test("scrolls to bottom on mount and when dependencies change (messages/isLoading/isThinking)", async () => {
    mockUseChat.mockReturnValue({
      messages: [{ id: "m1", role: "user", content: "Hi" }],
      isLoading: false,
      isThinking: false,
    });

    const { rerender } = render(<ChatPage />);

    // effect runs after render
    await waitFor(() => expect(scrollIntoViewMock).toHaveBeenCalledTimes(1));

    // Change messages
    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "user", content: "Hi" },
        { id: "m2", role: "assistant", content: "Hello" },
      ],
      isLoading: false,
      isThinking: false,
    });
    rerender(<ChatPage />);
    await waitFor(() => expect(scrollIntoViewMock).toHaveBeenCalledTimes(2));

    // Change isLoading
    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "user", content: "Hi" },
        { id: "m2", role: "assistant", content: "Hello" },
      ],
      isLoading: true,
      isThinking: false,
    });
    rerender(<ChatPage />);
    await waitFor(() => expect(scrollIntoViewMock).toHaveBeenCalledTimes(3));

    mockUseChat.mockReturnValue({
      messages: [
        { id: "m1", role: "user", content: "Hi" },
        { id: "m2", role: "assistant", content: "Hello" },
      ],
      isLoading: true,
      isThinking: true,
    });
    rerender(<ChatPage />);
    await waitFor(() => expect(scrollIntoViewMock).toHaveBeenCalledTimes(4));
  });
});
