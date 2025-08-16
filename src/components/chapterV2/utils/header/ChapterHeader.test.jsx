import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import ChapterHeader from "./ChapterHeader.jsx";
import { PanelProvider } from "../../../../context/PanelContext.jsx";
import "@testing-library/jest-dom";

vi.mock("../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang) => lang ? `lang-${lang}` : "",
}));
vi.mock("./view-selector/ViewSelector.jsx", () => ({
  __esModule: true,
  default: (props) => <div data-testid="view-selector">ViewSelector</div>,
}));

describe("ChapterHeader Component", () => {
  const defaultProps = {
    viewMode: "single",
    setViewMode: vi.fn(),
    textdetail: { title: "Test Chapter", language: "bo" },
    showTableOfContents: false,
    setShowTableOfContents: vi.fn(),
    removeChapter: vi.fn(),
    currentChapter: 1,
    totalChapters: 2,
  };

  const setup = (props = {}) =>
    render(
      <PanelProvider>
        <ChapterHeader {...defaultProps} {...props} />
      </PanelProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders ChapterHeader container and title", () => {
    setup();
    expect(document.querySelector(".chapter-header-container")).toBeInTheDocument();
    expect(document.querySelector(".title-container")).toBeInTheDocument();
    expect(screen.getByText("Test Chapter")).toBeInTheDocument();
    expect(document.querySelector(".title-container")).toHaveClass("lang-bo");
  });

  test("renders table of contents open icon when showTableOfContents is false", () => {
    setup({ showTableOfContents: false });
    expect(document.querySelector(".toc-icon-container")).toBeInTheDocument();
    expect(document.querySelector(".toc-icon-container svg")).toBeInTheDocument();
  });

  test("renders table of contents close icon when showTableOfContents is true", () => {
    setup({ showTableOfContents: true });
    expect(document.querySelector(".toc-icon-container")).toBeInTheDocument();
    expect(document.querySelector(".toc-icon-container svg")).toBeInTheDocument();
  });

  test("calls setShowTableOfContents when toc icon is clicked", () => {
    const setShowTableOfContents = vi.fn();
    setup({ setShowTableOfContents });
    const tocIcon = document.querySelector(".toc-icon-container svg");
    fireEvent.click(tocIcon);
    expect(setShowTableOfContents).toHaveBeenCalled();
  });

  test("renders view selector icon and opens ViewSelector on click", () => {
    setup();
    const viewSelectorIcon = document.querySelector(".view-selector-icon-container svg");
    expect(viewSelectorIcon).toBeInTheDocument();
    fireEvent.click(viewSelectorIcon);
    expect(screen.getByTestId("view-selector")).toBeInTheDocument();
  });

  test("calls removeChapter with currentChapter when close icon is clicked", () => {
    const removeChapter = vi.fn();
    setup({ removeChapter, totalChapters: 3, currentChapter: 5 });
    const closeIcon = document.querySelector(".close-icon-container svg");
    fireEvent.click(closeIcon);
    expect(removeChapter).toHaveBeenCalledWith(5);
  });

  test("handles missing textdetail gracefully", () => {
    setup({ textdetail: undefined });
    expect(document.querySelector(".title-container")).toBeInTheDocument();
  });

  test("handles missing props without crashing", () => {
    render(
      <PanelProvider>
        <ChapterHeader />
      </PanelProvider>
    );
    expect(document.querySelector(".chapter-header-container")).toBeInTheDocument();
  });

  test("calls setShowTableOfContents when TOC close icon is clicked", () => {
    const setShowTableOfContents = vi.fn();
    setup({ showTableOfContents: true, setShowTableOfContents });
    const tocCloseIcon = document.querySelector(".toc-icon-container svg");
    fireEvent.click(tocCloseIcon);
    expect(setShowTableOfContents).toHaveBeenCalled();
  });
});
