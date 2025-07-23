import React from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import * as reactQuery from "@tanstack/react-query";
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

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../../../utils/constants.js", () => ({
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
          <PanelProvider>
            <TranslationView {...mockProps} />
          </PanelProvider>
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
    expect(mockProps.setIsTranslationView).toHaveBeenCalledWith("main");
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
    // Mock the implementation to ensure we know exactly what's being rendered
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: {
        translations: [
          { language: "bo", text_id: "text-456", segment_id: "test-segment-id", content: "content" }
        ]
      },
      isLoading: false,
    }));
    
    const { container } = setup();
    
    // Find the select button for the Tibetan translation
    const selectButton = container.querySelector(".selectss");
    expect(selectButton).toBeInTheDocument();
    
    // Click the select button
    fireEvent.click(selectButton);
    
    // Verify setVersionId was called with the correct text_id
    expect(mockProps.setVersionId).toHaveBeenCalledWith("text-456");
  });

  test("displays current selection status correctly", () => {
    // Set up with a specific versionId that matches one of our translations
    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider 
          fallback={"Loading tolgee..."} 
          tolgee={mockTolgee}
        >
          <PanelProvider>
            <TranslationView {...mockProps} versionId="text-123" />
          </PanelProvider>
        </TolgeeProvider>
      </QueryClientProvider>
    );
    
    const selectButtons = document.querySelectorAll(".selectss");
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

  test("clicking on 'open text' button calls addChapter with correct parameters", () => {
    setup();
    
    const openTextButtons = document.querySelectorAll(".linkicons");
    expect(openTextButtons.length).toBe(3);
    
    fireEvent.click(openTextButtons[0]);
    
    expect(mockProps.addChapter).toHaveBeenCalledWith({
      contentId: "",
      versionId: "",
      textId: "text-123",
      segmentId: "test-segment-id",
      contentIndex: 0
    });
  });
});
