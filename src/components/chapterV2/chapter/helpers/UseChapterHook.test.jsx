import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import UseChapterHook from "./UseChapterHook.jsx";
import "@testing-library/jest-dom";

vi.mock("../../../../context/PanelContext.jsx", () => ({
  usePanelContext: () => ({
    isResourcesPanelOpen: false,
    openResourcesPanel: vi.fn(),
  }),
}));

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}));

vi.mock("../../utils/header/table-of-contents/TableOfContents.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="table-of-contents">TableOfContents</div>,
}));

vi.mock("../../utils/resources/Resources.jsx", () => ({
  __esModule: true,
  default: ({ segmentId }) => <div data-testid="resources">Resources {segmentId}</div>,
}));

vi.mock("../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang) => `lang-${lang}`,
}));

const defaultProps = {
  showTableOfContents: true,
  content: {
    sections: [
      {
        title: "Section 1",
        segments: [
          {
            segment_id: "seg1",
            segment_number: 1,
            content: "<span>Segment 1 Content</span>",
            translation: {
              language: "en",
              content: "<span>Translation 1</span>",
            },
          },
        ],
        sections: [],
      },
    ],
  },
  language: "bo",
  addChapter: vi.fn(),
  currentChapter: {},
  setVersionId: vi.fn(),
  infiniteQuery: {
    hasNextPage: false,
    hasPreviousPage: false,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    fetchNextPage: vi.fn(),
    fetchPreviousPage: vi.fn(),
  },
};

const setup = (props = {}) => {
  return render(<UseChapterHook {...defaultProps} {...props} />);
};

describe("UseChapterHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders main containers", () => {
    setup();
    expect(document.querySelector(".use-chapter-hook-container")).toBeInTheDocument();
    expect(document.querySelector(".main-content")).toBeInTheDocument();
  });

  test("renders TableOfContents when showTableOfContents is true", () => {
    setup({ showTableOfContents: true });
    expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
  });

  test("does not render TableOfContents when showTableOfContents is false", () => {
    setup({ showTableOfContents: false });
    expect(screen.queryByTestId("table-of-contents")).not.toBeInTheDocument();
  });

  test("renders section and segment content", () => {
    setup();
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Segment 1 Content", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Translation 1", { selector: "span" })).toBeInTheDocument();
  });

  test("renders loading indicators when fetching", () => {
    setup({
      infiniteQuery: {
        ...defaultProps.infiniteQuery,
        isFetchingNextPage: true,
      },
    });
    expect(screen.getByText("Loading more content...")).toBeInTheDocument();

    setup({
      infiniteQuery: {
        ...defaultProps.infiniteQuery,
        isFetchingPreviousPage: true,
      },
    });
    expect(screen.getByText("Loading previous content...")).toBeInTheDocument();
  });

  test("renders scroll sentinels when hasNextPage/hasPreviousPage", () => {
    const { container: nextPageContainer } = setup({
      infiniteQuery: {
        ...defaultProps.infiniteQuery,
        hasNextPage: true,
      },
    });
    expect(nextPageContainer.querySelector(".scroll-sentinel")).toBeInTheDocument();

    const { container: prevPageContainer } = setup({
      infiniteQuery: {
        ...defaultProps.infiniteQuery,
        hasPreviousPage: true,
      },
    });
    expect(prevPageContainer.querySelector(".scroll-sentinel-top")).toBeInTheDocument();
  });


  test("handles empty content gracefully", () => {
    setup({ content: { sections: [] } });
    expect(document.querySelector(".outmost-container")).not.toBeInTheDocument();
  });

  test("footnote marker click toggles active class", () => {
    setup({
      content: {
        sections: [
          {
            title: "Section 1",
            segments: [
              {
                segment_id: "seg1",
                segment_number: 1,
                content: '<span><span class="footnote-marker">*</span><span class="footnote">Footnote</span></span>',
                translation: null,
              },
            ],
            sections: [],
          },
        ],
      },
    });
    const marker = document.querySelector(".footnote-marker");
    const footnote = document.querySelector(".footnote");
    expect(marker).toBeInTheDocument();
    expect(footnote).toBeInTheDocument();
    expect(footnote.classList.contains("active")).toBe(false);
    fireEvent.click(marker);
    expect(footnote.classList.contains("active")).toBe(true);
  });
});
