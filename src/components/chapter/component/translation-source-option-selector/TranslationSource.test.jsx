import { vi } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { mockTolgee } from "../../../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";
import "@testing-library/jest-dom";

const mockContext = {
  isResourcesPanelOpen: true,
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

import TranslationSource from "./TranslationSource";

vi.mock("../../../../utils/constants.js", () => ({
  sourceTranslationOptionsMapper: {
    "source": "SOURCE",
    "translation": "TRANSLATION",
    "source_translation": "SOURCE_TRANSLATION"
  }
}));

describe("TranslationSource", () => {
  const mockOnClose = vi.fn();
  const mockOnOptionChange = vi.fn();
  
  const defaultProps = {
    selectedOption: "SOURCE",
    onOptionChange: mockOnOptionChange,
    onClose: mockOnClose
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const setup = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
      <TolgeeProvider 
        fallback={"Loading tolgee..."} 
        tolgee={mockTolgee}
      >
        <TranslationSource {...mergedProps} />
      </TolgeeProvider>
    );
  };

  test("renders options correctly with the selected option checked", () => {
    setup(); 
    const radioButtons = screen.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);
    const sourceOption = radioButtons.find(radio => radio.id === "SOURCE");
    expect(sourceOption).toBeChecked();
    const translationOption = radioButtons.find(radio => radio.id === "TRANSLATION");
    expect(translationOption).not.toBeChecked();
  });

  test("calls onOptionChange and onClose when an option is selected", () => {
    setup({ hasTranslation: true });
    const radioButtons = screen.getAllByRole("radio");
    const translationOption = radioButtons.find(radio => radio.id === "TRANSLATION");
    fireEvent.click(translationOption);
    expect(mockOnOptionChange).toHaveBeenCalledWith("TRANSLATION");
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("calls onClose when clicked outside the component", () => {
    const map = {};
    document.addEventListener = vi.fn((event, callback) => {
      map[event] = callback;
    });
    
    setup();
    const mockEvent = {
      target: document.body 
    };
    map.mousedown(mockEvent);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("calls closeResourcesPanel when component mounts", () => {
    setup();
    expect(mockContext.closeResourcesPanel).toHaveBeenCalled();
  });
});

  
  