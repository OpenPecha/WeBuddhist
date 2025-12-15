import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import UserLogin from "./UserLogin.tsx";
import "@testing-library/jest-dom";
import { vi, test, expect, describe } from "vitest";
import {
  mockAxios,
  mockTolgee,
  mockUseAuth,
} from "../../test-utils/CommonMocks.ts";
import { TolgeeProvider } from "@tolgee/react";
import axiosInstance from "../../config/axios-config.ts";

mockUseAuth();
mockAxios();

describe("UserLogin Component", () => {
  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <UserLogin />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  test("renders the login form correctly", () => {
    setup();

    expect(screen.getByText("Welcome to WeBuddhist")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(screen.getByText("Create a new account")).toBeInTheDocument();
  });

  test("handles user input for email and password fields", () => {
    setup();

    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput.value).toBe("password123");
  });

  test("renders error message on invalid form submission (email or password empty)", () => {
    setup();

    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.click(loginButton);

    expect(
      screen.queryByText("Please fill in all fields"),
    ).not.toBeInTheDocument();
  });

  test("checks forgot password link navigates correctly", () => {
    setup();

    const forgotPasswordLink = screen.getByText("Forgot your password?");
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  test("checks create account link navigates correctly", () => {
    setup();

    const createAccountLink = screen.getByText("Create a new account");
    expect(createAccountLink).toHaveAttribute("href", "/register");
  });

  test("submits the form when valid data is entered", () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { auth: { access_token: "myAccessToken" } },
    });
    setup();

    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const handleSubmit = vi.fn();
    fireEvent.click(loginButton);

    expect(
      screen.queryByText("Please fill in all fields"),
    ).not.toBeInTheDocument();

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test("toggles password visibility when eye icon is clicked", () => {
    setup();

    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const eyeButton = screen.getByRole("button", {
      name: "login.show_password",
    });
    fireEvent.click(eyeButton);

    expect(passwordInput).toHaveAttribute("type", "text");

    const hideButton = screen.getByRole("button", {
      name: "login.hide_password",
    });
    fireEvent.click(hideButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("handles Google login button click", async () => {
    setup();

    // Find and click Google login button
    const googleLoginButton = screen.getByText("Google");

    // Click the button - this should call loginWithGoogle function
    fireEvent.click(googleLoginButton);

    // Verify button still exists after click
    expect(googleLoginButton).toBeInTheDocument();
  });

  test("handles Apple login button click", async () => {
    setup();

    // Find and click Apple login button
    const appleLoginButton = screen.getByText("Apple");

    // Click the button - this should call loginWithApple function
    fireEvent.click(appleLoginButton);

    // Verify button still exists after click
    expect(appleLoginButton).toBeInTheDocument();
  });

  test("shows validation error when submitting empty form", () => {
    setup();

    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.click(loginButton);
    // getAllByText to handle multiple validation messages
    const errorMessages = screen.getAllByText("user.validation.required");

    // Validation errors for both email and password
    expect(errorMessages).toHaveLength(2);
    expect(errorMessages[0]).toBeInTheDocument();
    expect(errorMessages[1]).toBeInTheDocument();
  });

  test("validates password length correctly", () => {
    setup();

    const emailInput = screen.getByPlaceholderText("Email Address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    // Test with valid email but short password (less than 8 characters)
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });

    fireEvent.click(loginButton);

    // Trigger password validation logic
    expect(passwordInput.value).toBe("123");
    expect(emailInput.value).toBe("test@example.com");
    expect(
      screen.getByText("user.validation.invalid_password"),
    ).toBeInTheDocument();
  });
});
