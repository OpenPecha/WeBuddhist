import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
  mockLocalStorage,
} from "../../test-utils/CommonMocks.js";
import { vi, beforeEach, afterEach, test, expect, describe } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import Works from "./Works.js";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    Link: ({ to, className, children }) => (
      <a href={to} className={className} data-testid="router-link">
        {children}
      </a>
    ),
  };
});

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: vi.fn(), inView: false }),
}));

describe("Works Component", () => {
  const queryClient = new QueryClient();
  const mockTextCategoryData = {
    term: {
      title: "Text Category",
      description: "Text Category Description",
    },
    texts: [
      {
        id: "text1",
        title: "Root Text 1",
        type: "root_text",
        language: "bo",
      },
      {
        id: "text2",
        title: "Root Text 2",
        type: "root_text",
        language: "en",
      },
      {
        id: "text3",
        title: "Commentary 1",
        type: "commentary",
        language: "bo",
      },
    ],
  };

  let localStorageMock;

  const buildInfiniteQueryResult = (override = {}) =>
    ({
      data: {
        pages: [mockTextCategoryData],
        pageParams: [0],
      },
      isLoading: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      ...override,
    }) as unknown as ReturnType<typeof reactQuery.useInfiniteQuery>;

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "works-id" });
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("en");
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult(),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props = {}) => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Works {...props} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  test("renders texts correctly", () => {
    setup();
    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
    expect(screen.getByText("Root Text 2")).toBeInTheDocument();
    expect(screen.getByText("Commentary 1")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({ data: null, isLoading: true }),
    );

    setup();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays error message when there is an error", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: null,
        isLoading: false,
        error: new Error("Failed to fetch text category"),
      }),
    );

    setup();
    expect(screen.getByText("global.not_found")).toBeInTheDocument();
  });

  test("renders correct links to text detail chapter", () => {
    const updatedMockData = {
      term: {
        title: "Text Category",
        description: "Text Category Description",
      },
      collection: {
        title: "Text Category",
      },
      texts: [
        {
          id: "text1",
          title: "Root Text 1",
          type: "root_text",
          language: "en",
        },
        {
          id: "text2",
          title: "Root Text 2",
          type: "root_text",
          language: "en",
        },
        {
          id: "text3",
          title: "Commentary 1",
          type: "commentary",
          language: "en",
        },
      ],
    };

    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: { pages: [updatedMockData], pageParams: [0] },
      }),
    );

    setup();
    const links = screen.getAllByTestId("router-link");
    // 1 breadcrumb link + 3 text links = 4 total
    expect(links).toHaveLength(4);
    expect(links[1].getAttribute("href")).toBe("/texts/text1?type=root_text");
    expect(links[2].getAttribute("href")).toBe("/texts/text2?type=root_text");
  });

  test("uses default category ID when none provided", () => {
    useParams.mockReturnValue({});

    const infiniteQuerySpy = vi.spyOn(reactQuery, "useInfiniteQuery");
    infiniteQuerySpy.mockReturnValue(buildInfiniteQueryResult());

    setup();

    expect(infiniteQuerySpy).toHaveBeenCalled();
  });

  test("uses correct language from localStorage", () => {
    localStorageMock.getItem.mockReturnValue("bo");

    const infiniteQuerySpy = vi.spyOn(reactQuery, "useInfiniteQuery");
    infiniteQuerySpy.mockReturnValue(buildInfiniteQueryResult());

    setup();

    expect(infiniteQuerySpy).toHaveBeenCalled();
    const queryKey = infiniteQuerySpy.mock.calls[0][0];
    expect(queryKey).toEqual(["works", "works-id"]);
  });

  test("uses infinite query parameters correctly", () => {
    const infiniteQuerySpy = vi.spyOn(reactQuery, "useInfiniteQuery");
    infiniteQuerySpy.mockReturnValue(buildInfiniteQueryResult());

    setup();

    expect(infiniteQuerySpy).toHaveBeenCalled();
    const options = infiniteQuerySpy.mock.calls[0][2];
    expect(options.refetchOnWindowFocus).toBe(false);
    expect(options.enabled).toBe(true);
  });

  test("handles API call errors by showing error message", () => {
    const errorMessage = "Network Error";

    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: null,
        isLoading: false,
        error: new Error(errorMessage),
      }),
    );

    setup();

    expect(screen.getByText("global.not_found")).toBeInTheDocument();
  });

  test("uses correct language from localStorage with mapping", async () => {
    localStorageMock.getItem.mockReturnValue("en");
    const axiosSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: mockTextCategoryData,
    });

    let capturedFetchFn: any;
    vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
      (_key: any, fetchFn: any) => {
        capturedFetchFn = fetchFn;
        return buildInfiniteQueryResult();
      },
    );

    setup();

    // Call the fetch function to test the API call
    await capturedFetchFn({ pageParam: 0, queryKey: ["works", "works-id"] });

    expect(axiosSpy).toHaveBeenCalledWith(
      "/api/v1/texts",
      expect.objectContaining({
        params: expect.objectContaining({
          collection_id: "works-id",
          language: "en",
          limit: 12,
          skip: 0,
        }),
      }),
    );

    vi.clearAllMocks();
  });

  test("defaults to 'en' language when localStorage is empty", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const axiosSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: mockTextCategoryData,
    });

    let capturedFetchFn: any;
    vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
      (_key: any, fetchFn: any) => {
        capturedFetchFn = fetchFn;
        return buildInfiniteQueryResult();
      },
    );

    setup();

    await capturedFetchFn({ pageParam: 0, queryKey: ["works", "works-id"] });

    expect(axiosSpy).toHaveBeenCalledWith(
      "/api/v1/texts",
      expect.objectContaining({
        params: expect.objectContaining({
          language: "en",
        }),
      }),
    );
  });

  test("passes correct pagination parameters to API", async () => {
    const axiosSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: mockTextCategoryData,
    });

    let capturedFetchFn: any;
    vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
      (_key: any, fetchFn: any) => {
        capturedFetchFn = fetchFn;
        return buildInfiniteQueryResult();
      },
    );

    setup();

    await capturedFetchFn({ pageParam: 0, queryKey: ["works", "works-id"] });

    expect(axiosSpy).toHaveBeenCalledWith(
      "/api/v1/texts",
      expect.objectContaining({
        params: expect.objectContaining({
          limit: 12,
          skip: 0,
        }),
      }),
    );
  });

  test("renders all texts regardless of type", () => {
    const multipleTypesData = {
      term: {
        title: "Multiple Types",
        description: "Contains various text types",
      },
      texts: [
        {
          id: "text1",
          title: "Root Text 1",
          type: "root_text",
          language: "en",
        },
        {
          id: "text2",
          title: "Root Text 2",
          type: "root_text",
          language: "en",
        },
        {
          id: "text3",
          title: "Commentary 1",
          type: "commentary",
          language: "en",
        },
      ],
    };

    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: { pages: [multipleTypesData], pageParams: [0] },
      }),
    );

    setup();

    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
    expect(screen.getByText("Root Text 2")).toBeInTheDocument();
    expect(screen.getByText("Commentary 1")).toBeInTheDocument();
  });

  test("renders correctly when category has no description", () => {
    const noDescriptionData = {
      collection: {
        title: "No Description Category",
      },
      texts: [
        {
          id: "text1",
          title: "Root Text 1",
          type: "root_text",
          language: "en",
        },
      ],
    };

    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: { pages: [noDescriptionData], pageParams: [0] },
      }),
    );

    setup();

    expect(screen.getAllByText("No Description Category")).toHaveLength(2);
    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
  });

  test("renders button and calls setRendererInfo when prop is provided", async () => {
    const user = userEvent.setup();
    const mockSetRendererInfo = vi.fn();
    const dataWithTexts = {
      collection: { title: "Click Collection" },
      texts: [
        {
          id: "text-click-1",
          title: "Clickable Text",
          type: "root_text",
          language: "bo",
        },
      ],
      total: 1,
    };

    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: { pages: [dataWithTexts], pageParams: [0] },
      }),
    );

    setup({ setRendererInfo: mockSetRendererInfo });

    const button = screen.getByRole("button", { name: /Clickable Text/i });
    await user.click(button);

    expect(mockSetRendererInfo).toHaveBeenCalled();
  });

  test("getNextPageParam returns undefined when has_more is false", () => {
    let capturedGetNextPageParam: any;

    vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
      (_key: any, _fetchFn: any, options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return buildInfiniteQueryResult();
      },
    );

    setup();

    const result = capturedGetNextPageParam({ has_more: false, skip: 0 });
    expect(result).toBeUndefined();
  });

  test("getNextPageParam returns next skip value when has_more is true", () => {
    let capturedGetNextPageParam: any;

    vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
      (_key: any, _fetchFn: any, options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return buildInfiniteQueryResult();
      },
    );

    setup();

    const result = capturedGetNextPageParam({ has_more: true, skip: 0 });
    expect(result).toBe(12); // LIMIT = 12
  });

  test("renders loading indicator when fetching next page", () => {
    const dataWithTexts = {
      collection: { title: "Test Collection" },
      texts: [
        {
          id: "text1",
          title: "Test Text",
          type: "root_text",
          language: "en",
        },
      ],
    };

    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: { pages: [dataWithTexts], pageParams: [0] },
        isFetchingNextPage: true,
        hasNextPage: true,
      }),
    );

    setup();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
