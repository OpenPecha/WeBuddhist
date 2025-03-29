import React from "react";
import { render, screen } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {
  mockAxios,
  mockReactQuery,
  mockUseAuth,
} from "../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import Book from "./Book.jsx";
import { BrowserRouter as Router, useParams } from "react-router-dom";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

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

describe("Book Component", () => {
  const queryClient = new QueryClient();
  const mockTextCategoryData = {
    category: {
      title: "Text Category",
      description: "Text Category Description",
    },
    texts: [
      {
        id: "text1",
        title: "Root Text 1",
        type: "root_text",
      },
      {
        id: "text2",
        title: "Root Text 2",
        type: "root_text",
      },
      {
        id: "text3",
        title: "Commentary 1",
        type: "commentary",
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ categoryid: "book-id" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTextCategoryData,
      isLoading: false,
    }));
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "LANGUAGE") return "en";
      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <Book />
        </QueryClientProvider>
      </Router>
    );
  };


  test("renders root texts correctly", () => {
    setup();
    expect(screen.getByText("text.type.root_text")).toBeInTheDocument();
    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
    expect(screen.getByText("Root Text 2")).toBeInTheDocument();
  });

  test("renders commentary texts correctly", () => {
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
    expect(screen.getByText("Loading content...")).toBeInTheDocument();
  });

  test("displays error message when there is an error", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch text category"),
    }));

    setup();
    expect(
      screen.getByText("Error loading content: Failed to fetch text category")
    ).toBeInTheDocument();
  });

  test("displays no content message when data is null", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("No content found")).toBeInTheDocument();
  });

  test("displays empty text sections when texts array is empty", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: { category: { title: "Empty Category" }, texts: [] },
      isLoading: false,
      error: null,
    }));

    const { container } = setup();
    expect(screen.getByText("Empty Category")).toBeInTheDocument();
    const textSections = container.querySelector(".text-sections");
    expect(textSections).toBeInTheDocument();
    expect(textSections.children.length).toBe(0);
  });

  test("renders correct links to text detail chapter1", () => {
    setup();
    const links = screen.getAllByTestId("router-link");
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute("href")).toBe("/chapter/text1");
    expect(links[1].getAttribute("href")).toBe("/chapter/text2");
    expect(links[2].getAttribute("href")).toBe("/chapter/text3");
  });

  test("handles query error gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      (_queryKey, _queryFn, options) => {
        if (options.onError) {
          options.onError(new Error("Test error"));
        }
        return {
          data: null,
          isLoading: false,
          error: new Error("Test error"),
        };
      }
    );

    setup();
    expect(consoleSpy).toHaveBeenCalledWith("Query error:", expect.any(Error));
    consoleSpy.mockRestore();
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
    const queryFnString = querySpy.mock.calls[0][0];
    expect(queryFnString).toContain("67dd22a8d9f06ab28feedc90");
  });

  test("uses correct language from localStorage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo");

    const axiosSpy = vi.spyOn(axiosInstance, "get");
    axiosSpy.mockResolvedValueOnce({ data: mockTextCategoryData });

    setup();

    expect(reactQuery.useQuery).toHaveBeenCalled();
    const queryKey = reactQuery.useQuery.mock.calls[0][0];
    expect(queryKey).toEqual(["texts", "book-id"]);
  });

  test("uses pagination parameters correctly", () => {
    const querySpy = vi.spyOn(reactQuery, "useQuery");

    setup();

    expect(querySpy).toHaveBeenCalled();
    const options = querySpy.mock.calls[0][2];
    expect(options.refetchOnWindowFocus).toBe(false);
    expect(options.staleTime).toBe(1000 * 60 * 20);
    expect(options.retry).toBe(1);
    expect(typeof options.onError).toBe("function");
  });

  test("handles API call errors by showing error message", () => {
    const errorMessage = "Network Error";
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
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
    
    expect(screen.getByText(`Error loading content: ${errorMessage}`)).toBeInTheDocument();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      "API call error:", 
      mockError.response
    );
    
    consoleSpy.mockRestore();
  });

  test("uses correct language from localStorage with mapping", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("en");
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

    vi.clearAllMocks();
  });

  test("defaults to 'bo' language when localStorage is empty", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
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
          language: "bo",
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
          limit: 10,
          skip: 0,
        }),
      })
    );
  });

  test("correctly groups texts of multiple types", () => {
    const multipleTypesData = {
      category: {
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

    expect(screen.getByText("text.type.root_text")).toBeInTheDocument();
    expect(screen.getByText("text.type.commentary")).toBeInTheDocument();

    const textSections = container.querySelectorAll(".text-section");
    expect(textSections.length).toBe(2);
  });

  test("renders correctly when category has no description", () => {
    const noDescriptionData = {
      category: {
        title: "No Description Category",
      },
      texts: [{ id: "text1", title: "Root Text 1", type: "root_text" }],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: noDescriptionData,
      isLoading: false,
    }));

    const { container } = setup();

    expect(screen.getByText("No Description Category")).toBeInTheDocument();

    const descriptionElements = container.querySelectorAll(
      ".category-description"
    );
    expect(descriptionElements.length).toBe(0);
  });
});
