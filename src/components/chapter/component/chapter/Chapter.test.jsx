import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Chapter from "./Chapter.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { fetchTextDetails } from "./Chapter.jsx";
import axiosInstance from "../../../../config/axios-config.js";

vi.mock("../chapter-header/ChapterHeader.jsx", () => ({
  default: ({ selectedOption, setSelectedOption }) => (
    <div data-testid="chapter-header">
      <button onClick={() => setSelectedOption("translation")}>
        Toggle Translation
      </button>
      Current: {selectedOption}
    </div>
  ),
}));

vi.mock("../left-side-panel/LeftSidePanel.jsx", () => ({
  default: ({ activeSectionId, updateChapter }) => (
    <div data-testid="left-side-panel">
      Active Section: {activeSectionId}
      <button onClick={() => updateChapter({}, { sectionId: "test-section" })}>
        Update Chapter
      </button>
    </div>
  ),
}));

vi.mock("../../../resources/Resources.jsx", () => ({
  default: ({ segmentId }) => (
    <div data-testid="resources-panel">Resources for {segmentId}</div>
  ),
}));

const mockOpenResourcesPanel = vi.fn();
let mockIsResourcesPanelOpen = false;
const mockSetSearchParams = vi.fn();

vi.mock("../../../../context/PanelContext.jsx", () => ({
  usePanelContext: vi.fn().mockImplementation(() => ({
    isResourcesPanelOpen: mockIsResourcesPanelOpen,
    openResourcesPanel: mockOpenResourcesPanel,
    isLeftPanelOpen: true,
  })),
  PanelProvider: ({ children }) => children,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams("?text_id=123&contentIndex=0"), mockSetSearchParams],
  };
});

vi.mock("../../../../utils/Constants.js", () => ({
  getLanguageClass: () => "language-class",
  sourceTranslationOptionsMapper: {
    source: "source",
    translation: "translation",
    source_translation: "source_translation",
  },
  findAndScrollToSegment: vi.fn(),
  checkSectionsForTranslation: vi.fn().mockReturnValue(true),
}));

vi.mock("../../../../config/axios-config.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Chapter Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockTextDetails = {
    content: {
      id: "content-123",
      sections: [
        {
          id: "section-1",
          section_number: 1,
          title: "Section 1",
          segments: [
            {
              segment_id: "segment-1",
              segment_number: 1,
              content: "Test content",
              translation: {
                content: "Test translation",
              },
            },
          ],
          sections: [
            {
              id: "section-1-1",
              title: "Nested Section",
              segments: [],
            },
          ],
        },
      ],
    },
    text_detail: {
      language: "bo",
    },
    total: 10,
    current_section: 1,
  };

  const defaultProps = {
    addChapter: vi.fn(),
    removeChapter: vi.fn(),
    updateChapter: vi.fn(),
    currentChapter: {
      textId: "123",
      contentId: "",
      contentIndex: 0,
      versionId: "v1",
    },
    totalPages: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "chapter") {
        return {
          data: mockTextDetails,
          isLoading: false,
        };
      }
      return { data: null, isLoading: false };
    });
    axiosInstance.post.mockResolvedValue({ data: mockTextDetails });
    mockSetSearchParams.mockClear();
  });

  const setup = (props = {}) => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <Chapter {...defaultProps} {...props} />
        </QueryClientProvider>
      </Router>
    );
  };

  test("fetchTextDetails function makes correct API call", async () => {
    const result = await fetchTextDetails(
      "123",
      "content-1",
      "v1",
      0,
      10,
      "seg-1",
      "sec-1"
    );

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/v1/texts/123/details",
      {
        content_id: "content-1",
        version_id: "v1",
        segment_id: "seg-1",
        section_id: "sec-1",
        limit: 10,
        skip: 0,
      }
    );

    expect(result).toEqual(mockTextDetails);
  });

  test("renders chapter structure correctly", async () => {
    const { container } = setup();

    expect(screen.getByTestId("chapter-header")).toBeInTheDocument();
    expect(screen.getByTestId("left-side-panel")).toBeInTheDocument();
    expect(
      container.querySelector(".tibetan-text-container")
    ).toBeInTheDocument();
  });

  test("handles infinite scroll", async () => {
    const { container } = setup();

    await waitFor(() => {
      expect(screen.getByText("Section 1")).toBeInTheDocument();
    });

    const scrollContainer = container.querySelector(".tibetan-text-container");

    // Mock the scroll container properties
    Object.defineProperty(scrollContainer, "scrollHeight", {
      value: 1000,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(scrollContainer, "clientHeight", {
      value: 500,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(scrollContainer, "scrollTop", {
      value: 0,
      writable: true,
      configurable: true,
    });

    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;

    act(() => {
      scrollContainer.scrollTop = 500;
      fireEvent.scroll(scrollContainer);
    });

    await waitFor(() => {
      expect(reactQuery.useQuery).toHaveBeenCalled();
    });
  });

  test("handles segment click to open resources", async () => {
    // Set the mock state for this test
    mockIsResourcesPanelOpen = true;
    
    setup();

    await waitFor(() => {
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    const segment = screen.getByText("Test content").closest(".text-segment");
    fireEvent.click(segment);

    expect(mockOpenResourcesPanel).toHaveBeenCalled();
    expect(mockSetSearchParams).toHaveBeenCalled();
    
    // Reset the mock state after the test
    mockIsResourcesPanelOpen = false;
  });

  test("determines active section on scroll", async () => {
    const { container } = setup();

    await waitFor(() => {
      expect(screen.getByText("Section 1")).toBeInTheDocument();
    });

    const scrollContainer = container.querySelector(".tibetan-text-container");
    const section = container.querySelector('[data-section-id="section-1"]');

    if (section) {
      section.getBoundingClientRect = vi.fn(() => ({
        top: 0,
        bottom: 500,
        height: 500,
      }));
    }

    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
      configurable: true,
    });

    // Mock Element.prototype.getBoundingClientRect for all elements
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      bottom: 500,
      height: 500,
      left: 0,
      right: 500,
      width: 500,
    }));

    act(() => {
      fireEvent.scroll(scrollContainer);
    });

    await waitFor(
      () => {
        expect(
          screen.getByText(/Active Section: section-1/)
        ).toBeInTheDocument();
      },
      { timeout: 500 }
    );
    
    // Restore the original method
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
  
  test("handles content loading state", async () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce(() => ({
      data: null,
      isLoading: true
    }));
  
    setup();
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTextDetails,
      isLoading: false
    }));
    
    await waitFor(() => {
      expect(screen.getByText("Section 1")).toBeInTheDocument();
    });
  });

  test("handles scroll behavior", async () => {
    const { container } = setup();
    
    await waitFor(() => {
      expect(screen.getByText("Section 1")).toBeInTheDocument();
    });
    
    const scrollContainer = container.querySelector(".tibetan-text-container");
    
    Object.defineProperty(scrollContainer, "scrollHeight", {
      value: 1000,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(scrollContainer, "clientHeight", {
      value: 200,
      configurable: true,
      writable: true,
    });
    
    Object.defineProperty(scrollContainer, "scrollTop", {
      value: 800, 
      configurable: true,
      writable: true,
    });
    
    fireEvent.scroll(scrollContainer);
    Object.defineProperty(scrollContainer, "scrollTop", {
      value: 5, 
      configurable: true,
      writable: true,
    });
    const mockContents = [{
      section_number: 2, 
    }];
    fireEvent.scroll(scrollContainer);
  });
});
