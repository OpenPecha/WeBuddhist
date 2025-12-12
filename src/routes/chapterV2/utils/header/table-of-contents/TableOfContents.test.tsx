import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, beforeEach, test, expect, type Mock } from "vitest";
import TableOfContents from "./TableOfContents.js";
import "@testing-library/jest-dom";
import { useQuery } from "react-query";
import { fetchTableOfContents } from "../../../../texts/Texts.js";

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang: string) => `lang-${lang}`,
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
    (useQuery as Mock).mockReturnValue(mockQueryData.withSections);
    setup();
    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  test("shows no content message when data is empty", () => {
    (useQuery as Mock).mockReturnValue(mockQueryData.empty);
    setup();
    expect(screen.getByText("No content found")).toBeInTheDocument();
  });

  test("calls onSegmentSelect when section title is clicked", () => {
    const mockOnSegmentSelect = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    (useQuery as Mock).mockReturnValue(mockQueryData.withSections);

    setup({ onSegmentSelect: mockOnSegmentSelect });

    const sectionTitle = screen.getByText("Test Section");
    fireEvent.click(sectionTitle);

    expect(mockOnSegmentSelect).toHaveBeenCalledWith("segment1");
  });
});
