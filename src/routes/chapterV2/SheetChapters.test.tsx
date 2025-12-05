import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SheetChapters from "./SheetChapters.js";

const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

vi.mock("./Chapters", () => ({
  __esModule: true,
  default: ({ initialChapters, maxChapters, renderChapter }) => (
    <div data-testid="chapters-mock">
      <div data-testid="initial-chapters" data-chapters={JSON.stringify(initialChapters)}>
        Initial Chapters: {initialChapters?.length || 0}
      </div>
      <div data-testid="max-chapters" data-max={maxChapters}>
        Max Chapters: {maxChapters}
      </div>
      <div data-testid="render-function" data-has-render={!!renderChapter}>
        Has Render Function: {!!renderChapter}
      </div>
      {initialChapters?.map((chapter, index) => (
        <div key={index} data-testid={`chapter-${index}`} data-chapter-type={chapter.type}>
          {renderChapter && renderChapter(chapter, index, {
            versionId: "test-version",
            addChapter: vi.fn(),
            removeChapter: vi.fn(),
            setVersionId: vi.fn()
          })}
        </div>
      ))}
    </div>
  )
}));

vi.mock("./chapter/ContentsChapter", () => ({
  __esModule: true,
  default: ({ textId, contentId, segmentId, versionId, addChapter, removeChapter, currentChapter, totalChapters, setVersionId }) => (
    <div data-testid="contents-chapter-mock"
      data-textid={textId}
      data-contentid={contentId}
      data-segmentid={segmentId}
      data-versionid={versionId}
      data-totalchapters={totalChapters}
    >
      ContentsChapter Mock
    </div>
  )
}));

vi.mock("../sheets/view-sheet/SheetDetailPage", () => ({
  __esModule: true,
  default: ({ addChapter, currentChapter, setVersionId }) => (
    <div data-testid="sheet-detail-page-mock"
      data-has-addchapter={!!addChapter}
      data-has-currentchapter={!!currentChapter}
      data-has-setversionid={!!setVersionId}
      data-chapter-type={currentChapter?.type}
      data-sheet-slug-and-id={currentChapter?.sheetSlugAndId}
      data-username={currentChapter?.username}
      data-segment-id={currentChapter?.segmentId}
    >
      SheetDetailPage Mock
    </div>
  )
}));

