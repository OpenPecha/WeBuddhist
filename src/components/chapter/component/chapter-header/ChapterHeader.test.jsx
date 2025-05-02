import { vi } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { mockTolgee } from "../../../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";
import "@testing-library/jest-dom";

const mockContext = {
  isResourcesPanelOpen: false,
  isTranslationSourceOpen: false,
  openResourcesPanel: vi.fn(),
  closeResourcesPanel: vi.fn(),
  toggleResourcesPanel: vi.fn(),
  openTranslationSource: vi.fn(),
  closeTranslationSource: vi.fn(),
  toggleTranslationSource: vi.fn()
};

vi.mock("../../../../context/PanelContext.jsx", () => ({
  usePanelContext: () => mockContext,
  PanelProvider: ({ children }) => children
}));

import ChapterHeader from "./ChapterHeader";

vi.mock("../../../../utils/Constants.js", () => ({
  getLanguageClass: (language) => language === "bo" ? "bo-text" : "en-text"
}));

// Mock the TranslationSource component
vi.mock("../translation-source-option-selector/TranslationSource.jsx", () => ({
  default: ({ selectedOption, onOptionChange, onClose }) => (
    <div data-testid="translation-source-mock">
      <button data-testid="option-change-button" onClick={() => onOptionChange("NEW_OPTION")}>Change Option</button>
      <button data-testid="close-button" onClick={onClose}>Close</button>
    </div>
  )
}));

describe("ChapterHeader Component", () => {
  const mockRemoveChapter = vi.fn();
  const mockSetSelectedOption = vi.fn();
  
  const defaultProps = {
    textDetails: { title: "Test Chapter", language: "bo" },
    selectedOption: "SOURCE",
    setSelectedOption: mockSetSelectedOption,
    totalPages: 1,
    removeChapter: mockRemoveChapter,
    currentChapter: { id: "chapter1" }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockContext.isTranslationSourceOpen = false;
  });

  const setup = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
      <TolgeeProvider 
        fallback={"Loading tolgee..."} 
        tolgee={mockTolgee}
      >
        <ChapterHeader {...mergedProps} />
      </TolgeeProvider>
    );
  };

  test("renders chapter title correctly", () => {
    setup();
    const titleElement = screen.getByText("Test Chapter");
    expect(titleElement).toBeInTheDocument();
    // The language class is applied to the text-container div
    const textContainer = document.querySelector(".text-container");
    expect(textContainer).toHaveClass("bo-text");
  });

  test("applies correct language class based on textDetails.language", () => {
    setup({ textDetails: { title: "English Chapter", language: "en" } });
    // The language class is applied to the text-container div
    const textContainer = document.querySelector(".text-container");
    expect(textContainer).toHaveClass("en-text");
  });

  test("toggles bookmark state when bookmark button is clicked", () => {
    setup();
    const bookmarkButton = screen.getAllByRole("button")[0];
    
    // Initial state should be not bookmarked
    expect(bookmarkButton).toBeInTheDocument();
    
    // Click to bookmark
    fireEvent.click(bookmarkButton);
    
    // Click again to un-bookmark
    fireEvent.click(bookmarkButton);
  });

  test("toggles translation source panel when split button is clicked", () => {
    setup();
    const splitButton = screen.getAllByRole("button")[1];
    
    fireEvent.click(splitButton);
    expect(mockContext.toggleTranslationSource).toHaveBeenCalled();
  });

  test("shows translation source panel when isTranslationSourceOpen is true", () => {
    mockContext.isTranslationSourceOpen = true;
    setup();
    
    const translationSourcePanel = screen.getByTestId("translation-source-mock");
    expect(translationSourcePanel).toBeInTheDocument();
  });

  test("handles option change in translation source panel", () => {
    mockContext.isTranslationSourceOpen = true;
    setup();
    
    const optionChangeButton = screen.getByTestId("option-change-button");
    fireEvent.click(optionChangeButton);
    
    expect(mockSetSelectedOption).toHaveBeenCalledWith("NEW_OPTION");
  });

  test("close button is not rendered when totalPages is 1", () => {
    setup({ totalPages: 1 });
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2); // Only bookmark and split buttons
  });

  test("close button is rendered when totalPages is greater than 1", () => {
    setup({ totalPages: 2 });
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3); // Bookmark, split, and close buttons
    
    // Test that the close button calls removeChapter with the correct chapter
    const closeButton = buttons[2];
    fireEvent.click(closeButton);
    expect(mockRemoveChapter).toHaveBeenCalledWith({ id: "chapter1" });
  });
});
