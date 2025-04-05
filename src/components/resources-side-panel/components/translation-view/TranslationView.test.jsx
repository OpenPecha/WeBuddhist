import React from "react";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import TranslationView, {fetchtranslationdata} from "./TranslationView.jsx";
import {vi} from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../../../config/axios-config.js";

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

vi.mock("../../../../utils/Constants.js", () => ({
  getLanguageClass: (language) => `lang-${language}`,
}));

describe("TranslationView Component", () => {
  const queryClient = new QueryClient();
  const mockTranslationData = {
    translations: [
      { 
        language: "en", 
        content: "English translation content", 
        title: "English Title",
        source: "English Source",
        text_id: "text-123"
      },
      { 
        language: "bo", 
        content: "Tibetan translation content", 
        title: "Tibetan Title",
        source: "Tibetan Source",
        text_id: "text-456"
      },
      { 
        language: "en", 
        content: "Another English translation", 
        title: "Another English Title",
        source: "Another English Source",
        text_id: "text-789"
      }
    ]
  };

  const mockProps = {
    segmentId: "test-segment-id",
    setIsTranslationView: vi.fn(),
    expandedTranslations: {},
    setExpandedTranslations: vi.fn(),
    setVersionId: vi.fn(),
    versionId: "test",
    addChapter: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTranslationData,
      isLoading: false,
    }));
  });

  const setup = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider 
          fallback={"Loading tolgee..."} 
          tolgee={mockTolgee}
        >
          <TranslationView {...mockProps} />
        </TolgeeProvider>
      </QueryClientProvider>
    );
  };

  test("renders TranslationView component", () => {
    setup();
    expect(document.querySelector(".translation-content")).toBeInTheDocument();
    expect(document.querySelector(".translations-list")).toBeInTheDocument();
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
    expect(mockProps.setIsTranslationView).toHaveBeenCalledWith(false);
  });

  test("toggles translation expansion correctly", () => {
    setup();
    
    const expandButtons = document.querySelectorAll(".expand-button");
    expect(expandButtons.length).toBe(3); 
    fireEvent.click(expandButtons[0]);
    
   
    expect(mockProps.setExpandedTranslations).toHaveBeenCalled();
    const setExpandedCall = mockProps.setExpandedTranslations.mock.calls[0][0];
    

    const result = setExpandedCall({});
    expect(result).toEqual({ "en-0": true });
  });

  test("handles version selection", () => {
    setup();
    
    const selectButtons = document.querySelectorAll(".selectss");
    expect(selectButtons.length).toBe(3); 
    
    fireEvent.click(selectButtons[1]);
    
    expect(mockProps.setVersionId).toHaveBeenCalledWith("test");
  });

  test("displays current selection status correctly", () => {
    setup();
    
    const selectButtons = document.querySelectorAll(".selectss");
    expect(selectButtons[0].textContent).toBe("common.select");
    expect(selectButtons[1].textContent).toBe("common.select");
    expect(selectButtons[2].textContent).toBe("common.select");
  });

  test("fetchtranslationdata makes correct API call", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockTranslationData });
    
    const segmentId = "test-segment-id";
    const result = await fetchtranslationdata(segmentId);
    
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/segments/test-segment-id/translations", {
      params: {
        segment_id: "test-segment-id",
        skip: 0,
        limit: 10
      }
    });
    
    expect(result).toEqual(mockTranslationData);
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
});
