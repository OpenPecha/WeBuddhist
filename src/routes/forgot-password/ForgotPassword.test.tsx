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
import { expect, describe, it, vi } from "vitest";

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
});
