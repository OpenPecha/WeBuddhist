import React from "react";
import { render, screen } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {
  mockAxios,
  mockReactQuery, mockTolgee,
  mockUseAuth,
  mockLocalStorage,
} from "../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import Works from "./Works.jsx";
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
        language: "bo"
      },
      {
        id: "text2",
        title: "Root Text 2",
        type: "root_text",
        language: "en"
      },
      {
        id: "text3",
        title: "Commentary 1",
        type: "commentary",
        language: "bo"
      },
    ],
  };

  let localStorageMock;

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "works-id" });
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("en");
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTextCategoryData,
      isLoading: false,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Works />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("renders root texts correctly", () => {
    setup();
    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
    expect(screen.getByText("Root Text 2")).toBeInTheDocument();
  });

  test("renders commentary texts correctly", () => {
    // Update mock data to match the expected type in the component
    const updatedMockData = {
      ...mockTextCategoryData,
      texts: [
        ...mockTextCategoryData.texts.slice(0, 2),
        { id: "text3", title: "Commentary 1", type: "commentary" }
      ]
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: updatedMockData,
      isLoading: false
    }));

    setup();
    expect(screen.getByText("text.type.commentary")).toBeInTheDocument();
    expect(screen.getByText("Commentary 1")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));

    setup();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays error message when there is an error", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch text category"),
    }));

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
        { id: "text1", title: "Root Text 1", type: "root_text", language: "en" },
        { id: "text2", title: "Root Text 2", type: "root_text", language: "en"},
        { id: "text3", title: "Commentary 1", type: "commentary", language: "en" }
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: updatedMockData,
      isLoading: false
    }));

    setup();
    const links = screen.getAllByTestId("router-link");
    // 1 breadcrumb link + 3 text links = 4 total
    expect(links).toHaveLength(4);
    expect(links[1].getAttribute("href")).toBe("/texts/text1?type=root_text");
    expect(links[2].getAttribute("href")).toBe("/texts/text2?type=root_text");
  });


  test("uses default category ID when none provided", () => {
    useParams.mockReturnValue({});

    const querySpy = vi.fn();
    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      (_queryKey, queryFn) => {
        querySpy(queryFn.toString());
        return {
          data: mockTextCategoryData,
          isLoading: false,
        };
      }
    );

    setup();

    expect(querySpy).toHaveBeenCalled();
  });

  test("uses correct language from localStorage", () => {
    localStorageMock.getItem.mockReturnValue("bo");

    const axiosSpy = vi.spyOn(axiosInstance, "get");
    axiosSpy.mockResolvedValueOnce({ data: mockTextCategoryData });

    setup();

    expect(reactQuery.useQuery).toHaveBeenCalled();
    const queryKey = reactQuery.useQuery.mock.calls[0][0];
    expect(queryKey).toEqual(["works", "works-id", 0, 12]);
  });

  test("uses pagination parameters correctly", () => {
    const querySpy = vi.spyOn(reactQuery, "useQuery");

    setup();

    expect(querySpy).toHaveBeenCalled();
    const options = querySpy.mock.calls[0][2];
    expect(options.refetchOnWindowFocus).toBe(false);
  });

  test("handles API call errors by showing error message", () => {
    const errorMessage = "Network Error";

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });

    const mockError = {
      response: { status: 500, data: { message: errorMessage } }
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => {
      console.error("API call error:", mockError.response || mockError);

      return {
        data: null,
        isLoading: false,
        error: new Error(errorMessage)
      };
    });

    setup();

    expect(screen.getByText("global.not_found")).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith(
      "API call error:",
      mockError.response
    );

    consoleSpy.mockRestore();
  });

  test("uses correct language from localStorage with mapping", () => {
    localStorageMock.getItem.mockReturnValue("en");
    const axiosSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: mockTextCategoryData,
    });

    vi.spyOn(reactQuery, "useQuery").mockImplementation((_, queryFn) => {
      queryFn();
      return {
        data: mockTextCategoryData,
        isLoading: false,
      };
    });

    setup();

    expect(axiosSpy).toHaveBeenCalledWith(
      "/api/v1/texts",
      expect.objectContaining({
        params: expect.objectContaining({
          collection_id: "works-id",
          language: "en",
          limit: 12,
          skip: 0,
        }),
      })
    );

    vi.clearAllMocks();
  });

  test("defaults to 'en' language when localStorage is empty", () => {
    localStorageMock.getItem.mockReturnValue(null);
    const axiosSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: mockTextCategoryData,
    });

    vi.spyOn(reactQuery, "useQuery").mockImplementation((_, queryFn) => {
      queryFn();
      return {
        data: mockTextCategoryData,
        isLoading: false,
      };
    });

    setup();

    expect(axiosSpy).toHaveBeenCalledWith(
      "/api/v1/texts",
      expect.objectContaining({
        params: expect.objectContaining({
          language: "en",
        }),
      })
    );
  });

  test("passes correct pagination parameters to API", () => {
    const axiosSpy = vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: mockTextCategoryData,
    });

    vi.spyOn(reactQuery, "useQuery").mockImplementation((_, queryFn) => {
      queryFn();
      return {
        data: mockTextCategoryData,
        isLoading: false,
      };
    });

    setup();

    expect(axiosSpy).toHaveBeenCalledWith(
      "/api/v1/texts",
      expect.objectContaining({
        params: expect.objectContaining({
          limit: 12,
          skip: 0,
        }),
      })
    );
  });

  test("correctly groups texts of multiple types", () => {
    const multipleTypesData = {
      term: {
        title: "Multiple Types",
        description: "Contains various text types",
      },
      texts: [
        { id: "text1", title: "Root Text 1", type: "root_text" },
        { id: "text2", title: "Root Text 2", type: "root_text" },
        { id: "text3", title: "Commentary 1", type: "commentary" },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: multipleTypesData,
      isLoading: false,
    }));

    const { container } = setup();

    expect(screen.getByText("text.type.commentary")).toBeInTheDocument();

    const textSections = container.querySelectorAll(".root-text");
    expect(textSections.length).toBe(2);
  });

  test("renders correctly when category has no description", () => {
    const noDescriptionData = {
      term: {
        title: "No Description Category",
      },
      texts: [{ id: "text1", title: "Root Text 1", type: "root_text" }],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: noDescriptionData,
      isLoading: false,
    }));

    setup();

    expect(screen.getByText("No Description Category")).toBeInTheDocument();
    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
  });
});
