
import {TolgeeProvider} from "@tolgee/react";
import {render, screen} from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import axiosInstance from "../../../config/axios-config.js";
import Versions, {fetchVersions} from "./Versions.jsx";
import {BrowserRouter as Router, useParams} from "react-router-dom";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../../utils/Constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: () => "en",
  getLanguageClass: (language) => {
    switch (language) {
      case "bo":
        return "bo-text";
      case "en":
        return "en-text";
      case "sa":
        return "bo-text";
      default:
        return "en-text";
    }
  }
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe("Versions Component", () => {
  const queryClient = new QueryClient()
  const mockVersionsData = {
    versions : [
      {
        "id": "uuid.v4",
        "title": "शबोधिचर्यावतार[sa]",
        "parent_id": "d19338e",
        "priority": 1,
        "language": "sa",
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid.v4",
        "title": "བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པ།",
        "parent_id": "d19338e",
        "priority": 2,
        "language": "bo",
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      },
      {
        "id": "uuid.v4",
        "title": "The Way of the Bodhisattva Monlam AI Draft",
        "parent_id": "d19338e",
        "priority": 3,
        "language": "en",
        "type": "translation",
        "is_published": true,
        "created_date": "2021-09-01T00:00:00.000Z",
        "updated_date": "2021-09-01T00:00:00.000Z",
        "published_date": "2021-09-01T00:00:00.000Z",
        "published_by": "buddhist_tab"
      }
    ]
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockVersionsData,
      isLoading: false,
    }));
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("en");
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Versions/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("render the component", () =>{
    setup();
    expect(screen.getByText("शबोधिचर्यावतार[sa]")).toBeInTheDocument()
    expect(screen.getByText("བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པ།")).toBeInTheDocument()
    expect(screen.getByText("The Way of the Bodhisattva Monlam AI Draft")).toBeInTheDocument()
    expect(screen.getByText("Sanskrit")).toBeInTheDocument()
    expect(screen.getByText("Tibetan")).toBeInTheDocument()
    expect(screen.getByText("English")).toBeInTheDocument()
  })

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    setup();
    expect(screen.getByText("Loading versions...")).toBeInTheDocument();
  });

  test("fetches versions with correct parameters", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockVersionsData });
    const result = await fetchVersions("123", 10, 0);

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/texts/123/versions", {
      params: {
        language: "en",
        limit: 10,
        skip: 0,
      }
    });

    expect(result).toEqual(mockVersionsData);
  });
})