import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import AlertModal from "./AlertModal";

const defaultMessage = "This is a test message.";

describe("AlertModal Component", () => {
  const handleClose = vi.fn();

  const setup = (props = {}) => {
    return render(
      <AlertModal
        type="success"
        message={defaultMessage}
        onClose={handleClose}
        {...props}
      />
    );
  };

  afterEach(() => {
    handleClose.mockClear();
  });

  test("renders success modal with correct content", () => {
    setup({ type: "success" });
    
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText(defaultMessage)).toBeInTheDocument();
    expect(screen.getByText("Redirecting soon...")).toBeInTheDocument();
    expect(screen.getByAltText("Webuddhist Icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { hidden: true })).toBeInTheDocument();
  });

  test("renders error modal with correct content", () => {
    setup({ type: "error" });
    
    expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText(defaultMessage)).toBeInTheDocument();
    expect(screen.queryByText("Redirecting soon...")).not.toBeInTheDocument();
    expect(screen.getByAltText("Webuddhist Icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { hidden: true })).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", () => {
    setup();
    
    const closeButton = screen.getByRole("button", { hidden: true });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("dialog has correct accessibility attributes", () => {
    setup();
    
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog).toHaveClass("alert-modal-overlay");
    expect(screen.getByAltText("Webuddhist Icon")).toBeInTheDocument();
    expect(screen.getByText("Success")).toHaveClass("alert-modal-title");
  });

  test("renders different types correctly", () => {
    const { rerender } = render(
      <AlertModal
        type="success"
        message={defaultMessage}
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Redirecting soon...")).toBeInTheDocument();

    rerender(
      <AlertModal
        type="error"
        message={defaultMessage}
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Redirecting soon...")).not.toBeInTheDocument();
  });

  test("renders with custom message", () => {
    const customMessage = "Custom error message";
    setup({ message: customMessage });
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});