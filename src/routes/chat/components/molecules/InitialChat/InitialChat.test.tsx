import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import InitialChat from "./InitialChat";

const mockInvalidateQueries = vi.fn();

const mockChatHandleSubmit = vi.fn();
const mockHandleStop = vi.fn();
const mockSetInput = vi.fn();

let lastChatInputProps: any = null;

vi.mock("react-icons/wi", () => ({
  WiStars: (props: any) => <span data-testid="stars-icon" {...props} />,
}));

const mockUseChat = vi.fn();
vi.mock("../../../context/ChatContext", () => ({
  useChat: () => mockUseChat(),
}));

vi.mock("react-query", async () => {
  const actual = await vi.importActual<any>("react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

vi.mock("../ChatPage/ChatPage", () => ({
  default: () => <div data-testid="chat-page">ChatPage</div>,
}));

vi.mock("../ChatInput/ChatInput", () => ({
  ChatInput: (props: any) => {
    lastChatInputProps = props;
    return (
      <div
        data-testid="chat-input"
        data-isinitial={props.isinitial ? "true" : "false"}
      >
        ChatInput
      </div>
    );
  },
}));

const makeFakeFormEvent = () =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    currentTarget: document.createElement("form"),
    target: document.createElement("form"),
  }) as unknown as React.FormEvent<HTMLFormElement>;

describe("InitialChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastChatInputProps = null;

    mockUseChat.mockReturnValue({
      messages: [],
      input: "",
      setInput: mockSetInput,
      handleSubmit: mockChatHandleSubmit,
      handleStop: mockHandleStop,
      isLoading: false,
    });
  });

  test("renders initial empty-state UI and ChatInput with isinitial=true when there are no messages", () => {
    render(<InitialChat />);

    expect(screen.getByText(/Explore Buddhist Wisdom/i)).toBeInTheDocument();
    expect(screen.getByTestId("stars-icon")).toBeInTheDocument();

    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toHaveAttribute(
      "data-isinitial",
      "true",
    );

    expect(screen.queryByTestId("chat-page")).not.toBeInTheDocument();
  });

  test("renders ChatPage and ChatInput (isinitial=false) when there are messages", () => {
    mockUseChat.mockReturnValue({
      messages: [{ role: "user", content: "hi" }],
      input: "hello",
      setInput: mockSetInput,
      handleSubmit: mockChatHandleSubmit,
      handleStop: mockHandleStop,
      isLoading: false,
    });

    render(<InitialChat />);

    expect(screen.getByTestId("chat-page")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toHaveAttribute(
      "data-isinitial",
      "false",
    );

    expect(
      screen.queryByText(/Explore Buddhist Wisdom/i),
    ).not.toBeInTheDocument();
  });

  test("on submit: calls chatHandleSubmit and invalidates ['threads'] on initial chat success", () => {
    render(<InitialChat />);

    expect(lastChatInputProps).toBeTruthy();

    const e = makeFakeFormEvent();
    lastChatInputProps.handleSubmit(e);

    expect(mockChatHandleSubmit).toHaveBeenCalledTimes(1);

    const [, options] = mockChatHandleSubmit.mock.calls[0];
    expect(typeof options.onSuccess).toBe("function");

    options.onSuccess("thread-123");
    expect(mockInvalidateQueries).toHaveBeenCalledWith(["threads"]);
  });

  test("does NOT invalidate ['threads'] on success when it is NOT the initial chat (messages already exist)", () => {
    mockUseChat.mockReturnValue({
      messages: [{ role: "assistant", content: "already started" }],
      input: "hello",
      setInput: mockSetInput,
      handleSubmit: mockChatHandleSubmit,
      handleStop: mockHandleStop,
      isLoading: false,
    });

    render(<InitialChat />);

    const e = makeFakeFormEvent();
    lastChatInputProps.handleSubmit(e);

    const [, options] = mockChatHandleSubmit.mock.calls[0];
    options.onSuccess("thread-999");

    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
