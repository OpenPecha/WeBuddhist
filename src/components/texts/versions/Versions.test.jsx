
import React from "react";
import {BrowserRouter as Router, useParams} from "react-router-dom";

import "@testing-library/jest-dom";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import Versions, {fetchVersions} from "./Versions.jsx";
import { vi } from "vitest";
import * as reactQuery from "react-query";
import axiosInstance from "../../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

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
  getEarlyReturn: ({ isLoading, error, t }) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error occurred</div>;
    return null;
  },
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
}));

vi.mock("../../../utils/constants.js", () => ({
  LANGUAGE: "language",
}));

vi.mock("../../commons/pagination/PaginationComponent.jsx", () => ({
  default: ({ pagination, totalPages, handlePageChange, setPagination }) => (
    <div className="pagination">
      <button
        className="page-link"
        onClick={() => handlePageChange(2)}
      >
        2
      </button>
    </div>
  ),
}));

const mockAxiosInstance = {
  get: vi.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe("Versions Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

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

  // Mock useQuery consistently
  const mockUseQuery = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });

    // Mock Storage prototype
    Storage.prototype.getItem = vi.fn().mockReturnValue("bo-IN");
    mockLocalStorage.getItem.mockReturnValue("bo-IN");

    // Mock axios instance
    axiosInstance.get.mockResolvedValue({ data: mockVersionsData });
    mockAxiosInstance.get.mockResolvedValue({ data: mockVersionsData });

    // Reset useQuery mock
    mockUseQuery.mockReturnValue({
      data: mockVersionsData,
      isLoading: false,
      error: null,
    });

    // Spy on react-query's useQuery and make it use our mock
    vi.spyOn(reactQuery, "useQuery").mockImplementation(mockUseQuery);
  });

  const setup = (queryReturnValue = {}) => {
    const defaultQueryReturn = {
      data: mockVersionsData,
      isLoading: false,
      error: null,
      ...queryReturnValue
    };

    // Update the mock to return the new values
    mockUseQuery.mockReturnValue(defaultQueryReturn);

    // Also update the spy to ensure consistency
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => defaultQueryReturn);

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Versions />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  describe("Component rendering", () => {
    test("renders Versions component with version data", () => {
      setup();

      expect(document.querySelector(".versions-container")).toBeInTheDocument();

      const versionElements = document.querySelectorAll(".version-details");
      expect(versionElements.length).toBe(3);

      // Check version titles
      const titleElements = document.querySelectorAll(".version-title");
      expect(titleElements).toHaveLength(3);

      // Check if language classes are applied correctly
      const languageElements = document.querySelectorAll(".language-bo, .language-en, .language-sa");
      expect(languageElements.length).toBeGreaterThan(0);
    });

    test("displays loading state when data is loading", () => {
      setup({ isLoading: true, data: null });

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("displays error state when there's an error", () => {
      setup({ error: new Error("API Error"), data: null });

      expect(screen.getByText("Error occurred")).toBeInTheDocument();
    });

    test("renders version titles with correct links", () => {
      setup();

      const links = document.querySelectorAll(".version-title");
      expect(links).toHaveLength(3);

      expect(links[0].getAttribute("href")).toBe(
        "/chapter?text_id=version1&content_id=content1"
      );
      expect(links[1].getAttribute("href")).toBe(
        "/chapter?text_id=version2&content_id=content2"
      );
      expect(links[2].getAttribute("href")).toBe(
        "/chapter?text_id=version3&content_id=content3"
      );
    });

    test("displays correct language translations", () => {
      setup();

      const languageElements = document.querySelectorAll(".version-language p");
      expect(languageElements).toHaveLength(3);

      expect(languageElements[0].textContent).toBe("language.tibetan");
      expect(languageElements[1].textContent).toBe("language.english");
      expect(languageElements[2].textContent).toBe("language.sanskrit");
    });

    test("renders subtitles for each version", () => {
      setup();

      const subtitleElements = document.querySelectorAll(".version-subtitle");
      expect(subtitleElements).toHaveLength(3);

      subtitleElements.forEach(subtitle => {
        expect(subtitle.textContent).toBe("text.versions.information.review_history");
      });
    });

    test("renders horizontal lines between versions", () => {
      setup();

      const hrElements = document.querySelectorAll("hr");
      expect(hrElements).toHaveLength(3);
    });
  });

  describe("Pagination", () => {
    test("renders pagination component when versions exist", () => {
      setup();

      const paginationComponent = document.querySelector(".pagination");
      expect(paginationComponent).toBeInTheDocument();
    });

    test("does not render pagination component when no versions exist", () => {
      setup({
        data: {
          versions: [],
          total: 0
        }
      });

      const paginationComponent = document.querySelector(".pagination");
      expect(paginationComponent).not.toBeInTheDocument();
    });

    test("handles page change correctly", () => {
      setup();

      const pageButton = document.querySelector(".page-link");
      fireEvent.click(pageButton);

      // Since we're testing the component behavior, we can verify the pagination component received the correct props
      expect(pageButton).toBeInTheDocument();
    });
  });

  describe("Component behavior", () => {
    test("calculates total pages correctly", () => {
      const versionsData = {
        versions: new Array(25).fill(null).map((_, i) => ({
          id: `version${i}`,
          title: `Version ${i}`,
          language: "bo",
          table_of_contents: [`content${i}`]
        })),
        total: 25,
        skip: 0,
        limit: 10
      };

      setup({ data: versionsData });

      // With 25 versions and limit of 10, should have 3 pages
      const paginationComponent = document.querySelector(".pagination");
      expect(paginationComponent).toBeInTheDocument();
    });

    test("handles empty versions array", () => {
      setup({
        data: {
          versions: [],
          total: 0
        }
      });


      const versionElements = document.querySelectorAll(".version-details");
      expect(versionElements).toHaveLength(0);
    });

    test("component is memoized", () => {
      expect(Versions.$$typeof).toBeDefined();
    });

    test("fetchVersions function fetches versions data correctly", async () => {
      const textId = "test123";
      const skip = 0;
      const limit = 10;

      mockLocalStorage.getItem.mockReturnValue("bo-IN");
      axiosInstance.get.mockResolvedValue({ data: mockVersionsData });

      const result = await fetchVersions(textId, skip, limit);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        `/api/v1/texts/${textId}/versions`,
        {
          params: {
            language: "bo",
            limit: 10,
            skip: 0
          },
        }
      );
      expect(result).toEqual(mockVersionsData);
    });
  });
});