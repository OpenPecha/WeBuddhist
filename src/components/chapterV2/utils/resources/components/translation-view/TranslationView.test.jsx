import React from "react";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render} from "@testing-library/react";
import TranslationView, {fetchTranslationsData} from "./TranslationView.jsx";
import {vi} from "vitest";
import "@testing-library/jest-dom";
import {mockReactQuery, mockAxios, mockTolgee, mockUseAuth} from "../../../../../../test-utils/CommonMocks.js";

import axiosInstance from "../../../../../../config/axios-config.js";
import {PanelProvider} from "../../../../../../context/PanelContext.jsx";

mockAxios();
mockUseAuth();
mockReactQuery();
vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (language) => `lang-${language}`,
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

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

describe("TranslationView Component", () => {
  const queryClient = new QueryClient();
  const mockTranslationData = {
    translations: [
      { 
        language: "en", 
        content: "English translation content", 
        title: "English Title",
        source: "English Source",
        text_id: "text-123",
        segment_id: "test-segment-id"
      },
      { 
        language: "bo", 
        content: "Tibetan translation content", 
        title: "Tibetan Title",
        source: "Tibetan Source",
        text_id: "text-456",
        segment_id: "test-segment-id"
      },
      { 
        language: "en", 
        content: "Another English translation", 
        title: "Another English Title",
        source: "Another English Source",
        text_id: "text-789",
        segment_id: "test-segment-id"
      }
    ]
  };

  const mockProps = {
    segmentId: "test-segment-id",
    setIsTranslationView: vi.fn(),
    setVersionId: vi.fn(),
    addChapter: vi.fn(),
    currentChapter: { id: "chapter-1" }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    window.sessionStorage.getItem.mockReturnValue(null);
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTranslationData,
      isLoading: false,
    }));
  });

  const setup = (customProps = {}) => {
    const props = { ...mockProps, ...customProps };
    return render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider 
          fallback={"Loading tolgee..."} 
          tolgee={mockTolgee}
        >
          <PanelProvider>
            <TranslationView {...props} />
          </PanelProvider>
        </TolgeeProvider>
      </QueryClientProvider>
    );
  };

  test("renders TranslationView component", () => {
    setup();
    expect(document.querySelector(".translation-view")).toBeInTheDocument();
    expect(document.querySelector(".translation-content")).toBeInTheDocument();
    expect(document.querySelector(".translations-list")).toBeInTheDocument();
  });

  test("displays correct header title", () => {
    setup();
    
    const headerTitle = document.querySelector(".listtitle");
    expect(headerTitle).toBeInTheDocument();
    expect(headerTitle.textContent).toBe("connection_pannel.translations");
  });

  test("displays language groups correctly", () => {
    setup();
    
    const languageGroups = document.querySelectorAll(".language-group");
    expect(languageGroups.length).toBe(2);
    
    const languageTitles = document.querySelectorAll(".language-title");
    expect(languageTitles[0].textContent).toContain("language.english");
    expect(languageTitles[1].textContent).toContain("language.tibetan");
    
    expect(languageTitles[0].textContent).toContain("(2)");
    expect(languageTitles[1].textContent).toContain("(1)");
  });

  test("handles close button click", () => {
    setup();
    
    const closeButton = document.querySelector(".close-icon");
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockProps.setIsTranslationView).toHaveBeenCalledWith("main");
  });

  test("toggles translation expansion correctly", () => {
    setup();
    
    const expandButtons = document.querySelectorAll(".expand-button");
    expect(expandButtons.length).toBe(3); 
    fireEvent.click(expandButtons[0]);

    const result = setExpandedCall({});
    expect(result).toEqual({ "en-0": true });
  });


  test("displays current selection status correctly", () => {
    window.sessionStorage.getItem.mockReturnValue("text-123");
    
    setup();
    
    const selectButtons = document.querySelectorAll(".select-items");
    expect(selectButtons[0].textContent).toBe("text.translation.current_selected");
    expect(selectButtons[1].textContent).toBe("common.select");
    expect(selectButtons[2].textContent).toBe("common.select");
  });

  test("fetchTranslationsData makes correct API call", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockTranslationData });
    
    const segmentId = "test-segment-id";
    const result = await fetchTranslationsData(segmentId);
    
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/segments/test-segment-id/translations", {
      params: {
        segment_id: "test-segment-id",
        skip: 0,
        limit: 10
      }
    });
    
    expect(result).toEqual(mockTranslationData);
  });

  test("fetchTranslationsData with custom skip and limit", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockTranslationData });
    
    const segmentId = "test-segment-id";
    const skip = 5;
    const limit = 20;
    
    await fetchTranslationsData(segmentId, skip, limit);
    
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/segments/test-segment-id/translations", {
      params: {
        segment_id: "test-segment-id",
        skip: 5,
        limit: 20
      }
    });
  });

  test("handles empty translations gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: { translations: [] },
      isLoading: false,
    }));
    
    setup();
    
    expect(document.querySelector(".translation-content")).toBeInTheDocument();
    expect(document.querySelector(".translations-list")).toBeInTheDocument();
    const languageGroups = document.querySelectorAll(".language-group");
    expect(languageGroups.length).toBe(0);
  });

  test("handles undefined translations data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: undefined,
      isLoading: false,
    }));
    
    setup();
    
    expect(document.querySelector(".translation-content")).toBeInTheDocument();
    expect(document.querySelector(".translations-list")).toBeInTheDocument();
    const languageGroups = document.querySelectorAll(".language-group");
    expect(languageGroups.length).toBe(0);
  });

  test("clicking on 'open text' button calls addChapter with correct parameters", () => {
    setup();
    
    const openTextButtons = document.querySelectorAll(".link-icons");
    expect(openTextButtons.length).toBe(3);
    
    fireEvent.click(openTextButtons[0]);
    
    expect(mockProps.addChapter).toHaveBeenCalledWith(
      { 
        textId: "text-123", 
        segmentId: "test-segment-id"
      },
      mockProps.currentChapter
    );
  });

  test("renders translation content with correct language classes", () => {
    setup();
    
    const translationContents = document.querySelectorAll(".translation-content");
    expect(translationContents.length).toBeGreaterThan(0);
    
    const englishElements = document.querySelectorAll(".lang-en");
    const tibetanElements = document.querySelectorAll(".lang-bo");
    
    expect(englishElements.length).toBeGreaterThan(0);
    expect(tibetanElements.length).toBeGreaterThan(0);
  });


  test("shows expand/collapse buttons only for translations with content", () => {
    const dataWithEmptyContent = {
      translations: [
        { 
          language: "en", 
          content: "",
          title: "Empty Title",
          text_id: "text-empty",
          segment_id: "test-segment-id"
        },
        { 
          language: "bo", 
          content: "Some content", 
          title: "With Content",
          text_id: "text-with-content",
          segment_id: "test-segment-id"
        }
      ]
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: dataWithEmptyContent,
      isLoading: false,
    }));

    setup();
    
    const expandButtons = document.querySelectorAll(".expand-button");
    expect(expandButtons.length).toBe(1);
  });

  test("handles addChapter prop being undefined", () => {
    setup({ addChapter: undefined });
    
    const openTextButtons = document.querySelectorAll(".link-icons");
    expect(openTextButtons.length).toBe(0); 
  });
});
