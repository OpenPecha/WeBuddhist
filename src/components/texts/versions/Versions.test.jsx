
import React from "react";
import {BrowserRouter as Router, useParams} from "react-router-dom";

import "@testing-library/jest-dom";
import { mockTolgee } from "../../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import Versions from "./Versions.jsx";
import { vi } from "vitest";

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

describe("Versions Component", () => {
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

  const mockSetVersionsPagination = vi.fn();

  const defaultProps = {
    textId: "123",
    versions: mockVersionsData,
    versionsIsLoading: false,
    versionsIsError: null,
    versionsPagination: { currentPage: 1, limit: 10 },
    setVersionsPagination: mockSetVersionsPagination,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ id: "123" });
  });

  const setup = (props = {}) => {
    const mergedProps = {
      ...defaultProps,
      ...props
    };

    return render(
      <Router>
        <TolgeeProvider
          fallback={"Loading tolgee..."}
          tolgee={mockTolgee}
        >
          <Versions {...mergedProps} />
        </TolgeeProvider>
      </Router>
    );
  };

  describe("Component rendering", () => {

    test("displays loading state when data is loading", () => {
      setup({ 
        versionsIsLoading: true, 
        versions: null 
      });

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("displays error state when there's an error", () => {
      setup({ 
        versionsIsError: new Error("API Error"), 
        versions: null 
      });

      expect(screen.getByText("Error occurred")).toBeInTheDocument();
    });

    test("displays correct language translations", () => {
      setup();

      const languageElements = document.querySelectorAll(".version-language p");
      expect(languageElements).toHaveLength(3);

      expect(languageElements[0].textContent).toBe("language.tibetan");
      expect(languageElements[1].textContent).toBe("language.english");
      expect(languageElements[2].textContent).toBe("language.sanskrit");
    });

    test("displays not found message when no versions exist", () => {
      setup({ 
        versions: { versions: [], total: 0 } 
      });

      expect(screen.getByText("text.version.notfound")).toBeInTheDocument();
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
        versions: {
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

      expect(mockSetVersionsPagination).toHaveBeenCalledWith(expect.any(Function));
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

      setup({ versions: versionsData });

      // With 25 versions and limit of 10, should have 3 pages
      const paginationComponent = document.querySelector(".pagination");
      expect(paginationComponent).toBeInTheDocument();
    });

    test("handles empty versions array", () => {
      setup({
        versions: {
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

    test("uses textId from props when provided", () => {
      setup({ textId: "prop-123" });

      expect(document.querySelector(".versions-container")).toBeInTheDocument();
    });

    test("uses textId from URL params when prop not provided", () => {
      useParams.mockReturnValue({ id: "url-456" });
      
      setup({ textId: undefined });

      expect(document.querySelector(".versions-container")).toBeInTheDocument();
    });
  });

  describe("Version metadata rendering", () => {
    test("renders version source and source_url when available", () => {
      const versionsWithMetadata = {
        versions: [
          {
            id: "version1",
            title: "Version 1",
            language: "bo",
            table_of_contents: ["content1"],
            source_link: "Test Source",
            license: "CC BY 4.0"
          }
        ]
      };

      setup({ versions: versionsWithMetadata });

      expect(screen.getByText("Source:")).toBeInTheDocument();
      expect(screen.getByText("Test Source")).toBeInTheDocument();
      expect(screen.getByText("License:")).toBeInTheDocument();
      expect(screen.getByText("CC BY 4.0")).toBeInTheDocument();
    });
  });

  describe("addChapter mode", () => {
    test("calls addChapter when button is clicked", () => {
      const mockAddChapter = vi.fn();
      const mockCurrentChapter = { id: "chapter1" };

      setup({
        addChapter: mockAddChapter,
        currentChapter: mockCurrentChapter
      });

      const button = document.querySelector(".version-title-button");
      fireEvent.click(button);

      expect(mockAddChapter).toHaveBeenCalledWith(
        {
          textId: "version1",
          contentId: "content1"
        },
        mockCurrentChapter
      );
    });
  });
});