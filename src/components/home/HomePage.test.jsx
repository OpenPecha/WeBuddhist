import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import HomePage from "./HomePage.jsx";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

mockAxios();
mockUseAuth()
mockReactQuery()
describe("HomePage Component", () => {

  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <HomePage/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };
  beforeEach(() => {
    useQuery.mockImplementation(() => ({
      data: {
        terms: [{
          "id": "67b9a7b0ff90db7fb4ac8207",
          "title": "Liturgy",
          "description": "Prayers and rituals",
          "slug": "Liturgy",
          "has_child": false
        }]
      },
      isLoading: false,
    }));
  });
  test("renders titles", () => {
    setup();
    expect(screen.getByText("Browse the Library")).toBeInTheDocument();
    expect(screen.getByText("Explore Collections")).toBeInTheDocument();
    expect(screen.getByText("A Living Library of Buddhist Text")).toBeInTheDocument();
    expect(screen.getByText("Pecha connects users to Buddhist scriptures in various languages. Search a verse to explore its origins, interpretations, and related texts. Engage with the community by sharing insights and learning from others through sheets and topics.")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });
  test("renders sub titles  ", () => {
    setup();

    expect(screen.getByText("Liturgy")).toBeInTheDocument();
    expect(screen.getByText("Prayers and rituals")).toBeInTheDocument();
  });
});
