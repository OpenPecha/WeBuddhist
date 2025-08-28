import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import Chapters from "./Chapters.jsx";

vi.mock("./chapter/ContentsChapter", () => ({
  __esModule: true,
  default: ({ textId, contentId, segmentId, versionId, addChapter, removeChapter, currentChapter, totalChapters, setVersionId }) => (
    <div data-testid="contents-chapter-mock"
      data-textid={textId}
      data-contentid={contentId}
      data-segmentid={segmentId}
      data-versionid={versionId}
      data-totalchapters={totalChapters}
      onClick={() => addChapter && addChapter({ textId: "t2", contentId: "c2", segmentId: "s2" }, currentChapter)}
      onDoubleClick={() => removeChapter && removeChapter(currentChapter)}
    >MockContentsChapter</div>
  )
}));

const mockSearchParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams()],
  };
});

describe("Chapters Component", () => {
  let getItemSpy, setItemSpy, removeItemSpy;

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

  function setupSessionStorage({ chapters = null, versionId = null } = {}) {
    getItemSpy.mockImplementation((key) => {
      if (key === "chapters" && chapters) return JSON.stringify(chapters);
      if (key === "versionId" && versionId) return versionId;
      return null;
    });
  }

  test("renders with chapters from sessionStorage", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" },
      { textId: "t2", contentId: "c2", segmentId: "s2" }
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
      get: (key) => {
        if (key === "text_id") return "t3";
        if (key === "content_id") return "c3";
        if (key === "segment_id") return "s3";
        return null;
      }
    });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(1);
    expect(containers[0]).toHaveAttribute("data-textid", "t3");
    expect(containers[0]).toHaveAttribute("data-contentid", "c3");
    expect(containers[0]).toHaveAttribute("data-segmentid", "s3");
  });

  test("addChapter adds a chapter (max 3)", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" }
    ];
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
      { textId: "t2", contentId: "c2", segmentId: "s2" }
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    act(() => {
      containers[0].dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    expect(screen.getAllByTestId("contents-chapter-mock").length).toBe(1);
  });

  test("sessionStorage is updated on chapters/versionId change", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" }
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters />);
    expect(setItemSpy).toHaveBeenCalledWith("chapters", expect.any(String));
    expect(setItemSpy).toHaveBeenCalledWith("versionId", expect.any(String));
  });

  test("cleanup removes sessionStorage items on unmount", () => {
    const chapters = [
      { textId: "t1", contentId: "c1", segmentId: "s1" }
    ];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    const { unmount } = render(<Chapters />);
    unmount();
    expect(removeItemSpy).toHaveBeenCalledWith("chapters");
    expect(removeItemSpy).toHaveBeenCalledWith("versionId");
  });

  test("renders with initialChapters prop", () => {
    const initialChapters = [
      { textId: "init1", contentId: "c1", segmentId: "s1" },
      { textId: "init2", contentId: "c2", segmentId: "s2" }
    ];
    setupSessionStorage({});
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters initialChapters={initialChapters} />);
    const containers = screen.getAllByTestId("contents-chapter-mock");
    expect(containers.length).toBe(2);
    expect(containers[0]).toHaveAttribute("data-textid", "init1");
    expect(containers[1]).toHaveAttribute("data-textid", "init2");
  });

  test("respects maxChapters prop", () => {
    const chapters = [{ textId: "t1", contentId: "c1", segmentId: "s1" }];
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters maxChapters={1} />);
    const container = screen.getByTestId("contents-chapter-mock");
    act(() => {
      container.click(); 
    });
    expect(screen.getAllByTestId("contents-chapter-mock").length).toBe(1); 
  });

  test("uses custom renderChapter function", () => {
    const chapters = [{ textId: "t1", contentId: "c1", segmentId: "s1" }];
    const customRender = vi.fn((chapter, index, helpers) => (
      <div data-testid="custom-chapter" data-textid={chapter.textId}>Custom: {chapter.textId}</div>
    ));
    setupSessionStorage({ chapters });
    mockSearchParams.mockReturnValue({ get: () => null });
    render(<Chapters renderChapter={customRender} />);
    expect(screen.getByTestId("custom-chapter")).toBeInTheDocument();
    expect(screen.getByTestId("custom-chapter")).toHaveAttribute("data-textid", "t1");
    expect(customRender).toHaveBeenCalledWith(
      expect.objectContaining({ textId: "t1" }),
      0,
      expect.objectContaining({ versionId: expect.any(String), addChapter: expect.any(Function), removeChapter: expect.any(Function) })
    );
  });
});
