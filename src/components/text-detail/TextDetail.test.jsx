import React from "react";
import { render, screen } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import { mockAxios, mockReactQuery, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import TextDetail, { fetchTextDetail } from "./TextDetail.jsx";
import { BrowserRouter as Router, useParams } from "react-router-dom";

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

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe("TextDetail Component", () => {
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
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TextDetail />
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the component with text details", () => {
    setup();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Type")).toBeInTheDocument();
  });

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

  test("displays default empty values when there's no data", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    
    setup();
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe("");
  });

  test("handles query error gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(reactQuery, "useQuery").mockImplementation((_queryKey, _queryFn, options) => {
      if (options.onError) {
        options.onError(new Error("Test error"));
      }
      return {
        data: null,
        isLoading: false,
        error: new Error("Test error")
      };
    });
    
    setup();
    expect(consoleSpy).toHaveBeenCalledWith("Query error:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("renders download button", () => {
    setup();
    expect(screen.getByText("text.download")).toBeInTheDocument();
  });

  test("renders continue reading button", () => {
    setup();
    expect(screen.getByText("text.button.continue_reading")).toBeInTheDocument();
  });

  test("fetches text detail with correct parameters", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockTextDetailData });
    const result = await fetchTextDetail("123");

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/texts/123/versions", {
      params: {
        text_id: "123",
        skip: undefined,
        limit: undefined
      }
    });

    expect(result).toEqual(mockTextDetailData);
  });

  test("handles API error gracefully in fetchTextDetail", async () => {
    const error = new Error("API error");
    axiosInstance.get.mockRejectedValueOnce(error);
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await fetchTextDetail("123");
    
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching text details:", error);
    expect(result).toEqual({ title: "", type: "" });
    
    consoleSpy.mockRestore();
  });

  test("fetches text detail with pagination parameters", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockTextDetailData });
    const result = await fetchTextDetail("123", 10, 5);

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/texts/123/versions", {
      params: {
        text_id: "123",
        skip: 10,
        limit: 5
      }
    });

    expect(result).toEqual(mockTextDetailData);
  });
});