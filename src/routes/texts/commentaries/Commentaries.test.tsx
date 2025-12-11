import { vi, describe, beforeEach, test, expect } from "vitest";
import { BrowserRouter as Router } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { TolgeeProvider } from "@tolgee/react";
import "@testing-library/jest-dom";
import {
  mockTolgee,
  mockLocalStorage,
} from "../../../test-utils/CommonMocks.js";
import Commentaries from "./Commentaries.js";

let localStorageMock;

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (lang: string) => `language-${lang}`,
  mapLanguageCode: () => "en",
  getEarlyReturn: ({
    isLoading,
    error,
  }: {
    isLoading: boolean;
    error: any;
  }) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error occurred</div>;
    return null;
  },
}));

vi.mock("../../commons/pagination/PaginationComponent.jsx", () => ({
  default: ({
    handlePageChange,
  }: {
    handlePageChange: (page: number) => void;
  }) => (
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
  const defaultProps: any = {
    items: [
      { id: "c1", title: "Commentary 1", language: "bo" as const },
      { id: "c2", title: "Commentary 2", language: "en" as const },
    ],
    isLoading: false,
    isError: null,
    pagination: { currentPage: 1, limit: 10 },
    setPagination: vi.fn(),
  };

  const setup = (props: any = {}) => {
    const mergedProps: any = { ...defaultProps, ...props };
    return render(
      <Router>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <Commentaries {...mergedProps} />
        </TolgeeProvider>
      </Router>,
    );
  };

  test("renders items with language labels", () => {
    setup();

    expect(screen.getByText("Commentary 1")).toBeInTheDocument();
    expect(screen.getByText("Commentary 2")).toBeInTheDocument();

    expect(screen.getByText("language.tibetan")).toBeInTheDocument();
    expect(screen.getByText("language.english")).toBeInTheDocument();
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
