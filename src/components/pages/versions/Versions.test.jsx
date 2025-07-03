import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Versions from "./Versions.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import {getLanguageClass} from "../../../utils/helperFunctions.jsx";

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

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang) => `language-${lang}`,
}));

describe("Versions Component", () => {
  const queryClient = new QueryClient();
  const mockVersionsData = {
    versions: [
      {
        id: "version1",
        title: "Version 1 Title",
        language: "bo",
        table_of_contents: ["content1"]
      },
      {
        id: "version2",
        title: "Version 2 Title",
        language: "en",
        table_of_contents: ["content2"]
      },
      {
        id: "version3",
        title: "Version 3 Title",
        language: "sa",
        table_of_contents: ["content3"]
      }
    ],
    total: 3,
    skip: 0,
    limit: 10
  };

  const mockPagination = { currentPage: 1, limit: 10 };
  const mockSetPagination = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const setup = (props = {}) => {
    const defaultProps = {
      versionsData: mockVersionsData,
      pagination: mockPagination,
      setPagination: mockSetPagination,
      ...props
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <Versions {...defaultProps} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders Versions component with version data", () => {
    setup();
    
    // Check if the versions container is rendered
    expect(document.querySelector(".versions-container")).toBeInTheDocument();
    
    // Check if all versions are rendered
    const versionElements = document.querySelectorAll(".version");
    expect(versionElements.length).toBe(3);
    
    // Check if version titles are rendered correctly
    const titleElements = document.querySelectorAll(".titleversion");
    expect(titleElements[0].textContent).toBe("Version 1 Title");
    expect(titleElements[1].textContent).toBe("Version 2 Title");
    expect(titleElements[2].textContent).toBe("Version 3 Title");
    
    // Check if language classes are applied correctly
    expect(titleElements[0].classList.contains("language-bo")).toBe(true);
    expect(titleElements[1].classList.contains("language-en")).toBe(true);
    expect(titleElements[2].classList.contains("language-sa")).toBe(true);
  });

  test("displays loading message when versionsData is null", () => {
    setup({ versionsData: null });
    
    const loadingMessage = screen.getByText("Loading versions...");
    expect(loadingMessage).toBeInTheDocument();
  });


  test("renders pagination component when versions exist", () => {
    setup();
    
    const paginationComponent = document.querySelector(".pagination");
    expect(paginationComponent).toBeInTheDocument();
  });

  test("does not render pagination component when no versions exist", () => {
    setup({ 
      versionsData: { 
        versions: [] 
      } 
    });
    
    const paginationComponent = document.querySelector(".pagination");
    expect(paginationComponent).not.toBeInTheDocument();
  });

  test("calls setPagination when page is changed", () => {
    setup();
    
    // Find and click on a page number button
    const pageButton = document.querySelector(".page-link");
    fireEvent.click(pageButton);
    
    // Check if setPagination was called
    expect(mockSetPagination).toHaveBeenCalled();
  });

  test("renders correct links for each version", () => {
    setup();
    
    const links = document.querySelectorAll(".section-title");
    expect(links.length).toBe(3);
    
    expect(links[0].getAttribute("href")).toBe(
      "/chapter?text_id=version1&contentId=content1&versionId=version1&contentIndex=0"
    );
  });

  test("displays correct language for each version", () => {
    setup();
    
    const languageElements = document.querySelectorAll(".version-language p");
    expect(languageElements.length).toBe(3);
    
    expect(languageElements[0].textContent).toBe("language.tibetan");
    expect(languageElements[1].textContent).toBe("language.english");
    expect(languageElements[2].textContent).toBe("language.sanskrit");
  });
});
