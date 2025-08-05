import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ViewSelector, { VIEW_MODES } from "./ViewSelector.jsx";

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

  const setup = (viewMode = VIEW_MODES.SOURCE) => {
    return render(
      <ViewSelector
        setShowViewSelector={setShowViewSelector}
        setViewMode={setViewMode}
        viewMode={viewMode}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the options container and close icon", () => {
    setup();
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveClass("view-selector-close-icon");
    expect(screen.getByText("text.reader_option_menu.source")).toBeInTheDocument();
    expect(screen.getByText("text.reader_option_menu.translation")).toBeInTheDocument();
    expect(screen.getByText("text.reader_option_menu.source_with_translation")).toBeInTheDocument();
  });

  test("renders all radio options with correct checked state", () => {
    setup(VIEW_MODES.TRANSLATIONS);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  test("calls setViewMode when a radio option is selected", () => {
    setup(VIEW_MODES.SOURCE);
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[1]);
    expect(setViewMode).toHaveBeenCalledWith(VIEW_MODES.TRANSLATIONS);
    fireEvent.click(radios[2]);
    expect(setViewMode).toHaveBeenCalledWith(VIEW_MODES.SOURCE_AND_TRANSLATIONS);
  });

  test("calls setShowViewSelector(false) when close icon is clicked", () => {
    setup();
    const closeBtn = screen.getByRole("button");
    fireEvent.click(closeBtn);
    expect(setShowViewSelector).toHaveBeenCalledWith(false);
  });

  test("radio options are accessible", () => {
    setup();
    const radios = screen.getAllByRole("radio");
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute("type", "radio");
      expect(radio).toHaveAttribute("name", "view-mode");
    });
  });
});