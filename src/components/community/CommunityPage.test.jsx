import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider, useQuery} from "react-query";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import CommunityPage from "./CommunityPage.jsx";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

mockAxios();
mockUseAuth();
mockReactQuery();

describe("CommunityPage Component", () => {
  const queryClient = new QueryClient();
  
  const mockSheetsData = {
    sheets: [
      {
        id: "1",
        title: "Test Sheet Title",
        summary: "This is a test sheet summary",
        publisher: {
          name: "Test User",
          image_url: "https://example.com/image.jpg"
        },
        published_time: "2 days ago"
      },
      {
        id: "2",
        title: "Another Sheet",
        summary: "Another test summary content",
        publisher: {
          name: "John Doe",
          image_url: null
        },
        published_time: "5 hours ago"
      }
    ]
  };

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <CommunityPage />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  beforeEach(() => {
    useQuery.mockImplementation(() => ({
      data: mockSheetsData,
      isLoading: false,
    }));
  });

  test("renders main community page structure", () => {
    setup();
    expect(screen.getByText("Recently Published")).toBeInTheDocument();
    expect(screen.getByText("Who to Follow")).toBeInTheDocument();
    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText(/Organizations, communities and individuals/)).toBeInTheDocument();
    expect(screen.getByText("Explore Collections")).toBeInTheDocument();
    expect(screen.getByText(/Combine sources from our library/)).toBeInTheDocument();
    expect(screen.getByText("Make a Sheet")).toBeInTheDocument();
  });

  test("renders sheet items correctly", () => {
    setup();
    expect(screen.getByText("Test Sheet Title")).toBeInTheDocument();
    expect(screen.getByText("This is a test sheet summary")).toBeInTheDocument();
    expect(screen.getByText("Another Sheet")).toBeInTheDocument();
    expect(screen.getByText("Another test summary content")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
    expect(screen.getByText("5 hours ago")).toBeInTheDocument();
  });

  test("renders publisher image when available", () => {
    setup();
    const publisherImage = screen.getByAltText("Test User");
    expect(publisherImage).toBeInTheDocument();
    expect(publisherImage).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  test("renders initials avatar when publisher image is not available", () => {
    setup();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  test("shows loading state when fetching data", () => {
    useQuery.mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    
    setup();
    expect(screen.getByText("Loading sheets...")).toBeInTheDocument();
  });

  test("handles empty sheets data", () => {
    useQuery.mockImplementation(() => ({
      data: { sheets: [] },
      isLoading: false,
    }));
    
    setup();
    expect(screen.queryByText("Test Sheet Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading sheets...")).not.toBeInTheDocument();
  });
});