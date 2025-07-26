import React from "react";
import { render, fireEvent, screen, renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import {
  useSectionHierarchy,
  useActiveSection,
  useActiveSectionDetection,
  useTOCScrollSync,
  usePanelNavigation,
  useTOCNavigation,
} from "./useTOCHelpers.jsx";
import "@testing-library/jest-dom";

vi.mock("../../../../config/axios-config.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("react-query", () => ({
  useQueryClient: vi.fn(() => ({
    setQueryData: vi.fn(),
  })),
}));

const mockQuerySelector = vi.fn();
const mockQuerySelectorAll = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockScrollIntoView = vi.fn();
const mockReplaceState = vi.fn();

Object.defineProperty(document, "querySelector", {
  value: mockQuerySelector,
  writable: true,
});

Object.defineProperty(document, "querySelectorAll", {
  value: mockQuerySelectorAll,
  writable: true,
});

Object.defineProperty(window, "innerHeight", {
  value: 800,
  writable: true,
});

Object.defineProperty(window, "history", {
  value: {
    replaceState: mockReplaceState,
  },
  writable: true,
});

Object.defineProperty(window, "location", {
  value: {
    search: "?param=value",
  },
  writable: true,
});

const TestComponent = ({ hook, props = [] }) => {
  const result = hook(...props);
  return <div data-testid="hook-result">{JSON.stringify(result)}</div>;
};

const setup = (hook, props = []) => {
  return render(<TestComponent hook={hook} props={props} />);
};

