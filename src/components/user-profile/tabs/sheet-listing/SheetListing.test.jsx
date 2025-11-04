import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import SheetListing, { fetchsheet } from "./SheetListing";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../../sheets/view-sheet/SheetDetailPage", () => ({
  deleteSheet: vi.fn().mockResolvedValue({}),
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
}));

vi.mock("../../../../config/axios-config.js", () => ({
  default: {
    get: vi.fn(),
  },
}));
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
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
        published_date: "2024-03-20 10:00:00",
        language: "bo"
      },
      {
        id: "2",
        title: "Test Sheet 2",
        publisher: { username: "testuser" },
        views: 200,
        published_date: "2024-03-21 10:00:00",
        language: "en"
      }
    ],
    skip: 0,
    limit: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue("bo-IN");
    mockSessionStorage.getItem.mockReturnValue("mock-token");
    axiosInstance.get.mockResolvedValue({ data: mockSheetsData });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSheetsData,
      isLoading: false,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <SheetListing userInfo={{ email: "test@example.com" }} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders SheetListing component", () => {
    setup();
    expect(document.querySelector(".tab-content")).toBeInTheDocument();
    expect(document.querySelector(".sheets-list")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));

    setup();
    expect(screen.getByText("Loading stories...")).toBeInTheDocument();
  });

  test("renders sheets data correctly", () => {
    setup();
    expect(screen.getByText("Test Sheet 1")).toBeInTheDocument();
    expect(screen.getByText("Test Sheet 2")).toBeInTheDocument();
    // Use regex to match the views text
    expect(screen.getByText(/100\s+sheet\.view_count/)).toBeInTheDocument();
    expect(screen.getByText("2024-03-20")).toBeInTheDocument();
  });

  test("applies correct language class to sheet titles", () => {
    setup();
    const tibetanSheet = screen.getByText("Test Sheet 1").closest("h4");
    const englishSheet = screen.getByText("Test Sheet 2").closest("h4");
    expect(tibetanSheet).toHaveClass("sheet-title", "bo-text");
    expect(englishSheet).toHaveClass("sheet-title", "en-text");
  });

  test("handles null data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("sheet.not_found")).toBeInTheDocument();
  });

  test("fetches sheet data successfully", async () => {
    const result = await fetchsheet("test@example.com", 10, 0);
    expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/sheets", {
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

  test("handle page change", () => {
    setup();
    const pageChangeButton = screen.getByText("2");
    fireEvent.click(pageChangeButton);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("opens delete modal when delete button is clicked", () => {
    setup();
    const deleteButtons = document.querySelectorAll(".sheet-delete svg");
    expect(deleteButtons.length).toBeGreaterThan(0);

    fireEvent.click(deleteButtons[0]);

    expect(document.querySelector(".sheet-delete-modal-overlay")).toBeInTheDocument();
  });

  test("closes delete modal when cancel button is clicked", () => {
    setup();
    const deleteButtons = document.querySelectorAll(".sheet-delete svg");
    
    fireEvent.click(deleteButtons[0]);
    expect(document.querySelector(".sheet-delete-modal-overlay")).toBeInTheDocument();
    const cancelButton = document.querySelector(".sheet-delete-cancel-button");

    fireEvent.click(cancelButton);

    expect(document.querySelector(".sheet-delete-modal-overlay")).not.toBeInTheDocument();
  });
});
