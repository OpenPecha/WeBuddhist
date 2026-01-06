import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ChatInput } from "./ChatInput";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="ui-button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("react-icons/ci", () => ({
  CiLocationArrow1: (props: any) => <span data-testid="send-icon" {...props} />,
}));

const keyDownWithComposing = (
  el: HTMLElement,
  key: string,
  opts?: { shiftKey?: boolean; isComposing?: boolean },
) => {
  const event = new KeyboardEvent("keydown", {
    key,
    shiftKey: !!opts?.shiftKey,
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(event, "nativeEvent", {
    value: { isComposing: !!opts?.isComposing },
  });

  el.dispatchEvent(event);
};

describe("ChatInput", () => {
  const setInput = vi.fn();
  const handleSubmit = vi.fn((e) => e.preventDefault());
  const handleStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders textarea with default placeholder", () => {
    render(
      <ChatInput
        input=""
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    expect(
      screen.getByPlaceholderText("Ask a question about Buddhist texts..."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("send-icon")).toBeInTheDocument();
  });

  test("uses custom placeholder when provided", () => {
    render(
      <ChatInput
        input=""
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
        placeholder="Custom placeholder"
      />,
    );

    expect(
      screen.getByPlaceholderText("Custom placeholder"),
    ).toBeInTheDocument();
  });

  test("calls setInput on textarea change", () => {
    render(
      <ChatInput
        input=""
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });

    expect(setInput).toHaveBeenCalledWith("hello");
  });

  test("disables textarea when isLoading=true", () => {
    render(
      <ChatInput
        input="hi"
        setInput={setInput}
        isLoading={true}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  test("button is disabled when input is empty/whitespace and not loading", () => {
    render(
      <ChatInput
        input="   "
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    expect(screen.getByTestId("ui-button")).toBeDisabled();
  });

  test("button is enabled when input has text and not loading", () => {
    render(
      <ChatInput
        input="hello"
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    expect(screen.getByTestId("ui-button")).not.toBeDisabled();
  });

  test("when isLoading=true, button type is 'button' and clicking calls handleStop", () => {
    render(
      <ChatInput
        input="hello"
        setInput={setInput}
        isLoading={true}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    const btn = screen.getByTestId("ui-button");
    expect(btn).toHaveAttribute("type", "button");

    fireEvent.click(btn);
    expect(handleStop).toHaveBeenCalledTimes(1);
  });

  test("when isLoading=false, button type is 'submit' and clicking triggers form submit", () => {
    render(
      <ChatInput
        input="hello"
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
      />,
    );

    const btn = screen.getByTestId("ui-button");
    expect(btn).toHaveAttribute("type", "submit");

    // Submitting form should call handleSubmit
    fireEvent.click(btn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  test("Enter (no shift, not composing) with isLoading=true calls handleStop and prevents submit", () => {
    const formRef = React.createRef<HTMLFormElement>();
    const requestSubmit = vi.fn();

    render(
      <ChatInput
        input="hello"
        setInput={setInput}
        isLoading={true}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
        formRef={formRef}
      />,
    );

    if (formRef.current) {
      (formRef.current as any).requestSubmit = requestSubmit;
    }

    const textarea = screen.getByRole("textbox");
    keyDownWithComposing(textarea, "Enter", {
      shiftKey: false,
      isComposing: false,
    });

    expect(handleStop).toHaveBeenCalledTimes(1);
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  test("Enter (no shift, not composing) with non-empty input calls formRef.requestSubmit", () => {
    const formRef = React.createRef<HTMLFormElement>();
    const requestSubmit = vi.fn();

    render(
      <ChatInput
        input="hello"
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
        formRef={formRef}
      />,
    );

    if (formRef.current) {
      (formRef.current as any).requestSubmit = requestSubmit;
    }

    const textarea = screen.getByRole("textbox");
    keyDownWithComposing(textarea, "Enter", {
      shiftKey: false,
      isComposing: false,
    });

    expect(requestSubmit).toHaveBeenCalledTimes(1);
    expect(handleStop).not.toHaveBeenCalled();
  });

  test("Enter with Shift does NOT submit", () => {
    const formRef = React.createRef<HTMLFormElement>();
    const requestSubmit = vi.fn();

    render(
      <ChatInput
        input="hello"
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
        formRef={formRef}
      />,
    );

    if (formRef.current) {
      (formRef.current as any).requestSubmit = requestSubmit;
    }

    const textarea = screen.getByRole("textbox");
    keyDownWithComposing(textarea, "Enter", {
      shiftKey: true,
      isComposing: false,
    });

    expect(requestSubmit).not.toHaveBeenCalled();
  });

  test("Enter with empty/whitespace input does NOT submit", () => {
    const formRef = React.createRef<HTMLFormElement>();
    const requestSubmit = vi.fn();

    render(
      <ChatInput
        input="   "
        setInput={setInput}
        isLoading={false}
        handleSubmit={handleSubmit}
        handleStop={handleStop}
        formRef={formRef}
      />,
    );

    if (formRef.current) {
      (formRef.current as any).requestSubmit = requestSubmit;
    }

    const textarea = screen.getByRole("textbox");
    keyDownWithComposing(textarea, "Enter", {
      shiftKey: false,
      isComposing: false,
    });

    expect(requestSubmit).not.toHaveBeenCalled();
  });
});