describe("useTOCHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuerySelector.mockReturnValue({
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
    });
    mockQuerySelectorAll.mockReturnValue([]);
  });

  describe("useSectionHierarchy", () => {
    test("initializes with empty section hierarchy state", () => {
      const { result } = renderHook(() => useSectionHierarchy());
      expect(result.current.sectionHierarchyState).toEqual({});
    });

    test("toggles section state when toggleSection is called", () => {
      const { result } = renderHook(() => useSectionHierarchy());

      act(() => {
        result.current.toggleSection("section1");
      });

      expect(result.current.sectionHierarchyState).toEqual({
        section1: true,
      });

      act(() => {
        result.current.toggleSection("section1");
      });

      expect(result.current.sectionHierarchyState).toEqual({
        section1: false,
      });
    });
  });

  describe("useActiveSection", () => {
    test("does not expand sections when activeSectionId is null", () => {
      const setSectionHierarchyState = vi.fn();
      const sectionHierarchyState = {};

      renderHook(() =>
        useActiveSection(null, { contents: [] }, sectionHierarchyState, setSectionHierarchyState)
      );

      expect(setSectionHierarchyState).not.toHaveBeenCalled();
    });

    test("expands parent sections when active section is found in tocData", () => {
      const setSectionHierarchyState = vi.fn();
      const sectionHierarchyState = {};

      const tocData = {
        contents: [
          {
            sections: [
              {
                id: "parent1",
                sections: [
                  {
                    id: "target",
                    sections: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      renderHook(() =>
        useActiveSection("target", tocData, sectionHierarchyState, setSectionHierarchyState)
      );

      expect(setSectionHierarchyState).toHaveBeenCalledWith({
        parent1: true,
      });
    });
  });

  describe("useActiveSectionDetection", () => {
    test("sets up scroll event listener on main content container", () => {
      const setActiveSectionId = vi.fn();
      const mockContainer = {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        querySelectorAll: vi.fn().mockReturnValue([]),
      };

      mockQuerySelector.mockReturnValue(mockContainer);

      renderHook(() => useActiveSectionDetection(setActiveSectionId));

      expect(mockAddEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    test("detects most visible section during scroll", () => {
      const setActiveSectionId = vi.fn();
      const mockSections = [
        {
          dataset: { sectionId: "section1" },
          getBoundingClientRect: () => ({
            top: 0,
            bottom: 400,
            height: 400,
          }),
        },
      ];

      const mockContainer = {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        querySelectorAll: vi.fn().mockReturnValue(mockSections),
      };

      mockQuerySelector.mockReturnValue(mockContainer);

      renderHook(() => useActiveSectionDetection(setActiveSectionId));

      const scrollHandler = mockAddEventListener.mock.calls[0][1];
      act(() => {
        scrollHandler();
      });

      expect(setActiveSectionId).toHaveBeenCalledWith("section1");
    });
  });

  describe("useTOCScrollSync", () => {
    test("returns panel and active element refs", () => {
      const { result } = renderHook(() => useTOCScrollSync("section1", true));

      expect(result.current.panelRef).toBeDefined();
      expect(result.current.activeElementRef).toBeDefined();
    });

    test("scrolls into view when element is above panel", () => {
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
        getBoundingClientRect: () => ({ top: -50, bottom: 100 }),
      };

      mockQuerySelector.mockReturnValue(mockElement);

      const { result, rerender } = renderHook(
        ({ activeSectionId, isVisible }) => useTOCScrollSync(activeSectionId, isVisible),
        { initialProps: { activeSectionId: null, isVisible: true } }
      );

      result.current.panelRef.current = {
        getBoundingClientRect: () => ({ top: 0, bottom: 200 }),
      };

      act(() => {
        rerender({ activeSectionId: "section1", isVisible: true });
      });

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });
  });

  describe("usePanelNavigation", () => {
    test("returns navigateToSection function", () => {
      const { result } = renderHook(() => usePanelNavigation());

      expect(result.current.navigateToSection).toBeDefined();
      expect(typeof result.current.navigateToSection).toBe("function");
    });

    test("navigates to section when element is found in DOM", () => {
      const mockElement = {
        scrollIntoView: mockScrollIntoView,
      };

      const mockContainer = {
        querySelector: vi.fn().mockReturnValue(mockElement),
      };

      mockQuerySelector.mockReturnValue(mockContainer);

      const { result } = renderHook(() => usePanelNavigation());

      act(() => {
        const success = result.current.navigateToSection("section1");
        expect(success).toBe(true);
      });

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    test("updates URL when updateUrl option is true", () => {
      const mockContainer = {
        querySelector: vi.fn().mockReturnValue(null),
      };

      mockQuerySelector.mockReturnValue(mockContainer);

      const { result } = renderHook(() => usePanelNavigation());

      act(() => {
        result.current.navigateToSection("section1", { updateUrl: true });
      });

      expect(mockReplaceState).toHaveBeenCalled();
    });

    test("calls fetchContentBySectionId when provided", () => {
      const mockContainer = {
        querySelector: vi.fn().mockReturnValue(null),
      };

      mockQuerySelector.mockReturnValue(mockContainer);
      const fetchContentBySectionId = vi.fn();

      const { result } = renderHook(() => usePanelNavigation());

      act(() => {
        result.current.navigateToSection("section1", {
          fetchContentBySectionId,
        });
      });

      expect(fetchContentBySectionId).toHaveBeenCalledWith("section1");
    });

    test("calls autoLoadToSection when loadMoreContent is provided", () => {
      const mockContainer = {
        querySelector: vi.fn().mockReturnValue(null),
      };

      mockQuerySelector.mockReturnValue(mockContainer);
      const loadMoreContent = vi.fn();

      const { result } = renderHook(() => usePanelNavigation());

      act(() => {
        result.current.navigateToSection("section1", {
          loadMoreContent,
          hasMoreContent: true,
          isFetchingNextPage: false,
        });
      });

      expect(loadMoreContent).toHaveBeenCalled();
    });
  });

  describe("useTOCNavigation", () => {
    test("returns fetchContentBySectionId function", () => {
      const { result } = renderHook(() =>
        useTOCNavigation("text1", "content1", "version1", 20, "segment1", {}, {})
      );

      expect(result.current.fetchContentBySectionId).toBeDefined();
      expect(typeof result.current.fetchContentBySectionId).toBe("function");
    });

    test("makes API call to fetch content by section ID", async () => {
      const mockAxios = vi.mocked(await import("../../../../config/axios-config.js")).default;
      mockAxios.post.mockResolvedValue({ data: { sections: [] } });

      const tocData = {
        contents: [
          {
            sections: [
              {
                id: "section1",
                segments: [{ segment_id: "segment1" }],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() =>
        useTOCNavigation("text1", "content1", "version1", 20, "segment1", {}, tocData)
      );

      await act(async () => {
        await result.current.fetchContentBySectionId("section1");
      });

      expect(mockAxios.post).toHaveBeenCalledWith(
        "/api/v1/texts/text1/details",
        expect.objectContaining({
          segment_id: "segment1",
        })
      );
    });

    test("handles API errors when fetchContentBySectionId fails", async () => {
      const mockAxios = vi.mocked(await import("../../../../config/axios-config.js")).default;
      mockAxios.post.mockRejectedValue(new Error("API Error"));

      const { result } = renderHook(() =>
        useTOCNavigation("text1", "content1", "version1", 20, "segment1", {}, {})
      );

      await expect(
        act(async () => {
          await result.current.fetchContentBySectionId("section1");
        })
      ).rejects.toThrow("API Error");
    });
  });
}); 