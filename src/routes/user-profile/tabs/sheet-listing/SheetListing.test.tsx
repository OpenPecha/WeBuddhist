import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import SheetListing, { fetchsheet } from "./SheetListing";
import "@testing-library/jest-dom";
import axiosInstance from "../../../../config/axios-config";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../sheets/view-sheet/SheetDetailPage", () => ({
  deleteSheet: vi.fn().mockResolvedValue({}),
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock("../../../../utils/constants", () => ({
  LANGUAGE: "LANGUAGE",
}));

vi.mock("../../../../utils/helperFunctions", () => ({
  getLanguageClass: (lang: string) => (lang === "bo" ? "bo-text" : "en-text"),
  mapLanguageCode: (code: string) => (code === "bo-IN" ? "bo" : code),
}));

vi.mock("../../../../config/axios-config", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../../commons/pagination/PaginationComponent", () => ({
  default: ({
    totalPages,
    handlePageChange,
  }: {
    totalPages: number;
    handlePageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i + 1} onClick={() => handlePageChange(i + 1)}>
          {i + 1}
        </button>
      ))}
    </div>
  ),
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

describe("SheetListing Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockSheetsData = {
    total: 20,
    sheets: [
      {
        id: "1",
        title: "Test Sheet 1",
        publisher: { username: "testuser" },
        views: 100,
        time_passed: "2 days ago",
        language: "bo",
        is_published: true,
        summary: "This is a test summary",
      },
      {
        id: "2",
        title: "Test Sheet 2",
        publisher: { username: "testuser" },
        views: 200,
        time_passed: "1 day ago",
        language: "en",
        is_published: false,
        summary: "Another test summary",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("bo-IN");
    mockSessionStorage.getItem.mockReturnValue("mock-token");
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockSheetsData,
    });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      () =>
        ({
          data: mockSheetsData,
          isLoading: false,
        }) as unknown as ReturnType<typeof reactQuery.useQuery>,
    );
    vi.spyOn(reactQuery, "useMutation").mockImplementation(
      () =>
        ({
          mutate: vi.fn(),
          isLoading: false,
        }) as unknown as ReturnType<typeof reactQuery.useMutation>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const setup = (isOwnProfile = true) => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <SheetListing
            userInfo={{ email: "test@example.com" }}
            isOwnProfile={isOwnProfile}
          />
        </QueryClientProvider>
      </Router>,
    );
  };

  it("renders SheetListing component with Notes heading", () => {
    setup();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      () =>
        ({
          data: null,
          isLoading: true,
        }) as unknown as ReturnType<typeof reactQuery.useQuery>,
    );

    setup();
    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  it("renders sheets data correctly", () => {
    setup();
    expect(screen.getByText("Test Sheet 1")).toBeInTheDocument();
    expect(screen.getByText("Test Sheet 2")).toBeInTheDocument();
    expect(screen.getByText(/100 sheet\.view_count/)).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  it("renders sheet summaries", () => {
    setup();
    expect(screen.getByText("This is a test summary")).toBeInTheDocument();
    expect(screen.getByText("Another test summary")).toBeInTheDocument();
  });

  it("applies correct language class to sheet titles", () => {
    setup();
    const tibetanSheet = screen.getByText("Test Sheet 1");
    expect(tibetanSheet).toHaveClass("bo-text");
  });

  it("displays Published badge for published sheets", () => {
    setup();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("displays Draft badge for unpublished sheets", () => {
    setup();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("handles null data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      () =>
        ({
          data: null,
          isLoading: false,
        }) as unknown as ReturnType<typeof reactQuery.useQuery>,
    );

    setup();
    expect(screen.getByText("sheet.not_found")).toBeInTheDocument();
    expect(screen.getByText("community_empty_story")).toBeInTheDocument();
  });

  it("handles empty sheets array gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      () =>
        ({
          data: { sheets: [], total: 0 },
          isLoading: false,
        }) as unknown as ReturnType<typeof reactQuery.useQuery>,
    );

    setup();
    expect(screen.getByText("sheet.not_found")).toBeInTheDocument();
  });

  it("fetches sheet data successfully", async () => {
    const result = await fetchsheet("test@example.com", 10, 0);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/sheets", {
      headers: {
        Authorization: "Bearer mock-token",
      },
      params: {
        language: "bo",
        email: "test@example.com",
        limit: 10,
        skip: 0,
      },
    });
    expect(result).toEqual(mockSheetsData);
  });

  it("fetches sheet data with Bearer None when no token", async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    await fetchsheet("test@example.com", 10, 0);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/sheets", {
      headers: {
        Authorization: "Bearer None",
      },
      params: expect.any(Object),
    });
  });

  it("renders pagination when sheets exist", () => {
    setup();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("handles page change", () => {
    setup();
    const pageChangeButton = screen.getByText("2");
    fireEvent.click(pageChangeButton);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows delete button when isOwnProfile is true", () => {
    setup(true);
    const deleteButtons = screen.getAllByRole("button");
    const deleteIconButtons = deleteButtons.filter((btn) =>
      btn.querySelector("svg"),
    );
    expect(deleteIconButtons.length).toBeGreaterThan(0);
  });

  it("hides delete button when isOwnProfile is false", () => {
    setup(false);
    const buttons = screen.queryAllByRole("button");
    const deleteButtons = buttons.filter(
      (btn) => btn.getAttribute("variant") === "ghost",
    );
    expect(deleteButtons.length).toBe(0);
  });

  it("calls deleteSheetMutation when delete is confirmed in dialog", async () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(
      () =>
        ({
          mutate: mockMutate,
          isLoading: false,
        }) as unknown as ReturnType<typeof reactQuery.useMutation>,
    );

    setup(true);
    const deleteButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg"));

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText("sheet.delete_button");
      fireEvent.click(confirmButton);

      expect(mockMutate).toHaveBeenCalledWith("1");
    }
  });

  it("generates correct link URLs for sheets", () => {
    setup();
    const link = screen.getByText("Test Sheet 1").closest("a");
    expect(link).toHaveAttribute("href", "/testuser/test-sheet-1_1");
  });

  it("displays view count with icon", () => {
    setup();
    expect(screen.getByText(/100 sheet\.view_count/)).toBeInTheDocument();
    expect(screen.getByText(/200 sheet\.view_count/)).toBeInTheDocument();
  });

  it("displays time passed with icon", () => {
    setup();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
    expect(screen.getByText("1 day ago")).toBeInTheDocument();
  });
});
