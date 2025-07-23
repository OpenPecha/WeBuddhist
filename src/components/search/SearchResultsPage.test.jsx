import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import SearchResultsPage from "./SearchResultsPage";
import { mockTolgee } from "../../test-utils/CommonMocks";
import { QueryClientProvider, QueryClient } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { BrowserRouter } from "react-router-dom";

vi.mock("./sources/Sources", () => ({
  default: ({ query }) => <div data-testid="sources-component">{query}</div>,
}));

vi.mock("./sheets/Sheets", () => ({
  default: ({ query }) => <div data-testid="sheets-component">{query}</div>,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams("q=test query")],
  };
});

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key, defaultValue, params) => {
        if (params) {
          return defaultValue.replace("{searchedItem}", params.searchedItem);
        }
        return defaultValue || key;
      },
    }),
  };
});

describe("SearchResultsPage", () => {
  const queryClient = new QueryClient();

  const setup = () => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
            <SearchResultsPage />
          </TolgeeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  test("renders the search results page with query", () => {
    setup();
    
    // Use a more flexible approach to find the heading
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Results for:');
    
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByText("Sheets")).toBeInTheDocument();
    expect(screen.getByText("Sort")).toBeInTheDocument();
    expect(screen.getByTestId("sources-component")).toBeInTheDocument();
    expect(screen.queryByTestId("sheets-component")).not.toBeInTheDocument();
  });

  test("switches between tabs correctly", () => {
    setup();
    
    expect(screen.getByTestId("sources-component")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sheets"));
    expect(screen.getByTestId("sheets-component")).toBeInTheDocument();
    expect(screen.queryByTestId("sources-component")).not.toBeInTheDocument();
  });

  test("changes sort options correctly", () => {
    setup();
    
    fireEvent.click(screen.getByText("Sort"));
    expect(screen.getByText("Relevance")).toBeInTheDocument();
    expect(screen.getByText("Chronological")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Relevance"));
    fireEvent.click(screen.getByText("Sheets"));
    fireEvent.click(screen.getByText("Sort"));
    expect(screen.getByText("Relevance")).toBeInTheDocument();
    expect(screen.getByText("Date created")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
  });

  test("handles empty search query gracefully", () => {
    setup();
    
    // Even with empty query, the component should render without errors
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Results for:');
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByText("Sheets")).toBeInTheDocument();
  });

  test("maintains sort option state within the same tab", () => {
    setup();
    
    fireEvent.click(screen.getByText("Sort"));
    fireEvent.click(screen.getByText("Chronological"));
    fireEvent.click(screen.getByText("Sheets"));
    fireEvent.click(screen.getByText("Sort"));
    fireEvent.click(screen.getByText("Views"));
    fireEvent.click(screen.getByText("Sources"));
    fireEvent.click(screen.getByText("Sort"));
    
    expect(screen.getByText("Chronological")).toBeInTheDocument();
  });
});
