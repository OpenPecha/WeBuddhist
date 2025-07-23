import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
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
        language: "tibetan",
      },
      segment_match: [
        {
          segment_id: "seg1",
          content: "<p>Sample segment content</p>",
        },
      ],
    },
  ],
  total: 1,
};

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));
vi.mock("use-debounce", () => ({
  useDebounce: vi.fn((value) => [value]),
}));
vi.mock("../../../../../config/axios-config", () => ({
  default: {
    get: vi.fn(),
  },
}));
vi.mock("react-bootstrap", () => ({
  Form: {
    Control: ({ onChange, value, placeholder, type }) => (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data-testid="search-input"
      />
    ),
  },
}));
vi.mock(
  "../../../../../components/commons/pagination/PaginationComponent",
  () => ({
    default: ({ handlePageChange, pagination, totalPages }) => (
      <div data-testid="pagination-component">
        <button onClick={() => handlePageChange(2)} data-testid="page-button">
          Page 2
        </button>
        <span>
          Page {pagination.currentPage} of {totalPages}
        </span>
      </div>
    ),
  })
);

vi.mock("../../../../../utils/Constants", () => ({
  getLanguageClass: vi.fn(() => "tibetan"),
}));

vi.mock("react-icons/io5", () => ({
  IoClose: () => <span data-testid="close-icon">Close</span>,
}));

vi.mock("./SheetSegmentModal.scss", () => ({}));
import { useQuery } from "@tanstack/react-query";

describe("SheetSegmentModal", () => {
  const defaultProps = {
    onClose: mockOnClose,
    onSegment: mockOnSegment,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose.mockClear();
    mockOnSegment.mockClear();
  });

  test("renders modal with header and search input", () => {
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByText("Search Segment")).toBeInTheDocument();
    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search Segments...")
    ).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", () => {
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const closeButton = screen.getByTestId("close-icon").closest("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("displays segments when data is available", () => {
    useQuery.mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    expect(screen.getByText("Sample Text")).toBeInTheDocument();
    expect(screen.getByAltText("source icon")).toBeInTheDocument();
    expect(screen.getByText("Sample segment content")).toBeInTheDocument();
  });

  test("calls onSegment when segment is clicked", () => {
    useQuery.mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentItem = screen
      .getByText("Sample segment content")
      .closest(".segment-item");
    fireEvent.click(segmentItem);

    expect(mockOnSegment).toHaveBeenCalledWith({
      segment_id: "seg1",
      content: "<p>Sample segment content</p>",
    });
  });

  test("updates search filter when typing in search input", () => {
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const searchInput = screen.getByTestId("search-input");

    fireEvent.change(searchInput, { target: { value: "test search" } });
    expect(searchInput.value).toBe("test search");
  });

  test("fetchSegments makes correct API call", async () => {
    const mockResponse = { data: { sources: [], total: 0 } };
    const mockAxios = vi.mocked(axiosInstance);
    mockAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchSegments("test query", 10, 0);

    expect(mockAxios.get).toHaveBeenCalledWith(
      "/api/v1/search?query=test query&search_type=SOURCE",
      { params: { limit: 10, skip: 0 } }
    );
    expect(result).toEqual(mockResponse.data);
  });

  test("calls onSegment when segment is activated with Enter key", () => {
    useQuery.mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentItem = screen
      .getByText("Sample segment content")
      .closest(".segment-item");
    fireEvent.keyDown(segmentItem, { key: "Enter" });

    expect(mockOnSegment).toHaveBeenCalledWith({
      segment_id: "seg1",
      content: "<p>Sample segment content</p>",
    });
  });

  test("calls onSegment when segment is activated with Space key", () => {
    useQuery.mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentItem = screen
      .getByText("Sample segment content")
      .closest(".segment-item");
    fireEvent.keyDown(segmentItem, { key: " " });

    expect(mockOnSegment).toHaveBeenCalledWith({
      segment_id: "seg1",
      content: "<p>Sample segment content</p>",
    });
  });

  test("does not call onSegment for other key presses", () => {
    useQuery.mockReturnValue({
      data: mockSegmentData,
      isLoading: false,
      error: null,
    });

    render(<SheetSegmentModal {...defaultProps} />);

    const segmentItem = screen
      .getByText("Sample segment content")
      .closest(".segment-item");
    fireEvent.keyDown(segmentItem, { key: "Tab" });

    expect(mockOnSegment).not.toHaveBeenCalled();
  });
});