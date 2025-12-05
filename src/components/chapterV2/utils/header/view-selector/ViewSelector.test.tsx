import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ViewSelector, { VIEW_MODES, LAYOUT_MODES } from "./ViewSelector.jsx";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

describe("ViewSelector Component", () => {
  const setShowViewSelector = vi.fn();
  const setViewMode = vi.fn();

  const setup = (viewMode = VIEW_MODES.SOURCE, layoutMode = LAYOUT_MODES.SEGMENTED) => {
    return render(
      <ViewSelector
        setShowViewSelector={setShowViewSelector}
        setViewMode={setViewMode}
        viewMode={viewMode}
        versionSelected={true}
        layoutMode={layoutMode}
        setLayoutMode={vi.fn()}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders options container and layout radios", () => {
    setup();
    expect(document.querySelector('.view-selector-options-container')).toBeInTheDocument();
    expect(screen.getByText('text.reader_option_menu.layout')).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  test("renders all radio options with correct checked state", () => {
    setup(VIEW_MODES.TRANSLATIONS);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
  });


  test("outside click closes the selector", () => {
    setup();
    fireEvent.mouseDown(document.body);
    expect(setShowViewSelector).toHaveBeenCalledWith(false);
  });

  test("radio options are accessible", () => {
    setup();
    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute("type", "radio");
      expect(radio).toHaveAttribute("name", "layout-mode");
    });
  });

  test("calls setLayoutMode when layout option is selected", () => {
    const setLayoutMode = vi.fn();
    
    render(
      <ViewSelector
        setShowViewSelector={vi.fn()}
        setViewMode={vi.fn()}
        viewMode={VIEW_MODES.SOURCE}
        versionSelected={true}
        layoutMode={LAYOUT_MODES.SEGMENTED}
        setLayoutMode={setLayoutMode}
      />
    );
    
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[0]);
    expect(setLayoutMode).toHaveBeenCalledWith(LAYOUT_MODES.PROSE);
  });
});