import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import * as reactQuery from "react-query";
import axiosInstance from "../../config/axios-config.js";
import {render, screen, fireEvent} from "@testing-library/react";
import {TolgeeProvider} from "@tolgee/react";
import React from "react";
import Texts, { fetchVersions } from "./Texts.jsx";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("./versions/Versions.jsx", () => ({
  default: () => <div data-testid="versions-component">Versions Component</div>
}));

vi.mock("./table-of-contents/TableOfContents.jsx", () => ({
  default: () => <div data-testid="table-of-content-component">Table of Contents Component</div>
}));

vi.mock("../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  getLanguageClass: () => "language-class",
  getEarlyReturn: ({ isLoading, error, t }) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error occurred</div>;
    return null;
  }
}));

vi.mock("../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: () => [new URLSearchParams("?type=works"), vi.fn()]
  };
});

describe("Texts Component", () => {
  const queryClient = new QueryClient();
  const mockVersionsData = {
    text: {
      id: "text-123",
      title: "Test Title",
      language: "bo"
    },
    versions: [
      { id: "v1", title: "Version 1", language: "bo", table_of_contents: ["c1"] }
    ]
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockVersionsData,
      isLoading: false,
      error: null
    }));
    Storage.prototype.getItem = vi.fn().mockReturnValue("bo-IN");
    axiosInstance.get.mockResolvedValue({ data: mockVersionsData });
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Texts />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders tabs correctly", () => {
    setup();
    expect(screen.getByText("Table of Contents Component")).toBeInTheDocument();
    const buttons = document.querySelectorAll('.tab-button');
    expect(buttons[0]).toHaveTextContent("Content")
    expect(buttons[1]).toHaveTextContent("Version")
  });

  test("renders child components", () => {
    setup();
    expect(screen.getByTestId("table-of-content-component")).toBeInTheDocument();
  });

  test("renders versions tab when clicked", () => {
    setup();
    const buttons = document.querySelectorAll('.tab-button');
    fireEvent.click(buttons[1]);
    expect(screen.getByTestId("versions-component")).toBeInTheDocument();
  });

  test("displays loading state implicitly", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null
    }));
    setup();
    expect(screen.getByText("Loading..."));
  });

  test("renders download button", () => {
    setup();
    expect(screen.getByText("Download Text")).toBeInTheDocument();
  });

  test("renders continue reading button", () => {
    setup();
    expect(screen.getByText("Continue Reading")).toBeInTheDocument();
  });

  test("fetchVersions calls axios with correct params and returns data", async () => {
    const mockData = { foo: "bar" };
    const mockId = "test-id";
    const mockLimit = 5;
    const mockSkip = 10;
    Storage.prototype.getItem = vi.fn().mockReturnValue("bo-IN");
    const mapLanguageCode = vi.fn().mockReturnValue("bo");
    vi.doMock("../../utils/helperFunctions.jsx", () => ({
      mapLanguageCode,
    }));
    axiosInstance.get.mockResolvedValueOnce({ data: mockData });

    const result = await fetchVersions(mockId, mockLimit, mockSkip);
    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/texts/${mockId}/versions`, {
      params: {
        language: "bo",
        limit: mockLimit,
        skip: mockSkip,
      },
    });
    expect(result).toEqual(mockData);
  });
});