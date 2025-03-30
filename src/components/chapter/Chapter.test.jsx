import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Chapter, { fetchSidePanelData, fetchTextDetails } from "./Chapter.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../utils/Constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  menuItems: [
    { label: "common.share", icon: vi.fn() },
    { label: "menu.item2", icon: vi.fn() }
  ]
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
                content: "<p>Test content 1</p>"
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
    expect(document.querySelector(".header-overlay")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
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

  test("renders share view and handles copy functionality", async () => {
    setup();
    
    // Open side panel
    fireEvent.click(document.querySelector(".text-segment"));
    
    // Find and click share menu item
    const menuItems = document.querySelectorAll(".panel-content p");
    const shareItem = Array.from(menuItems).find(item => 
      item.textContent.includes("common.share")
    );
    fireEvent.click(shareItem);

    // Verify share view is shown
    expect(screen.getByText("text.share_link")).toBeInTheDocument();
    
    // Test copy functionality
    const mockClipboard = {
      writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    const copyButton = document.querySelector(".copy-button");
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://test.com/share");
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



  test("fetchTextsInfo makes correct API call", async () => {
    const textId = "test123";
    axiosInstance.get.mockResolvedValueOnce({ data: mockSideTextData });

    const result = await fetchSidePanelData(textId);

    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/texts/${textId}/infos`, {
      params: {
        language: "bo",
        text_id: textId
      }
    });
    expect(result).toEqual(mockSideTextData);
  });

  test("fetchTextDetails makes correct API call", async () => {
    const textId = "test123";
    const contentId = "content123";
    axiosInstance.get.mockResolvedValueOnce({ data: mockTextDetailsData });

    const result = await fetchTextDetails(textId, contentId, 0, 40);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/v1/texts/${textId}/contents/${contentId}/details?skip=0&limit=40`,
      {}
    );
    expect(result).toEqual(mockTextDetailsData);
  });


  test("renders related texts when available", () => {
    setup();
    const relatedTexts = document.querySelectorAll(".related-text-item");
    expect(relatedTexts).toHaveLength(2);
    expect(relatedTexts[0]).toHaveTextContent("Related Text 1 (2)");
    expect(relatedTexts[1]).toHaveTextContent("Related Text 2 (1)");
  });

  test("displays correct translation count", () => {
    setup();
    const translations = screen.getByText(/translations \(2\)/i);
    expect(translations).toBeInTheDocument();
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
});