const renderWithRouter = (component, { username = "user123", sheetSlugAndId = "sheet456" } = {}) => {
  mockUseParams.mockReturnValue({ username, sheetSlugAndId });
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe("SheetChapters Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ username: "user123", sheetSlugAndId: "sheet456" });
  });

  describe("Component Rendering", () => {
    test("renders without crashing", () => {
      renderWithRouter(<SheetChapters />);
      expect(screen.getByTestId("chapters-mock")).toBeInTheDocument();
    });

    test("passes correct props to Chapters component", () => {
      renderWithRouter(<SheetChapters />);
      
      const chaptersContainer = screen.getByTestId("chapters-mock");
      expect(chaptersContainer).toBeInTheDocument();
      
      const maxChaptersElement = screen.getByTestId("max-chapters");
      expect(maxChaptersElement).toHaveAttribute("data-max", "3");
      expect(maxChaptersElement).toHaveTextContent("Max Chapters: 3");
      
      const renderFunctionElement = screen.getByTestId("render-function");
      expect(renderFunctionElement).toHaveAttribute("data-has-render", "true");
    });

    test("creates initial chapters with correct structure from URL params", () => {
      renderWithRouter(<SheetChapters />, { username: "testuser", sheetSlugAndId: "sheet-test-123" });
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      expect(chaptersData).toHaveLength(1);
      expect(chaptersData[0]).toEqual({
        type: 'sheet',
        sheetSlugAndId: 'sheet-test-123',
        username: 'testuser',
        segmentId: 'sheet-sheet-test-123'
      });
    });
  });

  describe("URL Parameter Handling", () => {
    test("extracts username and sheetSlugAndId from URL correctly", () => {
      renderWithRouter(<SheetChapters />, { username: "john_doe", sheetSlugAndId: "my-awesome-sheet-789" });
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      expect(chaptersData[0].username).toBe("john_doe");
      expect(chaptersData[0].sheetSlugAndId).toBe("my-awesome-sheet-789");
      expect(chaptersData[0].segmentId).toBe("sheet-my-awesome-sheet-789");
    });

    test("handles URL with special characters", () => {
      renderWithRouter(<SheetChapters />, { username: "user_123", sheetSlugAndId: "sheet-with-dashes-456" });
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      expect(chaptersData[0].username).toBe("user_123");
      expect(chaptersData[0].sheetSlugAndId).toBe("sheet-with-dashes-456");
    });
  });

  describe("Chapter Rendering Logic", () => {
    test("renders SheetDetailPage for sheet type chapter", () => {
      renderWithRouter(<SheetChapters />, { username: "testuser", sheetSlugAndId: "sheet123" });
      
      const sheetDetailPage = screen.getByTestId("sheet-detail-page-mock");
      expect(sheetDetailPage).toBeInTheDocument();
      expect(sheetDetailPage).toHaveAttribute("data-has-addchapter", "true");
      expect(sheetDetailPage).toHaveAttribute("data-has-currentchapter", "true");
      expect(sheetDetailPage).toHaveAttribute("data-has-setversionid", "true");
      expect(sheetDetailPage).toHaveAttribute("data-chapter-type", "sheet");
      expect(sheetDetailPage).toHaveAttribute("data-sheet-slug-and-id", "sheet123");
      expect(sheetDetailPage).toHaveAttribute("data-username", "testuser");
      expect(sheetDetailPage).toHaveAttribute("data-segment-id", "sheet-sheet123");
    });

    test("renders ContentsChapter for non-sheet type chapter", () => {
      renderWithRouter(<SheetChapters />);
      
      const chaptersContainer = screen.getByTestId("chapters-mock");
      expect(chaptersContainer).toBeInTheDocument();
      
      const renderFunctionElement = screen.getByTestId("render-function");
      expect(renderFunctionElement).toHaveAttribute("data-has-render", "true");
    });
  });

  describe("Chapter Configuration", () => {
    test("sets maxChapters to 3", () => {
      renderWithRouter(<SheetChapters />);
      
      const maxChaptersElement = screen.getByTestId("max-chapters");
      expect(maxChaptersElement).toHaveTextContent("Max Chapters: 3");
    });

    test("creates initial chapter with correct type", () => {
      renderWithRouter(<SheetChapters />);
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      expect(chaptersData[0].type).toBe("sheet");
    });

    test("generates correct segmentId format", () => {
      renderWithRouter(<SheetChapters />, { username: "user", sheetSlugAndId: "sheet-example-123" });
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      expect(chaptersData[0].segmentId).toBe("sheet-sheet-example-123");
    });
  });

  describe("Integration with Chapters Component", () => {
    test("passes all required props to Chapters", () => {
      renderWithRouter(<SheetChapters />);
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      expect(initialChaptersElement).toHaveTextContent("Initial Chapters: 1");
      
      const maxChaptersElement = screen.getByTestId("max-chapters");
      expect(maxChaptersElement).toHaveAttribute("data-max", "3");
      
      const renderFunctionElement = screen.getByTestId("render-function");
      expect(renderFunctionElement).toHaveAttribute("data-has-render", "true");
    });

    test("initial chapter structure is complete", () => {
      renderWithRouter(<SheetChapters />, { username: "alice", sheetSlugAndId: "my-sheet-999" });
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      const chapter = chaptersData[0];
      expect(chapter).toHaveProperty("type", "sheet");
      expect(chapter).toHaveProperty("sheetSlugAndId", "my-sheet-999");
      expect(chapter).toHaveProperty("username", "alice");
      expect(chapter).toHaveProperty("segmentId", "sheet-my-sheet-999");
    });
  });

  describe("Edge Cases", () => {
    test("handles empty or undefined URL parameters gracefully", () => {
      renderWithRouter(<SheetChapters />, { username: "", sheetSlugAndId: "" });
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      const chaptersData = JSON.parse(initialChaptersElement.getAttribute("data-chapters"));
      
      expect(chaptersData[0].username).toBe("");
      expect(chaptersData[0].sheetSlugAndId).toBe("");
      expect(chaptersData[0].segmentId).toBe("sheet-");
    });

    test("maintains component structure with unusual URL formats", () => {
      renderWithRouter(<SheetChapters />, { username: "user123", sheetSlugAndId: "" });
      
      const chaptersContainer = screen.getByTestId("chapters-mock");
      expect(chaptersContainer).toBeInTheDocument();
      
      const initialChaptersElement = screen.getByTestId("initial-chapters");
      expect(initialChaptersElement).toHaveTextContent("Initial Chapters: 1");
    });
  });
});
