import React from "react";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth, mockLocalStorage} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import * as reactRouterDom from "react-router-dom";
import Collections, {fetchCollections} from "./Collections.jsx";
import {vi} from "vitest";
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

vi.mock("../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  getEarlyReturn: () => null
}));

vi.mock("../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  siteName: "WeBuddhist",
}));

const setCollectionColorMock = vi.fn();
vi.mock("../../context/CollectionColorContext.jsx", () => ({
  useCollectionColor: () => ({ setCollectionColor: setCollectionColorMock })
}));

describe("Collections Component", () => {
  const queryClient = new QueryClient();
  const mockCollectionsData = {
    collections: [
      { title: "content.title.words_of_buddha", description: "content.subtitle.words_of_buddha" },
      { title: "content.title.liturgy", description: "content.subtitle.prayers_rutuals" },
      { title: "content.title.Buddhavacana", description: "content.subtitle.buddhavacana" },
    ],
    total: 3,
    skip: 0,
    limit: 10
  };

  let localStorageMock;

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ id: null });
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("bo-IN");
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockCollectionsData,
      isLoading: false,
    }));
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders Collections component", () => {
    setup();
    expect(document.querySelector(".collections-container")).toBeInTheDocument();
    expect(document.querySelector(".left-section")).toBeInTheDocument();
    expect(document.querySelector(".right-section")).toBeInTheDocument();
  });

  test("does not display loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();
    expect(document.querySelector(".collections-container")).toBeInTheDocument();
  });

  test("handles language selection correctly", () => {
    window.localStorage.getItem.mockReturnValue("en-US");
    const useQuerySpy = vi.spyOn(reactQuery, "useQuery");
    setup();
    expect(useQuerySpy).toHaveBeenCalled();
  });

  test("renders the browse section correctly", () => {
    setup();
    const browseSection = document.querySelector(".browse-section");
    expect(browseSection).toBeInTheDocument();
    expect(browseSection.querySelector("h2")).toBeInTheDocument();
  });

  test("renders the content section correctly", () => {
    setup();
    const contentSection = document.querySelector(".collections-list-container");
    expect(contentSection).toBeInTheDocument();
    expect(contentSection.textContent).toContain("content.title.words_of_buddha");
    expect(contentSection.textContent).toContain("content.subtitle.words_of_buddha");
  });

  test("renders the about section correctly", () => {
    setup();
    const rightSection = document.querySelector(".right-section");
    expect(rightSection).toBeInTheDocument();
    const heading = rightSection.querySelector(".about-title");
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe("side_nav.about_pecha_title");
    const paragraph = rightSection.querySelector("p");
    expect(paragraph).toBeInTheDocument();
  });


  test("renders correct number of collections from data", () => {
    const customCollectionsData = {
      collections: [
        { title: "Term 1", description: "Description 1" },
        { title: "Term 2", description: "Description 2" },
        { title: "Term 3", description: "Description 3" },
        { title: "Term 4", description: "Description 4" },
      ],
      total: 4,
      skip: 0,
      limit: 10
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: customCollectionsData,
      isLoading: false,
    }));

    setup();

    const collectionElements = document.querySelectorAll(".collections");
    expect([...collectionElements].map(e => e.textContent)).toEqual(
      expect.arrayContaining([
        "Term 1Description 1",
        "Term 2Description 2",
        "Term 3Description 3",
        "Term 4Description 4"
      ])
    );
  });

  test("handles async data loading correctly", async () => {
    let isLoadingValue = true;
    let dataValue = null;

    const useQueryMock = vi.fn().mockImplementation(() => ({
      data: dataValue,
      isLoading: isLoadingValue,
    }));

    vi.spyOn(reactQuery, "useQuery").mockImplementation(useQueryMock);

    const { rerender } = setup();


    isLoadingValue = false;
    dataValue = mockCollectionsData;

    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    const contentSection = document.querySelector(".collections-list-container");
    expect(contentSection).toBeInTheDocument();
  });

  test("handles null data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();

    const container = document.querySelector(".collections-container");
    expect(container).toBeInTheDocument();
    expect(document.querySelector(".left-section")).toBeInTheDocument();
    expect(document.querySelector(".right-section")).toBeInTheDocument();
  });

  test("fetches collections with correct parameters", async () => {
    window.localStorage.getItem.mockReturnValue("en");
    axiosInstance.get.mockResolvedValueOnce({ data: mockCollectionsData });
    const result = await fetchCollections();
    expect(window.localStorage.getItem).toHaveBeenCalledWith("LANGUAGE");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/collections", {
      params: {
        language: "en",
        limit: 10,
        skip: 0
      }
    });
    expect(result).toEqual(mockCollectionsData);
  });

  test("sets collection color based on index", () => {
    const data = {
      collections: [
        { id: "c1", title: "A", description: "d1", has_child: true },
        { id: "c2", title: "B", description: "d2", has_child: false },
        { id: "c3", title: "C", description: "d3", has_child: true },
      ],
      total: 3,
      skip: 0,
      limit: 10
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    const links = screen.getAllByRole('link', { name: /A|B|C/ });
    fireEvent.click(links[0]);
    fireEvent.click(links[1]);
    fireEvent.click(links[2]);
    expect(setCollectionColorMock).toHaveBeenNthCalledWith(1, "#802F3E");
    expect(setCollectionColorMock).toHaveBeenNthCalledWith(2, "#5B99B7");
    expect(setCollectionColorMock).toHaveBeenNthCalledWith(3, "#5D956F");
  });

  test("compare-text mode: renders button and triggers callbacks", () => {
    const data = {
      collections: [
        { id: "c1", title: "Compare A", description: "d1", has_child: false },
      ],
      total: 1,
      skip: 0,
      limit: 10
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    const setRendererInfo = vi.fn();

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Collections requiredInfo={{ from: "compare-text" }} setRendererInfo={setRendererInfo} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    const link = screen.getByRole("link", { name: "Compare A" });
    fireEvent.click(link);

    expect(setCollectionColorMock).toHaveBeenCalledWith("#802F3E");
    expect(setRendererInfo).toHaveBeenCalledTimes(1);
    const updater = setRendererInfo.mock.calls[0][0];
    expect(typeof updater).toBe("function");
    const prev = { foo: "bar" };
    const next = updater(prev);
    expect(next).toEqual({ foo: "bar", requiredId: "c1", renderer: "works" });
  });

  test("renders correct link targets based on has_child", () => {
    const data = {
      collections: [
        { id: "c1", title: "With Child", description: "d1", has_child: true },
        { id: "w1", title: "Leaf", description: "d2", has_child: false },
      ],
      total: 2,
      skip: 0,
      limit: 10
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    const withChildLink = screen.getByRole("link", { name: "With Child" });
    const leafLink = screen.getByRole("link", { name: "Leaf" });
    expect(withChildLink.getAttribute("href")).toBe("/collections/c1");
    expect(leafLink.getAttribute("href")).toBe("/works/w1");
  });

  test("navigates to community when Explore Stories is clicked", () => {
    const navigateMock = vi.fn();
    const useNavigateSpy = vi.spyOn(reactRouterDom, "useNavigate").mockReturnValue(navigateMock);

    setup();
    const button = screen.getByRole("button", { name: "side_nav.community.join_conversation" });
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith("/community");
    useNavigateSpy.mockRestore();
  });

  test("renders correct line classes for indices 0-8 and sets 9th color", () => {
    const data = {
      collections: Array.from({ length: 9 }, (_, i) => ({
        id: `c${i}`,
        title: `T${i}`,
        description: `D${i}`,
        has_child: i % 2 === 0
      })),
      total: 9,
      skip: 0,
      limit: 10
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    setup();

    expect(document.querySelectorAll(".red-line").length).toBe(1); 
    expect(document.querySelectorAll(".green-line").length).toBe(1);  
    expect(document.querySelectorAll(".lightgreen-line").length).toBe(1); 
    expect(document.querySelectorAll(".blue-line").length).toBe(1); 
    expect(document.querySelectorAll(".purple-line").length).toBe(1); 
    expect(document.querySelectorAll(".lightpurpleline-line").length).toBe(1); 
    expect(document.querySelectorAll(".orangeline-line").length).toBe(1); 
    expect(document.querySelectorAll(".pink-line").length).toBe(1); 
    expect(document.querySelectorAll(".gold-line").length).toBe(1); 

    const lastLink = screen.getByRole("link", { name: "T8" });
    fireEvent.click(lastLink);
    expect(setCollectionColorMock).toHaveBeenCalledWith("#CCB478");
  });
});
