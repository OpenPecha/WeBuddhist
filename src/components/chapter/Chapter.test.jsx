import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Chapter, { fetchTextDetails } from "./Chapter.jsx";
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
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <Chapter />
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

  test("renders side panel and toggles visibility", () => {
    setup();
    const textSegment = document.querySelector(".text-segment");
    expect(textSegment).toBeInTheDocument();
    
    fireEvent.click(textSegment);
    expect(document.querySelector(".right-panel.show")).toBeInTheDocument();
    
    const closeButton = document.querySelector(".close-icon");
    fireEvent.click(closeButton);
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
    const container = document.querySelector(".tibetan-text-container");
    
    // Mock the scroll event
    Object.defineProperty(container, 'scrollTop', { value: 500 });
    Object.defineProperty(container, 'scrollHeight', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 250 });
    
    await act(async () => {
      fireEvent.scroll(container);
    });
    
    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
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

  test("handles null text details data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    
    setup();
    const container = document.querySelector(".tibetan-text-container");
    expect(container).toBeInTheDocument();
    expect(container).toBeEmpty();
  });

  test("renders content correctly with segments", () => {
    setup();
    const segment = screen.getByText("Test content 1");
    expect(segment).toBeInTheDocument();
    const translation = screen.getByText("yo");
    expect(translation).toBeInTheDocument();
  });

  test("updates selected segment when segment is clicked", () => {
    setup();
    const segment = document.querySelector(".text-segment");
    fireEvent.click(segment);
    expect(document.querySelector(".right-panel.show")).toBeInTheDocument();
  });

  test("shows translation source panel when button is clicked", () => {
    setup();
    
    const buttons = document.querySelectorAll(".bookmark-button");
    const translationSourceButton = buttons[1];
    fireEvent.click(translationSourceButton);
    
    const panel = document.querySelector(".translation-source-panel");
    expect(panel).toBeInTheDocument();
  });
});
