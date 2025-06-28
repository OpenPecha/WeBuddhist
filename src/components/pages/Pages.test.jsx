import React from "react";
import { render, screen } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import Pages, { fetchVersions } from "./Pages.jsx";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("react-bootstrap", () => ({
  Tabs: ({ children, defaultActiveKey }) => (
    <div data-testid="tabs" data-default-key={defaultActiveKey}>
      {children}
    </div>
  ),
  Tab: ({ children, eventKey, title }) => (
    <div data-testid={`tab-${eventKey}`} data-title={title}>
      {children}
    </div>
  )
}));

vi.mock("./versions/Versions.jsx", () => ({
  default: () => <div data-testid="versions-component">Versions Component</div>
}));

vi.mock("./content/Content.jsx", () => ({
  default: () => <div data-testid="content-component">Content Component</div>
}));

vi.mock("../../utils/Constants", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  getLanguageClass: () => "language-class"
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: () => [new URLSearchParams("?type=works"), vi.fn()]
  };
});

describe("Pages Component", () => {
  const queryClient = new QueryClient();
  const mockTextDetailData = {
    text: {
      title: "Test Title",
      type: "Test Type"
    }
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
          <Pages />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("renders tabs correctly", () => {
    setup();
    const tabs = screen.getByTestId("tabs");
    expect(tabs).toBeInTheDocument();
    expect(tabs.getAttribute("data-default-key")).toBe("contents");
    
    expect(screen.getByTestId("tab-contents")).toBeInTheDocument();
    expect(screen.getByTestId("tab-versions")).toBeInTheDocument();
  });

  test("renders child components", () => {
    setup();
    expect(screen.getByTestId("content-component")).toBeInTheDocument();
    expect(screen.getByTestId("versions-component")).toBeInTheDocument();
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
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  test("renders continue reading button", () => {
    setup();
    expect(screen.getByText("Continue Reading")).toBeInTheDocument();
  });
  
  test("fetchVersions makes correct API call", async () => {
    const result = await fetchVersions("123", 10, 0);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/v1/texts/123/versions",
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