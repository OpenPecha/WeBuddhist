import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import TableOfContents from "./TableOfContents.jsx";
import { mockTolgee } from "../../../../../test-utils/CommonMocks.js";
import axiosInstance from "../../../../../config/axios-config.js";
import * as reactQuery from "react-query";

const mockNavigateToSection = vi.fn();
const mockToggleSection = vi.fn();

vi.mock("../../../chapter/helpers/useTOCHooks.jsx", () => ({
  useSectionHierarchy: () => ({
    sectionHierarchyState: { "section-1": true },
    setSectionHierarchyState: vi.fn(),
    toggleSection: mockToggleSection,
  }),
  useActiveSection: vi.fn(),
  useTOCScrollSync: () => ({
    panelRef: { current: null },
  }),
  usePanelNavigation: () => ({
    navigateToSection: mockNavigateToSection,
  }),
}));

vi.mock("react-icons/fi", () => ({
  FiChevronDown: () => <div data-testid="chevron-down" />,
  FiChevronRight: () => <div data-testid="chevron-right" />,
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

vi.mock("../../../../../config/axios-config.js", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../../../../utils/constants.js", () => ({
  LANGUAGE: "language",
}));

vi.mock("../../../../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: vi.fn(() => "bo"),
}));

const mockTocData = {
  contents: [
    {
      id: "content-1",
      text_id: "text-1",
      sections: [
        {
          id: "section-1",
          title: "Section 1",
          segments: [
            {
              segment_id: "segment-1",
              segment_number: 1,
              content: "Sample content for segment 1",
            },
          ],
          sections: [
            {
              id: "subsection-1-1",
              title: "Subsection 1.1",
              segments: [
                {
                  segment_id: "segment-1-1",
                  segment_number: 1,
                  content: "Sample content for subsection 1.1",
                },
              ],
              sections: []
            }
          ]
        },
        {
          id: "section-2",
          title: "Section 2",
          segments: [
            {
              segment_id: "segment-2",
              segment_number: 2,
              content: "Sample content for segment 2",
            },
          ],
          sections: []
        }
      ],
    },
  ],
};

const mockContentsData = {
  pages: [
    {
      content: {
        sections: [
          {
            id: "section-3",
            title: "Section 3",
            segments: [
              {
                segment_id: "segment-3",
                segment_number: 3,
                content: "Content from infinite scroll",
              },
            ],
          },
        ],
      },
    },
  ],
  loadMoreContent: vi.fn(),
  hasMoreContent: true,
  isFetchingNextPage: false,
  fetchContentBySegmentId: vi.fn(),
};

const defaultProps = {
  textId: "text-1",
  activeSectionId: "section-1",
  contentsData: mockContentsData,
  show: true,
};

const setup = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const finalProps = { ...defaultProps, ...props };

  return render(
    <QueryClientProvider client={queryClient}>
      <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
        <TableOfContents {...finalProps} />
      </TolgeeProvider>
    </QueryClientProvider>
  );
};

describe("TableOfContents Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
    data: null,
    isLoading: false,
    error: null,
  }));
  });

  test("renders TableOfContents component with sections from tocData", () => {
    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: mockTocData,
      isLoading: false,
      error: null,
    });

    setup();

    expect(screen.getByText("text.table_of_contents")).toBeInTheDocument();
    expect(document.querySelector(".table-of-contents")).toHaveClass("show");

    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
    expect(screen.getByText("Subsection 1.1")).toBeInTheDocument();
  });

  test("handles section click navigation correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: mockTocData,
      isLoading: false,
      error: null,
    });

    setup();

    const section2 = screen.getByText("Section 2");
    fireEvent.click(section2);

    expect(mockNavigateToSection).toHaveBeenCalledWith("section-2", {
      updateUrl: true,
      scrollBehavior: "smooth",
      loadMoreContent: mockContentsData.loadMoreContent,
      hasMoreContent: mockContentsData.hasMoreContent,
      isFetchingNextPage: mockContentsData.isFetchingNextPage,
      fetchContentBySegmentId: mockContentsData.fetchContentBySegmentId,
    });
  });

  test("handles expandable section toggle correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: mockTocData,
      isLoading: false,
      error: null,
    });

    setup();

    const section1 = screen.getByText("Section 1");
    fireEvent.click(section1);

    expect(mockToggleSection).toHaveBeenCalledWith("section-1");
    expect(mockNavigateToSection).not.toHaveBeenCalled();
  });

  test("prioritizes tocData over contentsData and falls back correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: mockTocData,
      isLoading: false,
      error: null,
    });

    setup();

    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
    expect(screen.getByText("Subsection 1.1")).toBeInTheDocument();

    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    setup();
    expect(screen.getByText("Section 3")).toBeInTheDocument();

    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    setup({ contentsData: null });
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("renders segments when section is expanded", () => {
    vi.spyOn(reactQuery, "useQuery").mockReturnValue({
      data: mockTocData,
      isLoading: false,
      error: null,
    });

    setup();

    expect(screen.getByText("1. Sample content for segment 1...")).toBeInTheDocument();
  });

  test("fetches TOC data with correct parameters", () => {
    const mockAxios = vi.mocked(axiosInstance);
    mockAxios.get.mockResolvedValue({ data: mockTocData });

    let capturedFetchFunction;
      vi.spyOn(reactQuery, "useQuery").mockImplementation((key, fetchFn, options) => {
      capturedFetchFunction = fetchFn;
      return {
        data: mockTocData,
        isLoading: false,
        error: null,
      };
    });

    setup();

    if (capturedFetchFunction) {
      capturedFetchFunction("text-1");
    }

    expect(mockAxios.get).toHaveBeenCalledWith("/api/v1/texts/text-1/contents", {
      params: {
        language: "bo",
        limit: 1000,
        skip: 0
      }
    });
  });
});
