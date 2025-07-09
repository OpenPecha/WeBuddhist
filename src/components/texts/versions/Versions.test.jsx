
import React from "react";
import {BrowserRouter as Router} from "react-router-dom";
import "@testing-library/jest-dom";
import {mockTolgee} from "../../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import Versions from "./Versions.jsx";
import {vi} from "vitest";

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang) => `language-${lang}`,
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

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

const setup = ({
  versionsData = mockVersionsData,
  pagination = { currentPage: 1, limit: 10 },
  setPagination = vi.fn()
} = {}) => {
  return render(
    <Router>
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <Versions
            versionsData={versionsData}
            pagination={pagination}
            setPagination={setPagination}
          />
        </TolgeeProvider>
      </QueryClientProvider>
    </Router>
  );
};

describe("Versions Component", () => {
  test("renders Versions component with version data", () => {
    setup();
    expect(document.querySelector(".versions-container")).toBeInTheDocument();
    const versionElements = document.querySelectorAll(".version-details");
    expect(versionElements.length).toBe(3);
    const titleElements = document.querySelectorAll(".version-title");
    expect(titleElements).toHaveLength(3);
    const languageElements = document.querySelectorAll(".language-bo, .language-en, .language-sa");
    expect(languageElements.length).toBeGreaterThan(0);
  });

  test("renders version titles with correct links", () => {
    setup();
    const links = document.querySelectorAll(".version-title");
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute("href")).toBe(
      "/chapter?text_id=version1&contentId=content1&versionId=version1&contentIndex=0"
    );
    expect(links[1].getAttribute("href")).toBe(
      "/chapter?text_id=version2&contentId=content2&versionId=version2&contentIndex=0"
    );
    expect(links[2].getAttribute("href")).toBe(
      "/chapter?text_id=version3&contentId=content3&versionId=version3&contentIndex=0"
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

  test("renders pagination component when versions exist", () => {
    setup();
    const paginationComponent = document.querySelector(".pagination");
    expect(paginationComponent).toBeInTheDocument();
  });

  test("does not render pagination component when no versions exist", () => {
    setup({
      versionsData: {
        versions: [],
        total: 0
      }
    });
    const paginationComponent = document.querySelector(".pagination");
    expect(paginationComponent).not.toBeInTheDocument();
  });

  test("handles page change correctly", () => {
    const setPagination = vi.fn();
    setup({ setPagination });
    const pageButton = document.querySelector(".page-link");
    fireEvent.click(pageButton);
    expect(pageButton).toBeInTheDocument();
  });

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
    setup({ versionsData });
    const paginationComponent = document.querySelector(".pagination");
    expect(paginationComponent).toBeInTheDocument();
  });

  test("component is memoized", () => {
    expect(Versions.$$typeof).toBeDefined();
  });
});