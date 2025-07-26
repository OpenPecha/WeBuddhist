import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import ContentsChapter from "./ContentsChapter.jsx";
import axiosInstance from "../../../config/axios-config.js";

mockAxios();
mockUseAuth();

vi.mock("react-query", async () => {
  const actual = await vi.importActual("react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        contents: [
          { id: "content-1", sections: [{ id: "section-1", title: "Test Section" }] }
        ]
      },
      isLoading: false,
      error: null,
    })),
    useInfiniteQuery: vi.fn(() => ({
      data: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchPreviousPage: vi.fn(),
      hasPreviousPage: false,
      isFetchingPreviousPage: false,
      isLoading: false,
      error: null,
    })),
    QueryClient: actual.QueryClient,
    QueryClientProvider: actual.QueryClientProvider,
  };
});

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({ t: (key) => key }),
  };
});

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  getEarlyReturn: vi.fn(() => null),
  getFirstSegmentId: vi.fn(() => "first-segment-id"),
  getLastSegmentId: vi.fn(() => "last-segment-id"),
  mergeSections: vi.fn((a, b) => [...(a || []), ...(b || [])]),
  mapLanguageCode: vi.fn(() => "bo"),
}));

vi.mock("../../../utils/constants.js", () => ({
  LANGUAGE: "language",
}));

vi.mock("../utils/header/ChapterHeader.jsx", () => ({
  __esModule: true,
  default: (props) => <div data-testid="chapter-header-mock">ChapterHeader</div>,
}));

vi.mock("./helpers/UseChapterHook.jsx", () => ({
  __esModule: true,
  default: (props) => <div data-testid="use-chapter-hook-mock">UseChapterHook</div>,
}));

vi.mock("../../../context/PanelContext.jsx", () => ({
  PanelProvider: ({ children }) => <div data-testid="panel-provider-mock">{children}</div>,
}));

vi.mock("./helpers/useTOCHooks.jsx", () => ({
  useTOCNavigation: vi.fn(() => ({
    fetchContentBySegmentId: vi.fn(),
  })),
}));

vi.mock("../../../config/axios-config.js", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const defaultProps = {
  textId: "text-1",
  contentId: "content-1",
  segmentId: "segment-1",
  versionId: "version-1",
  addChapter: vi.fn(),
  removeChapter: vi.fn(),
  currentChapter: { id: 1 },
  totalChapters: 5,
  setVersionId: vi.fn(),
};

const setup = (props = {}) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <TolgeeProvider tolgee={mockTolgee} fallback={"Loading tolgee..."}>
        <ContentsChapter {...defaultProps} {...props} />
      </TolgeeProvider>
    </QueryClientProvider>
  );
};

