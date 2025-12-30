import { render, screen, act } from "@testing-library/react";
import { vi, describe, beforeEach, test, expect, afterEach } from "vitest";
import Chapters from "./Chapters";

vi.mock("./chapter/ContentsChapter", () => ({
  __esModule: true,
  default: ({
    textId,
    contentId,
    segmentId,
    versionId,
    addChapter,
    removeChapter,
    currentChapter,
    totalChapters,
    setVersionId,
  }: any) => (
    <div
      data-testid="contents-chapter-mock"
      data-textid={textId}
      data-contentid={contentId || ""}
      data-segmentid={segmentId || ""}
      data-versionid={versionId || ""}
      data-totalchapters={totalChapters}
      data-chapterid={currentChapter?.id}
      onClick={() =>
        addChapter &&
        addChapter(
          { textId: "t2", contentId: "c2", segmentId: "s2" },
          currentChapter,
        )
      }
      onDoubleClick={() => removeChapter && removeChapter(currentChapter)}
      onKeyDown={(e: any) => {
        if (e.key === "v" && setVersionId) {
          setVersionId("new-version-123");
        }
        if (e.key === "s" && addChapter) {
          addChapter(
            {
              textId: "sheet-text",
              contentId: "sheet-content",
              segmentId: "sheet-segment",
            },
            currentChapter,
            true,
          );
        }
      }}
    >
      MockContentsChapter
    </div>
  ),
}));

const mockSearchParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams()],
  };
});

interface Chapter {
  id?: string;
  textId: string;
  contentId: string;
  segmentId: string;
  versionId?: string;
}

interface SetupSessionStorageOptions {
  chapters?: Chapter[] | null;
  versionId?: string | null;
}

