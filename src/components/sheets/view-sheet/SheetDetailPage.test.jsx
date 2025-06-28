import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
} from "../../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../../config/axios-config.js";
import SheetDetailPageWithPanelContext, { fetchSheetData } from "./SheetDetailPage.jsx";
import { BrowserRouter as Router, useParams, useSearchParams } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../resources-side-panel/Resources", () => ({
  default: ({ segmentId, handleClose }) => (
    <div data-testid="resources-panel">
      <button onClick={handleClose}>Close</button>
      <div>Resources for segment: {segmentId}</div>
    </div>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: vi.fn(() => [
      new URLSearchParams(),
      vi.fn(),
    ]),
  };
});

describe("SheetDetailPage Component", () => {
  const queryClient = new QueryClient();
  const mockSheetData = {
    sheet_title: "Test Sheet",
    views: 42,
    publisher: {
      name: "Test User",
      username: "testuser",
      avatar_url: "https://example.com/avatar.jpg"
    },
    content: {
      segments: [
        {
          segment_id: "segment1",
          type: "source",
          content: "Source content",
          language: "bo",
          text_title: "Source Title"
        },
        {
          segment_id: "segment2",
          type: "content",
          content: "Text content"
        },
        {
          segment_id: "segment3",
          type: "image",
          content: "https://example.com/image.jpg"
        }
      ]
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ sheetSlugAndId: "test-sheet-626ddc35-a146-4bca-a3a3-b8221c501df3" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSheetData,
      isLoading: false,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <SheetDetailPageWithPanelContext />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders sheet details correctly", () => {
    setup();
    expect(screen.getByText("Test Sheet")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Source Title")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));

    setup();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays not found message when sheet data is null", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("displays not found message when segments array is empty", () => {
    const emptySheetData = {
      ...mockSheetData,
      content: {
        segments: []
      }
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: emptySheetData,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("renders different segment types correctly", () => {
    setup();
    
    expect(screen.getByText("Source Title")).toBeInTheDocument();
    expect(screen.getByAltText("source icon")).toBeInTheDocument();
    
    expect(screen.getByText("Text content")).toBeInTheDocument();
    
    expect(screen.getByAltText("Sheet content")).toBeInTheDocument();
  });

  test("opens resources panel when clicking on a source segment", () => {
    setup();
    
    const sourceSegment = screen.getByText("Source Title").closest(".segment-source");
    fireEvent.click(sourceSegment);
    
    expect(screen.getByTestId("resources-panel")).toBeInTheDocument();
    expect(screen.getByText("Resources for segment: segment1")).toBeInTheDocument();
  });

  test("fetchSheetData calls the correct API endpoint", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockSheetData });
    
    const sheetId = "test-id";
    await fetchSheetData(sheetId);
    
    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/sheets/${sheetId}`, {
      params: {
        skip: 0,
        limit: 10,
      }
    });
  });
});
