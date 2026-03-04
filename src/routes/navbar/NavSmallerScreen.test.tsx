import { mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.ts";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi, beforeEach, describe, test, expect } from "vitest";
import NavSmallerScreen from "./NavSmallerScreen.tsx";

mockUseAuth();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

const mockProps = {
  searchTerm: "",
  onSearchTermChange: vi.fn(),
  onSearchSubmit: vi.fn((e) => e.preventDefault()),
  navItems: [{ to: "/collections", label: "Texts", key: "collections" }],
  renderAuthButtons: () => <span>Auth</span>,
  isAuthenticated: false,
  isLoggedIn: false,
  onProfileNavigate: vi.fn(),
  translate: (key: string) => key,
};

describe("NavSmallerScreen Component", () => {
  const queryClient = new QueryClient();

  const setup = (overrides = {}) => {
    const props = { ...mockProps, ...overrides };
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <NavSmallerScreen {...props} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calls onSearchTermChange when typing in search input", async () => {
    const user = userEvent.setup();
    setup();

    const sheetTrigger = screen.getByRole("button");
    await user.click(sheetTrigger);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    );
    await user.type(searchInput, "t");

    expect(mockProps.onSearchTermChange).toHaveBeenCalledWith("t");
  });

  test("calls onSearchSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    setup({ searchTerm: "test query" });

    const sheetTrigger = screen.getByRole("button");
    await user.click(sheetTrigger);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    );
    await user.type(searchInput, "{enter}");

    expect(mockProps.onSearchSubmit).toHaveBeenCalled();
  });

  test("keeps sheet open when submitting with empty search term", async () => {
    const user = userEvent.setup();
    setup({ searchTerm: "   " });

    const sheetTrigger = screen.getByRole("button");
    await user.click(sheetTrigger);

    const searchInput = screen.getByPlaceholderText(
      "common.placeholder.search",
    );
    await user.type(searchInput, "{enter}");

    expect(mockProps.onSearchSubmit).toHaveBeenCalled();
    expect(
      screen.getByPlaceholderText("common.placeholder.search"),
    ).toBeInTheDocument();
  });
});
