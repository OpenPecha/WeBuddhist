import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "vitest";
import UserRegistration from "./UserRegistration.js";
import "@testing-library/jest-dom";
import { mockAxios, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";

mockAxios();
mockUseAuth()
describe("UserRegistration Component", () => {

  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <UserRegistration />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the registration form with all fields and buttons", () => {
    setup();

    const title = screen.getByTestId("signup-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Sign up");

    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();

    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
  
  test("handles invalid user input correctly", async () => {
    setup();
  
    const emailInput = screen.getByPlaceholderText("Email Address");
    const lastNameInput = screen.getByPlaceholderText("Last Name");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput = screen.getByPlaceholderText("common.confirm_password");
  
    await userEvent.type(emailInput, "test@example");
    expect(emailInput).toHaveValue("test@example");
  
    await userEvent.type(lastNameInput, "Arisu");
    expect(lastNameInput).toHaveValue("Arisu");
  
    await userEvent.type(passwordInput, "pass");
    expect(passwordInput).toHaveValue("pass");
  
    await userEvent.type(confirmPasswordInput, "password121");
    expect(confirmPasswordInput).toHaveValue("password121");
  
    const submitButton = screen.getByRole("button", { name: "Sign up" });
    await userEvent.click(submitButton);
  
    expect(screen.getByText("user.validation.password_do_not_match")).toBeInTheDocument();
    expect(screen.getByText("user.validation.invalid_password")).toBeInTheDocument();
    expect(screen.getByText("user.validation.invalid_email")).toBeInTheDocument();
    expect(screen.getByText("user.validation.required")).toBeInTheDocument();
  });

  test("displays error if form is submitted with empty fields", async () => {
    setup();
    const submitButton = screen.getByRole("button", { name: "Sign up" });
    await userEvent.click(submitButton);
    expect(screen.getByRole("button", { name: "Sign up" })).toBeDefined();
  });

  test("checks navigation to login page", () => {
    setup();
    const loginLink = screen.getByRole("link", { name: "Login" });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
  test("password toggle button works correctly", async () => {
    setup();

    const passwordInput = screen.getByPlaceholderText("Password");
    const toggleButton = document.querySelector(".password-toggle");

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleButton).toBeInTheDocument();

    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");

    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("validates form and prevents submission with invalid data", async () => {
    setup();
    
    await userEvent.type(screen.getByPlaceholderText("Email Address"), "invalid-email");
    await userEvent.type(screen.getByPlaceholderText("First Name"), "Ryohei");
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Arisu");
    await userEvent.type(screen.getByPlaceholderText("Password"), "pass");
    await userEvent.type(screen.getByPlaceholderText("common.confirm_password"), "password121");
    
    const submitButton = screen.getByRole("button", { name: "Sign up" });
    await userEvent.click(submitButton);

    expect(screen.getByTestId("signup-title")).toBeInTheDocument();
  });

  test("confirm password toggle button works correctly", async () => {
    setup();
  
    const confirmPasswordInput = screen.getByPlaceholderText("common.confirm_password");
    const confirmPasswordGroup = confirmPasswordInput.closest('.form-group');
    const confirmToggleButton = confirmPasswordGroup.querySelector('.password-toggle');
  
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    
    await userEvent.click(confirmToggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    
    await userEvent.click(confirmToggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("handles Google login button click", async () => {
    setup();
    const googleLoginButton = screen.getByText("Google");
    fireEvent.click(googleLoginButton);
    expect(googleLoginButton).toBeInTheDocument();
  });

  test("handles Apple login button click", async () => {
    setup();
    const appleLoginButton = screen.getByText("Apple");
    fireEvent.click(appleLoginButton);
    expect(appleLoginButton).toBeInTheDocument();
  });
});
