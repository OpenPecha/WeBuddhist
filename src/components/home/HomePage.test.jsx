
import React from "react";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import HomePage, {fetchTexts}  from "./HomePage.jsx";
import {vi} from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../config/axios-config.js";
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
  };
});

vi.mock("../../utils/Constants.js", () => ({
  getAlphabet: () => ["A", "B", "C", "T"],
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
}));

describe("HomePage Component", () => {
  const queryClient = new QueryClient();
  const mockTermsData = {
    terms: [
      { title: "content.title.words_of_buddha", description: "content.subtitle.words_of_buddha" },
      { title: "content.title.liturgy", description: "content.subtitle.prayers_rutuals" },
      { title: "content.title.Buddhavacana", description: "content.subtitle.buddhavacana" },
    ],
    total: 3,
    skip: 0,
    limit: 10
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ id: null });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTermsData,
      isLoading: false,
    }));
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo-IN");
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <HomePage />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("renders HomePage component", () => {
    setup();
    // General structure tests that should pass regardless of translation
    expect(document.querySelector(".homepage-container")).toBeInTheDocument();
    expect(document.querySelector(".left-section")).toBeInTheDocument();
    expect(document.querySelector(".right-section")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    
    setup();
    expect(screen.getByText("Loading content...")).toBeInTheDocument();
  });

  
  test("handles language selection correctly", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("en-US");
    
    const useQuerySpy = vi.spyOn(reactQuery, "useQuery");
    
    setup();
    
    // Check if useQuery was called
    expect(useQuerySpy).toHaveBeenCalled();
  });

  test("renders the browse section correctly", () => {
    setup();
    
    const browseSection = document.querySelector(".section-1");
    expect(browseSection).toBeInTheDocument();
    
    const heading = browseSection.querySelector("h2");
    expect(heading).toBeInTheDocument();
    
    const button = browseSection.querySelector("button");
    expect(button).toBeInTheDocument();
  });


  test("renders the content section correctly", () => {
    setup();
    
    const contentSection = document.querySelector(".section-2");
    expect(contentSection).toBeInTheDocument();
    
    // Check if the terms are rendered
    expect(contentSection.textContent).toContain("content.title.words_of_buddha");
    expect(contentSection.textContent).toContain("content.subtitle.words_of_buddha");
  });

  test("renders the about section correctly", () => {
    setup();
    
    const rightSection = document.querySelector(".right-section");
    expect(rightSection).toBeInTheDocument();
    
    const heading = rightSection.querySelector("h2");
    expect(heading).toBeInTheDocument();
    
    const divider = rightSection.querySelector("hr");
    expect(divider).toBeInTheDocument();
    
    const paragraph = rightSection.querySelector("p");
    expect(paragraph).toBeInTheDocument();
  });

  test("handles click on buttons without errors", () => {
    setup();
    
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    
    // Test that clicking doesn't throw errors
    buttons.forEach(button => {
      fireEvent.click(button);
      // No assertions needed - just checking that clicking doesn't crash
    });
  });

  test("renders correct number of terms from data", () => {
    const customTermsData = {
      terms: [
        { title: "Term 1", description: "Description 1" },
        { title: "Term 2", description: "Description 2" },
        { title: "Term 3", description: "Description 3" },
        { title: "Term 4", description: "Description 4" }, // This should not be rendered based on the slicing
      ],
      total: 4,
      skip: 0,
      limit: 10
    };
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: customTermsData,
      isLoading: false,
    }));
    
    setup();
    
    // Check rendered terms using querySelector for more reliable selection
    const termElements = document.querySelectorAll(".part-title");
    expect(termElements.length).toBe(3); // Should render exactly 3 terms
    
    expect(termElements[0].textContent).toBe("Term 1");
    expect(termElements[1].textContent).toBe("Term 2");
    expect(termElements[2].textContent).toBe("Term 3");
    
    // Fourth term should not be rendered
    const allTermContent = document.body.textContent;
    expect(allTermContent).not.toContain("Term 4");
  });

  test("handles async data loading correctly", async () => {
    // Create a mock implementation that changes over time
    let isLoadingValue = true;
    let dataValue = null;
    
    const useQueryMock = vi.fn().mockImplementation(() => ({
      data: dataValue,
      isLoading: isLoadingValue,
    }));
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation(useQueryMock);
    
    const { rerender } = setup();
    
    // Verify initial loading state
    expect(screen.getByText("Loading content...")).toBeInTheDocument();
    
    // Change loading state and data
    isLoadingValue = false;
    dataValue = mockTermsData;
    
    // Force re-render with new data
    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <HomePage />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    
    // Loading message should be gone after rerender
    expect(screen.queryByText("Loading content...")).not.toBeInTheDocument();
    
    // Content should be rendered
    const contentSection = document.querySelector(".section-2");
    expect(contentSection).toBeInTheDocument();
  });

  test("handles null data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    
    setup();
    
    // Component should render without errors
    const container = document.querySelector(".homepage-container");
    expect(container).toBeInTheDocument();
    
    // Section structure should still exist
    expect(document.querySelector(".section-1")).toBeInTheDocument();
    expect(document.querySelector(".section-2")).toBeInTheDocument();
    expect(document.querySelector(".right-section")).toBeInTheDocument();
  });

  test("fetches term with correct parameters", async () => {
    window.localStorage.getItem.mockReturnValue("en");
    axiosInstance.get.mockResolvedValueOnce({ data: mockTermsData });
    const parentId = "123";
    const result = await fetchTexts(parentId);
      expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/terms", {
      params: {
        language: "en",
        parent_id: "123",
        limit: 10,
        skip: 0
      }
    });
  
    expect(result).toEqual(mockTermsData);
  });
});

