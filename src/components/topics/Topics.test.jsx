import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import Topics from "./Topics.jsx";
import {vi} from "vitest";

mockAxios();
mockUseAuth()
mockReactQuery()

vi.mock("../../utils/Constants.js", () => ({
  getAlphabet: () => ["A", "B", "C", "T"],
  LANGUAGE: "LANGUAGE"
}));

describe("Topics Component", () => {

  const queryClient = new QueryClient();
  const mockTopicsData = {
    "topics": [
      {
        "id": "71adcc30-cfaa-4aee-9c1c-bda059a48e9e",
        "title": "Topic 1"
      },
      {
        "id": "5b8ed517-37c0-4daf-8ad9-a730c8d2f3ce",
        "title": "Topic 2"
      },
      {
        "id": "2fc5e913-3ed9-4e72-a630-b93d86a4ecfb",
        "title": "Topic 3"
      },
      {
        "id": "28d6e7bb-6bd3-41b0-9a72-474bfff146d3",
        "title": "Topic 4",
        "parent_id": {
          "id": "28d6e7bb-6bd3-41b0-9a72-474bfff146d3",
          "title": "Topic 4"
        }
      },
      {
        "id": "b87890b5-405a-41bf-8403-e06c7bad0ebb",
        "title": "Topic 5"
      }
    ]
  }

  beforeEach(() => {
    vi.spyOn(reactQuery, 'useQuery').mockImplementation(() => ({
      data: mockTopicsData,
      isLoading: false,
    }));
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue("bo-IN");
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <Topics />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders topics UI correctly", () => {
    setup();
    expect(screen.getByText("Topic 1")).toBeInTheDocument();
    expect(screen.getByText("Topic 2")).toBeInTheDocument();
    expect(screen.getByText("Topic 3")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, 'useQuery').mockImplementation(() => ({ 
      data: null, 
      isLoading: true 
    }));
    setup();
    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  test("filters topics based on search input", () => {
    setup();
    const searchInput = screen.getByPlaceholderText("Search topics...");
    fireEvent.change(searchInput, { target: { value: "Topic 1" } });
    expect(screen.getByText("Topic 1")).toBeInTheDocument();
    expect(screen.queryByText("Topic 2")).not.toBeInTheDocument();
  });

  test("filters topics by selected letter", () => {
    setup();
    const letterButton = screen.getByText("T");
    fireEvent.click(letterButton);
    expect(screen.getByText("Topic 1")).toBeInTheDocument();
  });

  test("clears selected letter filter", () => {
    setup();
    const letterButton = screen.getByText("T");
    fireEvent.click(letterButton);
    fireEvent.click(screen.getByText("clear"));
    expect(screen.getByText("Topic 1")).toBeInTheDocument();
    expect(screen.getByText("Topic 5")).toBeInTheDocument();
  });
})