import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi, beforeEach, it } from "vitest";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ResetPassword from "./ResetPassword.js";
import { BrowserRouter as Router } from "react-router-dom";
import {
  mockAxios,
  mockTolgee,
  mockUseAuth,
} from "../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";

mockAxios();
mockUseAuth();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({ t: (key: string) => key }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ search: "?token=test-token" }),
  };
});

const queryClient = new QueryClient();

describe("ResetPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <ResetPassword />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };
  it("renders the component with required fields", () => {
    setup();
    expect(screen.getByLabelText("common.new_password")).toBeInTheDocument();
    expect(
      screen.getByLabelText("common.confirm_password"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("common.reset_password").length).toBeGreaterThan(
      0,
    );
  });

  // it("shows validation errors when required fields are empty", async () => {
  //   setup();
  //   fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
  //   expect(screen.getAllByText("Required")[0]).toBeInTheDocument();
  // });

  // it("validates password length", async () => {
  //   setup();
  //
  //   fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "short" } });
  //   fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
  //
  //   await waitFor(() => {
  //     expect(screen.getByText("Invalid password")).toBeInTheDocument();
  //   });
  // });

  // it("validates password confirmation", async () => {
  //   setup()
  //   fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "Password123" } });
  //   fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Different123" } });
  //   fireEvent.click(screen.getByText("Reset Password"));
  //
  //   await waitFor(() => {
  //     expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  //   });
  // });

  it("toggles password visibility", () => {
    setup();
    const toggleButtons = screen.getAllByRole("button", {
      name: "login.show_password",
    });

    const newPasswordInput = screen.getByLabelText(
      "common.new_password",
    ) as HTMLInputElement;
    expect(newPasswordInput.type).toBe("password");

    fireEvent.click(toggleButtons[0]);
    expect(newPasswordInput.type).toBe("text");

    fireEvent.click(toggleButtons[0]);
    expect(newPasswordInput.type).toBe("password");
  });

  it("submits the form successfully with valid inputs", async () => {
    setup();
    fireEvent.change(screen.getByLabelText("common.new_password"), {
      target: { value: "NewPassword123" },
    });
    fireEvent.change(screen.getByLabelText("common.confirm_password"), {
      target: { value: "NewPassword123" },
    });

    const resetButtons = screen.getAllByText("common.reset_password");
    fireEvent.click(resetButtons[resetButtons.length - 1]);

    await waitFor(() => {
      expect(
        screen.queryByText("user.validation.required"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("user.validation.invalid_password"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("user.validation.password_do_not_match"),
      ).not.toBeInTheDocument();
    });
  });
});
