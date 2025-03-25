import { TolgeeProvider } from "@tolgee/react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../../config/axios-config.js";
import Content, { fetchTextContent } from "./Content.jsx";
import { BrowserRouter as Router, useParams } from "react-router-dom";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../../utils/Constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: () => "bo"
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe("Content Component", () => {
  const queryClient = new QueryClient();
  const mockContentData = {
    contents: [
      {
        id: "abh7u8e4-da52-4ea2-800e-3414emk8uy67",
        text_id: "123",
        segments: [
          {
            id: "segment1",
            title: "Section 1",
            sections: [
              {
                id: "section1-1",
                title: "Subsection 1.1",
                sections: [
                  {
                    id: "section1-1-1",
                    title: "Subsection 1.1.1",
                    sections: []
                  }
                ]
              },
              {
                id: "section1-2",
                title: "Subsection 1.2",
                sections: []
              }
            ]
          },
          {
            id: "segment2",
            title: "Section 2",
            sections: []
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockContentData,
      isLoading: false,
    }));
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo");
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Content />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the component with content data", () => {
    setup();
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
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
      error: { message: "Failed to fetch content" }
    }));
    setup();
    expect(screen.getByText("Error loading content: Failed to fetch content")).toBeInTheDocument();
  });

  test("displays message when no content is found", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: { segments: [] },
      isLoading: false,
    }));
    setup();
    expect(screen.getByText("No content found")).toBeInTheDocument();
  });

  test("fetches text content with correct parameters", async () => {
    window.localStorage.getItem.mockReturnValue("en");

    axiosInstance.get.mockResolvedValueOnce({ data: mockContentData });
    const result = await fetchTextContent("123");

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/texts/123/contents", {
      params: {
        language: "bo",
        limit: 10,
        skip: 0,
      }
    });

    expect(result).toEqual(mockContentData);
  });

  test("handles error in fetchTextContent and logs error message", async () => {
    const mockError = new Error("Network error");
    axiosInstance.get.mockRejectedValueOnce(mockError);
    
    const result = await fetchTextContent("123");
    
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching text content:",
      mockError
    );
    
    expect(result).toEqual({ contents: [] });
  });

  test("handles different types of errors in fetchTextContent", async () => {
    const testCases = [
      new TypeError("Type error"),
      new Error("Network error"),
      { message: "API error" },
      "String error"
    ];

    for (const error of testCases) {
      console.error.mockClear();
      axiosInstance.get.mockRejectedValueOnce(error);
      
      const result = await fetchTextContent("123");
      
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching text content:",
        error
      );
      
      expect(result).toEqual({ contents: [] });
    }
  });

  test("handles error in fetchTextContent with missing error message", async () => {
    const mockError = {};
    axiosInstance.get.mockRejectedValueOnce(mockError);
    
    const result = await fetchTextContent("123");
    
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching text content:",
      mockError
    );
    
    expect(result).toEqual({ contents: [] });
  });

  test("does not render pagination component when no segments exist", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: { segments: [] },
      isLoading: false,
    }));
    setup();
    expect(screen.queryByTestId("pagination-component")).not.toBeInTheDocument();
  });


});