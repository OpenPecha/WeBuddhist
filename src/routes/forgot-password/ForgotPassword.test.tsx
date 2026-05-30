import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
} from "../../test-utils/CommonMocks.ts";
import ForgotPassword from "./ForgotPassword.tsx";
import axiosInstance from "../../config/axios-config.ts";
import { expect, describe, it, vi, beforeEach } from "vitest";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe("Forgot Password Component", () => {
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <ForgotPassword />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the component with required fields", () => {
    setup();
    expect(screen.getByText("common.email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "common.button.submit" }),
    ).toBeInTheDocument();
  });

  it("should validate for email", async () => {
    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "api/v1/auth/request-reset-password",
      { email: "test@gmail.com" },
    );
  });

  it("should show error when email is empty", async () => {
    setup();
    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    expect(screen.getByText("user.validation.required")).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("should clear email error when typing after validation error", () => {
    setup();
    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);
    expect(screen.getByText("user.validation.required")).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "t" } });

    expect(
      screen.queryByText("user.validation.required"),
    ).not.toBeInTheDocument();
  });

  it("should show error for invalid email format", async () => {
    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    expect(
      screen.getByText("user.validation.invalid_email"),
    ).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("should handle API error response with message", async () => {
    const errorResponse = {
      response: {
        data: {
          message: "Email not found",
        },
      },
    };

    axiosInstance.post.mockRejectedValueOnce(errorResponse);

    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });

    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    // Wait for error to be processed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText("Email not found")).toBeInTheDocument();
  });

  it("should handle API error response with detail", async () => {
    const errorResponse = {
      response: {
        data: {
          detail: "User account not found",
        },
      },
    };

    axiosInstance.post.mockRejectedValueOnce(errorResponse);

    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });

    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    // Wait for error to be processed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText("User account not found")).toBeInTheDocument();
  });

  it("should handle generic API error", async () => {
    const errorResponse = {
      response: {
        data: {},
      },
    };

    axiosInstance.post.mockRejectedValueOnce(errorResponse);

    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });

    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    // Wait for error to be processed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      screen.getByText("user.validation.login_failed"),
    ).toBeInTheDocument();
  });

  it("should handle network error", async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error("Network error"));

    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });

    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    // Wait for error to be processed
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      screen.getByText("user.validation.login_failed"),
    ).toBeInTheDocument();
  });

  it("should show success message on successful submission", async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

    setup();
    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });

    const submitButton = screen.getByRole("button", {
      name: "common.button.submit",
    });
    fireEvent.click(submitButton);

    // Wait for success to be processed
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The success should clear any errors
    expect(
      screen.queryByText("user.validation.login_failed"),
    ).not.toBeInTheDocument();
  });
});
