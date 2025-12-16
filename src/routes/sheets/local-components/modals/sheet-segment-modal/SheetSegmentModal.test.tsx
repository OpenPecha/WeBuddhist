import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SheetSegmentModal, { fetchSegments } from "./SheetSegmentModal";
import axiosInstance from "../../../../../config/axios-config";

const mockOnClose = vi.fn();
const mockOnSegment = vi.fn();

const mockSegmentData = {
  sources: [
    {
      text: {
        text_id: "text1",
        title: "Sample Text",
        language: "en",
      },
      segment_matches: [
        {
          segment_id: "seg1",
          content: "<p>Sample segment content</p>",
        },
      ],
    },
  ],
  total: 1,
};

vi.mock("react-query", () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock("use-debounce", () => ({
  useDebounce: vi.fn((value: string) => [value]),
}));

vi.mock("../../../../../config/axios-config", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../../../commons/pagination/PaginationComponent", () => ({
  default: ({
    handlePageChange,
    pagination,
    totalPages,
  }: {
    handlePageChange: (page: number) => void;
    pagination: { currentPage: number; limit: number };
    totalPages: number;
  }) => (
    <div data-testid="pagination-component">
      <button onClick={() => handlePageChange(2)} data-testid="page-button">
        Page 2
      </button>
      <span>
        Page {pagination.currentPage} of {totalPages}
      </span>
    </div>
  ),
}));

vi.mock("./SourceItem", () => ({
  default: ({
    source,
    onSegment,
  }: {
    source: {
      text: { text_id: string; title: string; language: string };
      segment_matches: { segment_id: string; content: string }[];
    };
    onSegment: (segment: { segment_id: string; content: string }) => void;
  }) => (
    <div data-testid="source-item">
      <p>{source.text.title}</p>
      <img src="" alt="source icon" />
      {source.segment_matches.map((segment) => (
        <button
          key={segment.segment_id}
          data-testid="segment-button"
          onClick={() => onSegment(segment)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSegment(segment);
            }
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: segment.content.replace(/<[^>]*>/g, ""),
            }}
          />
        </button>
      ))}
    </div>
  ),
}));

vi.mock("react-icons/io5", () => ({
  IoClose: () => <span data-testid="close-icon">Close</span>,
}));

vi.mock("@/utils/helperFunctions", () => ({
  mapLanguageCode: (code: string) => code,
  getLanguageClass: () => "",
}));

vi.mock("@/utils/constants", () => ({
  LANGUAGE: "LANGUAGE",
}));

import { useQuery } from "react-query";

describe("SheetSegmentModal", () => {
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  const defaultProps = {
    onClose: mockOnClose,
    onSegment: mockOnSegment,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose.mockClear();
    mockOnSegment.mockClear();
  });

  it("renders modal with header and search input", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByText("Search Segment")).toBeInTheDocument();
    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search Segments..."),
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const closeButton = screen.getByTestId("close-icon").closest("button");
    fireEvent.click(closeButton!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays segments when data is available", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByText("Sample Text")).toBeInTheDocument();
    expect(screen.getByAltText("source icon")).toBeInTheDocument();
    expect(screen.getByText("Sample segment content")).toBeInTheDocument();
  });

  it("calls onSegment when segment is clicked", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentButton = screen.getByTestId("segment-button");
    fireEvent.click(segmentButton);

    expect(mockOnSegment).toHaveBeenCalledWith({
      segment_id: "seg1",
      content: "<p>Sample segment content</p>",
    });
  });

  it("updates search filter when typing in search input", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(
      "Search Segments...",
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "test search" } });
    expect(searchInput.value).toBe("test search");
  });

  it("fetchSegments makes correct API call", async () => {
    const mockResponse = { data: { sources: [], total: 0 } };
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    const result = await fetchSegments("test query", "en", 0, {
      currentPage: 1,
      limit: 10,
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/search/multilingual",
      {
        params: {
          query: "test query",
          search_type: "exact",
          language: "en",
          limit: 10,
          skip: 0,
        },
      },
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("calls onSegment when segment is activated with Enter key", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentButton = screen.getByTestId("segment-button");
    fireEvent.keyDown(segmentButton, { key: "Enter" });

    expect(mockOnSegment).toHaveBeenCalledWith({
      segment_id: "seg1",
      content: "<p>Sample segment content</p>",
    });
  });

  it("calls onSegment when segment is activated with Space key", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentButton = screen.getByTestId("segment-button");
    fireEvent.keyDown(segmentButton, { key: " " });

    expect(mockOnSegment).toHaveBeenCalledWith({
      segment_id: "seg1",
      content: "<p>Sample segment content</p>",
    });
  });

  it("does not call onSegment for other key presses", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentButton = screen.getByTestId("segment-button");
    fireEvent.keyDown(segmentButton, { key: "Tab" });

    expect(mockOnSegment).not.toHaveBeenCalled();
  });

  it("displays loading state when fetching data", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByText("Loading segments...")).toBeInTheDocument();
  });

  it("displays empty state when no data found", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { sources: [], total: 0 },
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByText("No data found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search terms"),
    ).toBeInTheDocument();
  });

  it("renders pagination component", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
  });

  it("handles page change via pagination", () => {
    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const pageButton = screen.getByTestId("page-button");
    fireEvent.click(pageButton);

    expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
  });
});
