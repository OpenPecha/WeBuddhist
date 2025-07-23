import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import * as reactQuery from "@tanstack/react-query";
import axiosInstance from "../../config/axios-config.js";
import {render, screen} from "@testing-library/react";
import {TolgeeProvider} from "@tolgee/react";
import React from "react";
import Texts, {fetchTableOfContents} from "./Texts.jsx";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("./versions/Versions.jsx", () => ({
  default: () => <div data-testid="versions-component">Versions Component</div>
}));

vi.mock("./table-of-contents/TableOfContents.jsx", () => ({
  default: ({ error, loading, t, ...rest }) => <div data-testid="table-of-content-component">Table of Contents Component</div>
}));

vi.mock("../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  getLanguageClass: () => "language-class",
  getEarlyReturn: () => ""
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
  const mockTextDetailData = {
    text_detail: {
      title: "Test Title",
      type: "Test Type"
    },
    contents:[{
      id:"sdfasdfasdf"
    }]
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTextDetailData,
      isLoading: false,
    }));

    Storage.prototype.getItem = vi.fn().mockReturnValue("bo-IN");
    axiosInstance.get.mockResolvedValue({ data: mockTextDetailData });
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

  test("displays loading state implicitly", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));

    setup();
    // Title should be empty during loading
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
  });

  test("renders download button", () => {
    setup();
    expect(screen.getByText("Download Text")).toBeInTheDocument();
  });

  test("renders continue reading button", () => {
    setup();
    expect(screen.getByText("Continue Reading")).toBeInTheDocument();
  });

  test("fetchTableOfContents makes correct API call", async () => {
    const result = await fetchTableOfContents("123", 0, 10);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/texts/123/contents",
      {
        params: {
          language: "bo",
          limit: 10,
          skip: 0,
        },
      }
    );

    expect(result).toEqual(mockTextDetailData);
  });
});