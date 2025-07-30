import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import TableOfContents from "./TableOfContents.jsx";
import "@testing-library/jest-dom";
import { useQuery } from "react-query";
import { fetchTableOfContents } from "../../../../texts/Texts.jsx";

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (key) => key,
  }),
}));

vi.mock("react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang) => `lang-${lang}`,
  getEarlyReturn: vi.fn(),
}));

vi.mock("../../../../texts/Texts.jsx", () => ({
  fetchTableOfContents: vi.fn(),
}));

const mockQueryData = {
  empty: {
    data: { contents: [] },
    error: null,
    isLoading: false,
  },
  withSections: {
    data: {
      contents: [
        {
          id: "content1",
          sections: [
            {
              id: "section1",
              title: "Test Section",
              sections: [],
              segments: [{ segment_id: "segment1" }],
            },
          ],
        },
      ],
      text_detail: { language: "bo" },
    },
    error: null,
    isLoading: false,
  },
};

const defaultProps = {
  textId: "text123",
  showTableOfContents: true,
  currentSectionId: "section1",
  onSegmentSelect: vi.fn(),
};

const setup = (props = {}) => {
  return render(<TableOfContents {...defaultProps} {...props} />);
};

describe("TableOfContents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sections when data is available", () => {
    Element.prototype.scrollIntoView = vi.fn();
    useQuery.mockReturnValue(mockQueryData.withSections);
    setup();
    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  test("shows no content message when data is empty", () => {
    useQuery.mockReturnValue(mockQueryData.empty);
    setup();
    expect(screen.getByText("No content found")).toBeInTheDocument();
  });

  test("calls fetchTableOfContents with correct parameters", () => {
    useQuery.mockImplementation((queryKey, queryFn, options) => {
      if (options?.enabled) {
        queryFn();
      }
      return mockQueryData.empty;
    });
    
    setup({ textId: "text-123" });
    expect(fetchTableOfContents).toHaveBeenCalledWith("text-123", 0, 1000);
  });

  test("calls onSegmentSelect when section title is clicked", () => {
    const mockOnSegmentSelect = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    useQuery.mockReturnValue(mockQueryData.withSections);
    
    setup({ onSegmentSelect: mockOnSegmentSelect });
    
    const sectionTitle = screen.getByText("Test Section");
    fireEvent.click(sectionTitle);
    
    expect(mockOnSegmentSelect).toHaveBeenCalledWith("segment1");
  });
});

