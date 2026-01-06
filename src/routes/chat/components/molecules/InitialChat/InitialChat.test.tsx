import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import InitialChat from "./InitialChat";

let auth0User: any = { email: "auth0@example.com" };
let isLoggedIn = true;

const mockInvalidateQueries = vi.fn();
const mockUseQuery = vi.fn();

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

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: auth0User,
  }),
}));

vi.mock("@/config/AuthContext", () => ({
  useAuth: () => ({
    isLoggedIn,
  }),
}));

vi.mock("@/config/axios-config", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("react-query", async () => {
  const actual = await vi.importActual<any>("react-query");
  return {
    ...actual,
    useQuery: (...args: any[]) => mockUseQuery(...args),
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

    auth0User = { email: "auth0@example.com" };
    isLoggedIn = true;

    mockUseChat.mockReturnValue({
      messages: [],
      input: "",
      setInput: mockSetInput,
      handleSubmit: mockChatHandleSubmit,
      handleStop: mockHandleStop,
      isLoading: false,
    });

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
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

  test("on submit: uses Auth0 user email, calls chatHandleSubmit, and invalidates ['threads'] on initial chat success", () => {
    render(<InitialChat />);

    expect(lastChatInputProps).toBeTruthy();

    const e = makeFakeFormEvent();
    lastChatInputProps.handleSubmit(e);

    expect(mockChatHandleSubmit).toHaveBeenCalledTimes(1);

    const [, options] = mockChatHandleSubmit.mock.calls[0];
    expect(options.email).toBe("auth0@example.com");
    expect(typeof options.onSuccess).toBe("function");

    options.onSuccess("thread-123");
    expect(mockInvalidateQueries).toHaveBeenCalledWith(["threads"]);
  });

  test("on submit: falls back to userInfo.email when Auth0 user email is missing", () => {
    auth0User = null;

    mockUseQuery.mockReturnValue({
      data: { email: "apiuser@example.com" },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<InitialChat />);

    const e = makeFakeFormEvent();
    lastChatInputProps.handleSubmit(e);

    const [, options] = mockChatHandleSubmit.mock.calls[0];
    expect(options.email).toBe("apiuser@example.com");
  });

  test("on submit: falls back to default email when neither Auth0 nor userInfo provides one", () => {
    auth0User = null;

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<InitialChat />);

    const e = makeFakeFormEvent();
    lastChatInputProps.handleSubmit(e);

    const [, options] = mockChatHandleSubmit.mock.calls[0];
    expect(options.email).toBe("test@webuddhist");
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

  test("passes enabled=isLoggedIn into useQuery options", () => {
    isLoggedIn = false;

    render(<InitialChat />);

    expect(mockUseQuery).toHaveBeenCalled();
    const call = mockUseQuery.mock.calls.find((c) => c?.[0] === "userInfo");
    expect(call).toBeTruthy();

    const options = call?.[2];
    expect(options?.enabled).toBe(false);
    expect(options?.refetchOnWindowFocus).toBe(false);
  });
});
