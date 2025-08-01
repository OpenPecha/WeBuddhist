import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import SubCollections, { fetchSubCollections } from "./SubCollections.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../config/axios-config.js";

mockAxios();
mockUseAuth();
mockReactQuery();

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

vi.mock("../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
}));

describe("SubCollections Component", () => {
  const queryClient = new QueryClient();
  const mockTextChildData = {
    parent: {
      title: "Parent Title",
      id: "parent123"
    },
    collections: [
      { id: "1", title: "Term 1" },
      { id: "2", title: "Term 2" },
      { id: "3", title: "Term 3" }
    ],
    total: 3,
    skip: 0,
    limit: 10
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ id: "parent123" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockTextChildData,
      isLoading: false,
    }));
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo-IN");
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <SubCollections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    
    setup();
    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  test("renders the category header with parent title", () => {
    setup();
    const header = document.querySelector(".sub-collection-details h1");
    expect(header).toBeInTheDocument();
    expect(header.textContent).toBe("PARENT TITLE");
  });

  test("renders the correct number of text items", () => {
    setup();
    const textItems = document.querySelectorAll(".text-item");
    expect(textItems).toHaveLength(3);
    expect(textItems[0].textContent).toBe("Term 1");
    expect(textItems[1].textContent).toBe("Term 2");
    expect(textItems[2].textContent).toBe("Term 3");
  });

  test("text items have correct navigation links", () => {
    setup();
    const links = document.querySelectorAll(".text-item");
    links.forEach((link, index) => {
      expect(link).toHaveAttribute("href", `/works/${mockTextChildData.collections[index].id}`);
    });
  });

  test("renders sidebar with about section", () => {
    setup();
    const sidebar = document.querySelector(".about-section");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar.querySelector(".about-title").textContent).toBe("common.about Parent Title");
  });

  test("handles null data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    
    setup();
    const container = document.querySelector(".sub-collections-container");
    expect(container).toBeInTheDocument();
  });

  test("fetchSubCollections function makes correct API call", async () => {
    const parentId = "parent123";
    window.localStorage.getItem.mockReturnValue("bo-IN");
    axiosInstance.get.mockResolvedValueOnce({ data: mockTextChildData });

    const result = await fetchSubCollections(parentId);

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/collections", {
      params: {
        language: "bo",
        parent_id: parentId,
        limit: 10,
        skip: 0
      }
    });
    expect(result).toEqual(mockTextChildData);
  });

  test("fetchSubCollections handles missing parentId", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo-IN");
    axiosInstance.get.mockResolvedValueOnce({ data: mockTextChildData });

    const result = await fetchSubCollections();

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/collections", {
      params: {
        language: "bo",
        limit: 10,
        skip: 0
      }
    });
    expect(result).toEqual(mockTextChildData);
  });

  test("fetchSubCollections uses default language when none stored", async () => {
    const parentId = "parent123";
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    axiosInstance.get.mockResolvedValueOnce({ data: mockTextChildData });

    const result = await fetchSubCollections(parentId);

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/collections", {
      params: {
        language: "bo",
        parent_id: parentId,
        limit: 10,
        skip: 0
      }
    });
    expect(result).toEqual(mockTextChildData);
  });
});
