import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import ContentsChapter from "./ContentsChapter.jsx";

mockAxios();
mockUseAuth();
mockReactQuery();

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
});
