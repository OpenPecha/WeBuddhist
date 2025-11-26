import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth, mockLocalStorage} from "../../test-utils/CommonMocks.js";
import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import * as reactQuery from "react-query";
import axiosInstance from "../../config/axios-config.js";
import {render, screen, fireEvent} from "@testing-library/react";
import {TolgeeProvider} from "@tolgee/react";
import React from "react";
import Texts, {fetchTableOfContents, fetchVersions} from "./Texts.jsx";

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
  siteName: "Webuddhist",
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
      id:"sdfasdfasdf",
      sections: [
        { id: "section1", title: "Section 1" },
        { id: "section2", title: "Section 2" }


      ]
    }]
  };

  let localStorageMock;

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("bo-IN");
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTextDetailData,
      isLoading: false,
    }));
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
      expect(buttons[0]).toHaveTextContent("Contents")
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

// test("renders download button", () => {
  //   setup();
  //   expect(screen.getByText("Download Text")).toBeInTheDocument();
  // });


  test("fetchTableOfContents makes correct API call", async () => {
    sessionStorage.setItem('textLanguage', 'bo-IN');
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
    sessionStorage.removeItem('textLanguage');
  });

  test("switches to versions tab when clicked", () => {
    setup();

    const buttons = document.querySelectorAll('.tab-button');
    expect(buttons[0]).toHaveClass('active');
    expect(screen.getByTestId("table-of-content-component")).toBeInTheDocument();
    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveClass('active');
    expect(screen.getByTestId("versions-component")).toBeInTheDocument();
  });

  test("fetchVersions makes correct API call", async () => {
    sessionStorage.setItem('textLanguage', 'bo-IN');
    axiosInstance.get.mockResolvedValueOnce({ data: { versions: [] } });
    const result = await fetchVersions("123", 0, 10);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/texts/123/versions",
      {
        params: {
          language: "bo",
          limit: 10,
          skip: 0
        }
      }
    );
    expect(result).toEqual({ versions: [] });
    sessionStorage.removeItem('textLanguage');
  });

  test("switches back to contents from versions tab", () => {
    setup();
    
    const buttons = document.querySelectorAll('.tab-button');
    fireEvent.click(buttons[1]);
    expect(screen.getByTestId("versions-component")).toBeInTheDocument();
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveClass('active');
    expect(screen.getByTestId("table-of-content-component")).toBeInTheDocument();
    expect(screen.queryByTestId("versions-component")).not.toBeInTheDocument();
  });
});