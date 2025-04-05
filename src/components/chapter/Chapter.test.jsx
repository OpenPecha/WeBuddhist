import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Chapters, { fetchTextDetails } from "./Chapter.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../utils/Constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  getLanguageClass: (language) => {
    switch (language) {
      case "bo":
        return "bo-text";
      case "en":
        return "en-text";
      case "sa":
        return "bo-text";
      default:
        return "en-text";
    }
  },
  menuItems: [
    { label: "common.share", icon: vi.fn() },
    { label: "menu.item2", icon: vi.fn() }
  ],
  sourceTranslationOptionsMapper :{
    "source":"SOURCE",
    "translation":"TRANSLATION",
    "source_translation":"SOURCE_TRANSLATION"
  }
}));

// Mock useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      state: {
        chapterInformation: {
          contentId: "content123",
          versionId: "version123"
        }
      }
    }),
    useSearchParams: () => [
      {
        get: (param) => {
          if (param === 'text_id') return 'test123';
          if (param === 'content_id') return 'content123';
          if (param === 'version_id') return 'version123';
          return null;
        }
      },
      vi.fn()
    ]
  };
});

describe("Chapter Component", () => {
  const queryClient = new QueryClient();
  const mockTextData = {
    text: {
      title: "Test Title",
      id: "test123"
    }
  };

  const mockSideTextData = {
    text_infos: {
      short_url: "https://test.com/share",
      translations: 2,
      sheets: 3,
      web_pages: 1,
      related_texts: [
        { title: "Related Text 1", count: 2 },
        { title: "Related Text 2", count: 1 }
      ]
    }
  };

  const mockTextDetailsData = {
    contents: [
      {
        id: "1",
        segments: [
          {
            id: "seg1",
            title: "Section 1",
            segments: [
              {
                id: "subseg1",
                segment_id: "1",
                segment_number: "1.1",
                content: "<p>Test content 1</p>",
                translation: {
                  content:"yo"
                }
              }
            ]
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "textDetail") {
        return { data: mockTextData, isLoading: false };
      } else if (queryKey[0] === "texts") {
        return { data: mockSideTextData, isLoading: false };
      } else if (queryKey[0] === "textsDetails") {
        return { data: mockTextDetailsData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo-IN");
    // Mock localStorage.getItem for chapters
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === 'chapters') {
        return JSON.stringify([{
          contentId: "content123",
          versionId: "version123"
        }]);
      }
      return "bo-IN";
    });
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <Chapters />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders Chapter component with header", () => {
    setup();
    const headerOverlay = document.querySelector(".header-overlay");
    expect(headerOverlay).toBeInTheDocument();
  });

  test("toggles bookmark state", () => {
    setup();
    const bookmarkButton = document.querySelector(".bookmark-button");
    expect(bookmarkButton).toBeInTheDocument();
    
    fireEvent.click(bookmarkButton);
    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  test("renders side panel and toggles visibility", async () => {
    setup();
    await act(async () => {});
    
    const textSegment = document.querySelector(".text-segment");
    expect(textSegment).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(textSegment);
    });
    
    const rightPanel = document.querySelector(".right-panel.show");
    expect(rightPanel).toBeInTheDocument();
    
    const closeIcon = document.querySelector(".close-icon");
    expect(closeIcon).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(closeIcon);
    });
    
    expect(document.querySelector(".right-panel.show")).not.toBeInTheDocument();
  });

  test("renders text content with segments", () => {
    setup();
    const segments = document.querySelectorAll(".text-segment");
    expect(segments.length).toBeGreaterThan(0);
    
    const segmentContent = document.querySelector(".segment");
    expect(segmentContent).toHaveTextContent("Test content 1");
  });

  test("handles infinite scroll", async () => {
    setup();
    await act(async () => {});
    
    const container = document.querySelector(".tibetan-text-container");
    expect(container).toBeInTheDocument();
    
    Object.defineProperty(container, 'scrollTop', { value: 500, configurable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 250, configurable: true });
    
    await act(async () => {
      fireEvent.scroll(container);
    });
    
    const spinner = document.querySelector(".spinner-border");
    expect(spinner).toBeInTheDocument();
  });

  test("fetchTextDetails makes correct API call", async () => {
    const textId = "test123";
    const contentId = "content123";
    const versionId = "version123";
    const mockTextDetailsData = { someKey: "someValue" };
    axiosInstance.post.mockResolvedValueOnce({ data: mockTextDetailsData });
    const result = await fetchTextDetails(textId, contentId, versionId, 0, 10);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      `/api/v1/texts/${textId}/details`,
      {
        content_id: contentId,
        version_id: versionId,
        limit: 10,
        skip: 0
      } 
    );
    expect(result).toEqual(mockTextDetailsData);
  });

  test("handles null text details data gracefully", async () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    
    setup();
    await act(async () => {});
    
    const container = document.querySelector(".tibetan-text-container");
    expect(container).toBeInTheDocument();
    expect(document.querySelector(".segment")).not.toBeInTheDocument();
  });

  test("renders content correctly with segments", async () => {
    setup();
    await act(async () => {});
    const segmentContainer = document.querySelector(".segment");
    expect(segmentContainer).toBeInTheDocument();
    expect(segmentContainer.innerHTML).toContain("Test content 1");
    expect(segmentContainer.innerHTML).toContain("yo");
  });

  test("updates selected segment when segment is clicked", async () => {
    setup();

    await act(async () => {});
    
    const segment = document.querySelector(".text-segment");
    expect(segment).toBeInTheDocument();
    
    
    await act(async () => {
      fireEvent.click(segment);
    });
    
    
    const rightPanel = document.querySelector(".right-panel.show");
    expect(rightPanel).toBeInTheDocument();
    
 
    const panelContent = document.querySelector(".panel-content");
    expect(panelContent).toBeInTheDocument();
  });

  test("toggles bookmark when bookmark button is clicked", async () => {
    setup();
    // Wait for component to render
    await act(async () => {});
    
    const bookmarkButton = document.querySelector(".bookmark-button");
    expect(bookmarkButton).toBeInTheDocument();
    
    const initialIcon = document.querySelector(".bookmark-button svg");
    expect(initialIcon).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(bookmarkButton);
    });
    
    const updatedIcon = document.querySelector(".bookmark-button svg");
    expect(updatedIcon).toBeInTheDocument();
    expect(document.querySelector(".bookmark-button")).toBeInTheDocument();
  });
});
