import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import ChapterHeader from "./ChapterHeader.js";
import { PanelProvider } from "../../../../context/PanelContext.js";
import "@testing-library/jest-dom";
import { TolgeeProvider } from "@tolgee/react";
import { mockTolgee } from "../../../../test-utils/CommonMocks.js";
import { BrowserRouter as Router } from "react-router-dom";

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
    layoutMode: "default",
    setLayoutMode: vi.fn(),
    textdetail: { title: "Test Chapter", language: "bo" },
    showTableOfContents: false,
    setShowTableOfContents: vi.fn(),
    removeChapter: vi.fn(),
    currentChapter: { id: 1 },
    totalChapters: 2,
  };

  const setup = (props = {}) =>
    render(
      <Router>
        <TolgeeProvider tolgee={mockTolgee} fallback={"Loading tolgee..."}>
          <PanelProvider>
            <ChapterHeader {...defaultProps} {...props} />
          </PanelProvider>
        </TolgeeProvider>
      </Router>
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
    const viewSelectorIcon = screen.getByAltText("view selector");
    expect(viewSelectorIcon).toBeInTheDocument();
    fireEvent.click(viewSelectorIcon);
    expect(screen.getByTestId("view-selector")).toBeInTheDocument();
  });

  test("calls removeChapter with currentChapter when close icon is clicked", () => {
    const removeChapter = vi.fn();
    const testChapter = { id: 5 };
    setup({ removeChapter, totalChapters: 3, currentChapter: testChapter });
    const closeIcon = document.querySelector(".close-icon-container svg");
    fireEvent.click(closeIcon);
    expect(removeChapter).toHaveBeenCalledWith(testChapter);
  });

  test("handles missing textdetail gracefully", () => {
    setup({ textdetail: undefined });
    expect(document.querySelector(".title-container")).toBeInTheDocument();
  });

  test("handles missing props without crashing", () => {
    render(
      <Router>
        <TolgeeProvider tolgee={mockTolgee} fallback={"Loading tolgee..."}>
          <PanelProvider>
            <ChapterHeader 
              viewMode="single"
              setViewMode={vi.fn()}
              layoutMode="default"
              setLayoutMode={vi.fn()}
              showTableOfContents={false}
              setShowTableOfContents={vi.fn()}
              removeChapter={vi.fn()}
              currentChapter={{ id: 1 }}
              totalChapters={1}
            />
          </PanelProvider>
        </TolgeeProvider>
      </Router>
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