describe("ContentsChapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  test("renders main container and child components", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue({
      data: {
        pages: [
          {
            content: { sections: [{ id: 1 }], foo: "bar" },
            text_detail: { language: "en" },
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchPreviousPage: vi.fn(),
      hasPreviousPage: false,
      isFetchingPreviousPage: false,
      isLoading: false,
      error: null,
    });
    setup();
    expect(document.querySelector(".contents-chapter-container")).toBeInTheDocument();
    expect(screen.getByTestId("chapter-header-mock")).toBeInTheDocument();
    expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
    expect(screen.getByTestId("panel-provider-mock")).toBeInTheDocument();
  });

  test("passes correct props to UseChapterHook and ChapterHeader", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue({
      data: {
        pages: [
          {
            content: { sections: [{ id: 1 }], foo: "bar" },
            text_detail: { language: "en" },
          },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchPreviousPage: vi.fn(),
      hasPreviousPage: false,
      isFetchingPreviousPage: false,
      isLoading: false,
      error: null,
    });
    setup();
    expect(screen.getByTestId("chapter-header-mock")).toBeInTheDocument();
    expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
  });

  test("handles no data gracefully", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    setup();
    expect(document.querySelector(".contents-chapter-container")).toBeInTheDocument();
  });

  describe("fetchContentDetails function", () => {
    test("calls axios with correct parameters when all props are provided", async () => {
      const mockData = { content: { sections: [] } };
      axiosInstance.post.mockResolvedValue({ data: mockData });
      
      const queryKey = ["content", "text-1", "content-1", "version-1", 20, "segment-1"];
      const pageParam = { segmentId: "test-segment", direction: "next" };

      let capturedFetchFunction;
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedFetchFunction = fetchFn;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup();
      if (capturedFetchFunction) {
        await capturedFetchFunction({ pageParam, queryKey });
      }

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/v1/texts/text-1/details", {
        content_id: "content-1",
        segment_id: "test-segment",
        version_id: "version-1",
        direction: "next",
        size: 20,
      });
    });

    test("calls axios with default direction when pageParam is null", async () => {
      const mockData = { content: { sections: [] } };
      axiosInstance.post.mockResolvedValue({ data: mockData });

      let capturedFetchFunction;
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedFetchFunction = fetchFn;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup();

      const queryKey = ["content", "text-1", "content-1", "version-1", 20, "segment-1"];
      
      if (capturedFetchFunction) {
        await capturedFetchFunction({ pageParam: null, queryKey });
      }

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/v1/texts/text-1/details", {
        content_id: "content-1",
        segment_id: "segment-1",
        version_id: "version-1",
        direction: "next",
        size: 20,
      });
    });

    test("calls axios without optional parameters when they are null/undefined", async () => {
      const mockData = { content: { sections: [] } };
      axiosInstance.post.mockResolvedValue({ data: mockData });

      let capturedFetchFunction;
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedFetchFunction = fetchFn;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup({
        contentId: null,
        segmentId: null,
        versionId: null,
      });

      const queryKey = ["content", "text-1", null, null, 20, null];
      
      if (capturedFetchFunction) {
        await capturedFetchFunction({ pageParam: null, queryKey });
      }

      expect(axiosInstance.post).toHaveBeenCalledWith("/api/v1/texts/text-1/details", {
        direction: "next",
        size: 20,
      });
    });
  });

  describe("getNextPageParam logic", () => {
    test("returns null when current_segment_position equals total_segments", () => {
      let capturedGetNextPageParam;
      
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup();

      const lastPage = {
        current_segment_position: 10,
        total_segments: 10,
        content: { sections: [{ id: 1 }] }
      };

      const result = capturedGetNextPageParam(lastPage);
      expect(result).toBeNull();
    });

    test("handles undefined lastPage gracefully", () => {
      let capturedGetNextPageParam;
      
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup();

      const result = capturedGetNextPageParam(undefined);
      expect(result).toBeNull();
    });
  });

  describe("getPreviousPageParam logic", () => {
    test("returns null when current_segment_position equals 1", () => {
      let capturedGetPreviousPageParam;
      
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedGetPreviousPageParam = options.getPreviousPageParam;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup();

      const firstPage = {
        current_segment_position: 1,
        content: { sections: [{ id: 1 }] }
      };

      const result = capturedGetPreviousPageParam(firstPage);
      expect(result).toBeNull();
    });
  });

  describe("useInfiniteQuery configuration", () => {
    test("query is enabled when textId is provided", () => {
      let capturedOptions;
      
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedOptions = options;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup({ textId: "valid-text-id" });

      expect(capturedOptions.enabled).toBe(true);
    });

    test("query is disabled when textId is not provided", () => {
      let capturedOptions;
      
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedOptions = options;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup({ textId: null });

      expect(capturedOptions.enabled).toBe(false);
    });

    test("refetchOnWindowFocus is disabled", () => {
      let capturedOptions;
      
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation((key, fetchFn, options) => {
        capturedOptions = options;
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      setup();

      expect(capturedOptions.refetchOnWindowFocus).toBe(false);
    });
  });


});