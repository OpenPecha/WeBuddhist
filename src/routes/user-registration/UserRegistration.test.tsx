import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { expect, test, describe } from "vitest";
import "@testing-library/jest-dom";

import UserRegistration from "./UserRegistration.js";
import {
  mockAxios,
  mockTolgee,
  mockUseAuth,
} from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";

mockAxios();
mockUseAuth();

describe("UserRegistration Component", () => {
  const setup = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <UserRegistration />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  const getPasswordAndConfirmInputs = () => {
    const passwordInputs = screen.getAllByPlaceholderText(/password/i);

    const passwordInput = passwordInputs.find(
      (el) => !/confirm/i.test(el.getAttribute("placeholder") ?? ""),
    );
    const confirmPasswordInput = passwordInputs.find((el) =>
      /confirm/i.test(el.getAttribute("placeholder") ?? ""),
    );

    if (!passwordInput || !confirmPasswordInput) {
      throw new Error(
        "Could not uniquely find password and confirm password inputs by placeholder",
      );
    }

    return { passwordInput, confirmPasswordInput };
  };

  test("handles invalid user input correctly", async () => {
    setup();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const lastNameInput = screen.getByPlaceholderText(/last/i);
    const { passwordInput, confirmPasswordInput } =
      getPasswordAndConfirmInputs();

    await user.type(emailInput, "test@example"); // invalid email
    await user.type(lastNameInput, "Arisu");
    await user.type(passwordInput, "pass"); // too short
    await user.type(confirmPasswordInput, "password121"); // mismatch

    await user.click(screen.getByRole("button", { name: /sign up|sign_up/i }));

    // These IDs come from your component, stable across styling changes
    expect(document.getElementById("first-name-error")).toBeInTheDocument();
    expect(document.getElementById("email-error")).toBeInTheDocument();
    expect(document.getElementById("password-error")).toBeInTheDocument();
    expect(
      document.getElementById("confirm-password-error"),
    ).toBeInTheDocument();

    // aria-invalid checks (translation independent)
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
  });

  test("displays errors if form is submitted with empty fields", async () => {
    setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /sign up|sign_up/i }));

    const errorNodes = document.querySelectorAll(
      "#email-error, #first-name-error, #last-name-error, #password-error, #confirm-password-error",
    );
    expect(errorNodes.length).toBeGreaterThan(0);
  });

  test("password toggle button works correctly", async () => {
    setup();
    const user = userEvent.setup();

    const { passwordInput } = getPasswordAndConfirmInputs();

    // Toggle button is inside the same relative wrapper (no old .password-toggle class anymore)
    const toggleButton = within(
      passwordInput.parentElement as HTMLElement,
    ).getByRole("button");

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("confirm password toggle button works correctly", async () => {
    setup();
    const user = userEvent.setup();

    const { confirmPasswordInput } = getPasswordAndConfirmInputs();

    const toggleButton = within(
      confirmPasswordInput.parentElement as HTMLElement,
    ).getByRole("button");

    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("handles Google login button click", async () => {
    setup();
    const user = userEvent.setup();

    const googleLoginButton = screen.getByRole("button", { name: /google/i });
    await user.click(googleLoginButton);

    expect(googleLoginButton).toBeInTheDocument();
  });

  test("handles Apple login button click", async () => {
    setup();
    const user = userEvent.setup();

    const appleLoginButton = screen.getByRole("button", { name: /apple/i });
    await user.click(appleLoginButton);

    expect(appleLoginButton).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    setup();
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText(/email/i);
    const firstNameInput = screen.getByPlaceholderText(/first/i);
    const lastNameInput = screen.getByPlaceholderText(/last/i);
    const { passwordInput, confirmPasswordInput } =
      getPasswordAndConfirmInputs();

    await user.type(emailInput, "test@example.com");
    await user.type(firstNameInput, "Test");
    await user.type(lastNameInput, "User");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "different123");

    await user.click(screen.getByRole("button", { name: /sign up|sign_up/i }));

    expect(
      document.getElementById("confirm-password-error"),
    ).toBeInTheDocument();
    expect(document.getElementById("email-error")).not.toBeInTheDocument();
    expect(document.getElementById("first-name-error")).not.toBeInTheDocument();
    expect(document.getElementById("password-error")).not.toBeInTheDocument();
  });
});