describe("Chapters Component", () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;
  let removeItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    getItemSpy = vi.spyOn(window.sessionStorage.__proto__, "getItem");
    setItemSpy = vi.spyOn(window.sessionStorage.__proto__, "setItem");
    removeItemSpy = vi.spyOn(window.sessionStorage.__proto__, "removeItem");
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  function setupSessionStorage({
    chapters = null,
    versionId = null,
  }: SetupSessionStorageOptions = {}) {
    getItemSpy.mockImplementation((key: unknown) => {
      if (key === "chapters" && chapters) return JSON.stringify(chapters);
      if (key === "versionId" && versionId) return versionId;
      return null;
    });
  }

  test("renders with chapters from sessionStorage", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" },
      { textId: "t2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({ chapters, versionId: "v1" });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    expect(containers[0]).toHaveAttribute("data-textid", "t1");
    expect(containers[1]).toHaveAttribute("data-textid", "t2");
  });

  test("renders with chapters from searchParams if sessionStorage empty", () => {
    setupSessionStorage({});
    mockSearchParams.mockReturnValue({
      get: (key: string) => {
        if (key === "text_id") return "t3";
        if (key === "content_id") return "c3";
        if (key === "segment_id") return "s3";
        return null;
      },
    });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(1);
    expect(containers[0]).toHaveAttribute("data-textid", "t3");
    expect(containers[0]).toHaveAttribute("data-contentid", "c3");
    expect(containers[0]).toHaveAttribute("data-segmentid", "s3");
  });

  test("addChapter adds a chapter (max 3)", () => {
    const chapters = [{ textId: "t1", contentId: "c1", segmentId: "s1" }];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const container = screen.getByTestId("contents-chapter-mock");
    act(() => {
      container.click();
    });
    expect(screen.getAllByTestId("contents-chapter-mock").length).toBe(2);
  });

  test("removeChapter removes a chapter", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" },
      { textId: "t2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    act(() => {
      containers[0].dispatchEvent(
        new MouseEvent("dblclick", { bubbles: true }),
      );
    });
    expect(screen.getAllByTestId("contents-chapter-mock").length).toBe(1);
  });

  test("sessionStorage is updated on chapters change", () => {
    const chapters = [{ textId: "t1", contentId: "c1", segmentId: "s1" }];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    expect(setItemSpy).toHaveBeenCalledWith("chapters", expect.any(String));
  });

  test("cleanup removes sessionStorage items on unmount", () => {
    const chapters = [{ textId: "t1", contentId: "c1", segmentId: "s1" }];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    const { unmount } = render(<Chapters />);
    unmount();
    expect(removeItemSpy).toHaveBeenCalledWith("chapters");
  });

  test("renders with initialChapters prop", () => {
    const initialChapters = [
      { textId: "init1", contentId: "c1", segmentId: "s1" },
      { textId: "init2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({});
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters initialChapters={initialChapters} />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    expect(containers[0]).toHaveAttribute("data-textid", "init1");
    expect(containers[1]).toHaveAttribute("data-textid", "init2");
  });

  test("respects maxChapters limit of 3 for regular chapters", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
      { id: "ch2", textId: "t2", contentId: "c2", segmentId: "s2" },
      { id: "ch3", textId: "t3", contentId: "c3", segmentId: "s3" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(3);
    act(() => {
      containers[0].click();
    });
    expect(screen.getAllByTestId("contents-chapter-mock").length).toBe(3);
  });

  test("respects maxChapters limit of 2 when isFromSheet is true", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
      { id: "ch2", textId: "t2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    act(() => {
      containers[0].dispatchEvent(
        new KeyboardEvent("keydown", { key: "s", bubbles: true }),
      );
    });
    expect(screen.getAllByTestId("contents-chapter-mock").length).toBe(2);
  });

  test("uses custom renderChapter function", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
    ];
    const customRender = vi.fn(
      (chapter: any, _index: number, _helpers: any) => (
        <div data-testid="custom-chapter" data-textid={chapter.textId}>
          Custom: {chapter.textId}
        </div>
      ),
    );
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters renderChapter={customRender} />);
    expect(screen.getByTestId("custom-chapter")).toBeInTheDocument();
    expect(screen.getByTestId("custom-chapter")).toHaveAttribute(
      "data-textid",
      "t1",
    );
    expect(customRender).toHaveBeenCalledWith(
      expect.objectContaining({ textId: "t1" }),
      0,
      expect.objectContaining({
        addChapter: expect.any(Function),
        removeChapter: expect.any(Function),
        setVersionId: expect.any(Function),
      }),
    );
  });

  test("generates unique IDs for chapters from sessionStorage without IDs", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" },
      { textId: "t2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    const id1 = containers[0].getAttribute("data-chapterid");
    const id2 = containers[1].getAttribute("data-chapterid");
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  test("preserves existing IDs for chapters from sessionStorage", () => {
    const chapters = [
      { id: "existing-id-1", textId: "t1", contentId: "c1", segmentId: "s1" },
      { id: "existing-id-2", textId: "t2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers[0]).toHaveAttribute("data-chapterid", "existing-id-1");
    expect(containers[1]).toHaveAttribute("data-chapterid", "existing-id-2");
  });

  test("createSetVersionId updates versionId for specific chapter", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const container = screen.getByTestId("contents-chapter-mock");
    expect(container).toHaveAttribute("data-versionid", "");
    act(() => {
      container.dispatchEvent(
        new KeyboardEvent("keydown", { key: "v", bubbles: true }),
      );
    });
    expect(screen.getByTestId("contents-chapter-mock")).toHaveAttribute(
      "data-versionid",
      "new-version-123",
    );
  });

  test("addChapter inserts chapter after currentChapter position", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
      { id: "ch2", textId: "t3", contentId: "c3", segmentId: "s3" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    act(() => {
      containers[0].click();
    });
    const updatedContainers = screen.getAllByTestId("contents-chapter-mock");
    expect(updatedContainers.length).toBe(3);
    expect(updatedContainers[0]).toHaveAttribute("data-textid", "t1");
    expect(updatedContainers[1]).toHaveAttribute("data-textid", "t2");
    expect(updatedContainers[2]).toHaveAttribute("data-textid", "t3");
  });

  test("addChapter appends to end when currentChapter not found", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });

    const customRender = vi.fn((chapter: any, _index: number, helpers: any) => (
      <div
        data-testid="custom-chapter"
        data-textid={chapter.textId}
        onClick={() =>
          helpers.addChapter(
            {
              textId: "new-text",
              contentId: "new-content",
              segmentId: "new-segment",
            },
            { id: "non-existent-id" },
          )
        }
      >
        Custom: {chapter.textId}
      </div>
    ));

    render(<Chapters renderChapter={customRender} />);
    const container = screen.getByTestId("custom-chapter");
    act(() => {
      container.click();
    });
    const updatedContainers = screen.getAllByTestId("custom-chapter");
    expect(updatedContainers.length).toBe(2);
    expect(updatedContainers[1]).toHaveAttribute("data-textid", "new-text");
  });

  test("removeChapter uses unique ID to identify chapter", () => {
    const chapters = [
      { id: "unique-id-1", textId: "t1", contentId: "c1", segmentId: "s1" },
      { id: "unique-id-2", textId: "t1", contentId: "c1", segmentId: "s1" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    act(() => {
      containers[0].dispatchEvent(
        new MouseEvent("dblclick", { bubbles: true }),
      );
    });
    const updatedContainers = screen.getAllByTestId("contents-chapter-mock");
    expect(updatedContainers.length).toBe(1);
    expect(updatedContainers[0]).toHaveAttribute(
      "data-chapterid",
      "unique-id-2",
    );
  });

  test("calculates correct width for chapters", () => {
    const chapters = [
      { id: "ch1", textId: "t1", contentId: "c1", segmentId: "s1" },
      { id: "ch2", textId: "t2", contentId: "c2", segmentId: "s2" },
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    const { container } = render(<Chapters />);
    const chapterDivs = container.querySelectorAll(".flex.flex-col.h-full");
    expect(chapterDivs.length).toBe(2);
    chapterDivs.forEach((div) => {
      expect(div).toHaveStyle({ width: "50%" });
    });
  });

  test("handles missing contentId and segmentId in searchParams", () => {
    setupSessionStorage({});
    mockSearchParams.mockReturnValue({
      get: (key: string) => {
        if (key === "text_id") return "text-only";
        return null;
      },
    });
    render(<Chapters />);
    const container = screen.getByTestId("contents-chapter-mock");
    expect(container).toHaveAttribute("data-textid", "text-only");
    expect(container).toHaveAttribute("data-contentid", "");
    expect(container).toHaveAttribute("data-segmentid", "");
  });
});
