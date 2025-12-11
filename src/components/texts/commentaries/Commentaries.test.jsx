import React from "react";
import { vi } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { TolgeeProvider } from "@tolgee/react";
import "@testing-library/jest-dom";
import { mockTolgee, mockLocalStorage } from "../../../test-utils/CommonMocks.js";
import Commentaries from "./Commentaries.jsx";

let localStorageMock;

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
  mapLanguageCode: () => "en",
  getEarlyReturn: ({ isLoading, error }) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error occurred</div>;
    return null;
  },
}));

vi.mock("../../commons/pagination/PaginationComponent.jsx", () => ({
  default: ({ handlePageChange }) => (
    <div className="pagination">
      <button className="page-link" onClick={() => handlePageChange(2)}>
        2
      </button>
    </div>
  ),
}));

describe("Commentaries Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue(null);
  });
  const defaultProps = {
    items: [
      { id: "c1", title: "Commentary 1", language: "bo" },
      { id: "c2", title: "Commentary 2", language: "en" },
    ],
    isLoading: false,
    isError: null,
    pagination: { currentPage: 1, limit: 10 },
    setPagination: vi.fn(),
  };

  const setup = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(
      <Router>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <Commentaries {...mergedProps} />
        </TolgeeProvider>
      </Router>
    );
  };

  test("renders items with language labels", () => {
    setup();

    expect(document.querySelector(".commentaries-container")).toBeInTheDocument();

    const items = document.querySelectorAll(".commentary-details");
    expect(items).toHaveLength(2);

    const languageLabels = document.querySelectorAll(".commentary-language p");
    expect(languageLabels).toHaveLength(2);
    expect(languageLabels[0].textContent).toBe("language.tibetan");
    expect(languageLabels[1].textContent).toBe("language.english");
  });

  test("displays loading state when isLoading is true", () => {
    setup({ isLoading: true, items: null });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("shows not found message when no items are present", () => {
    setup({ items: [] });
    expect(screen.getByText("global.not_found")).toBeInTheDocument();
  });
});
