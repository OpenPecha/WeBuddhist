import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth, mockLocalStorage } from "../../test-utils/CommonMocks.js";
import * as reactQuery from "react-query";

import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";

import "@testing-library/jest-dom";
import Topics, {fetchTopics} from "./Topics.jsx";
import { vi } from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import axiosInstance from "../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: () => "en"
}));

describe("Topics Component", () => {
  const queryClient = new QueryClient();

  const mockTopicsData = {
    topics: [
      {id: "67b9933f1ab71ec4d4a06ab6", title: "Happiness", has_child: true},
      {id: "67b9996e1ab71ec4d4a06ab8", title: "Kindness", has_child: true},
      {id: "67b99a361ab71ec4d4a06abb", title: "Patience", has_child: true},
    ],
  };

  let localStorageMock;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("en");
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTopicsData,
      isLoading: false,
    }));
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Topics/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders topics UI correctly", () => {
    setup();
    expect(screen.getByText("Explore by Topic")).toBeInTheDocument()
    expect(screen.getByText("Happiness")).toBeInTheDocument();
    expect(screen.getByText("Kindness")).toBeInTheDocument();
    expect(screen.getByText("Patience")).toBeInTheDocument();
    expect(screen.getByText("Browse or search out complete list of topics.")).toBeInTheDocument()
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    setup();
    expect(screen.getByText("Loading topics...")).toBeInTheDocument();
  });

  test("filters topics based on search input", () => {
    setup();
    expect(document.querySelector('.pagination-container')).toBeInTheDocument();
    fireEvent.click(screen.getByText("All Topics A-Z"));
    const searchInput = screen.getByPlaceholderText("Search topics...");
    expect(document.querySelector('.pagination-container')).not.toBeInTheDocument();
    fireEvent.change(searchInput, {target: {value: "Patience"}});
    expect(screen.getByText("Patience")).toBeInTheDocument();
  });

  test("filters topics by selected letter", () => {
    setup();
    fireEvent.click(screen.getByText("All Topics A-Z"));
    const letterButton = screen.getByText("H");
    fireEvent.click(letterButton);

    expect(screen.getByText("Happiness")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Happiness"))

  });

  test("clears selected letter filter", async () => {
    setup();
    fireEvent.click(screen.getByText("All Topics A-Z"));
    const letterButton = screen.getByText("H");
    fireEvent.click(letterButton);
    fireEvent.click(screen.getByText("topic.clear"));

    expect(screen.getByPlaceholderText("Search topics...")).toBeInTheDocument()
  });

  test("back button", () => {
    setup();
    fireEvent.click(screen.getByText("All Topics A-Z"));
    const backButton = screen.getByText("Back");
    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton)
    expect(screen.getByText("All Topics A-Z")).toBeInTheDocument()
  })

  test("topics information card", () => {
    setup();
    expect(screen.getByText("Topic Information")).toBeInTheDocument()
    expect(screen.getByText("Details about the selected topic will be displayed here.")).toBeInTheDocument()
  })

  test("fetches topics with correct parameters", async () => {
    localStorageMock.getItem.mockReturnValue("en");
    axiosInstance.get.mockResolvedValueOnce({ data: mockTopicsData });
    const result = await fetchTopics("123", "Kind", 10, 0, true);

    expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/topics", {
      params: {
        language: "en",
        parent_id: "123",
        search: "Kind",
        limit: 10,
        skip: 0,
        hierarchy: true
      }
    });

    expect(result).toEqual(mockTopicsData);
  });
});

