import React from "react";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import Collections, {fetchCollections, renderCollections} from "./Collections.jsx";
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
  LANGUAGE: "LANGUAGE"
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

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ id: null });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockCollectionsData,
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
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("en-US");
    const useQuerySpy = vi.spyOn(reactQuery, "useQuery");
    setup();
    expect(useQuerySpy).toHaveBeenCalled();
  });

  test("renders the browse section correctly", () => {
    setup();
    const browseSection = document.querySelector(".browse-section");
    expect(browseSection).toBeInTheDocument();
    expect(browseSection.querySelector("h2")).toBeInTheDocument();
    expect(browseSection.querySelector("button")).toBeInTheDocument();
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

  test("handles click on buttons without errors", () => {
    setup();
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      fireEvent.click(button);
    });
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

  test("fetches term with correct parameters", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("en");
    axiosInstance.get.mockResolvedValueOnce({ data: mockCollectionsData });

    const result = await fetchCollections();
    expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/collections", {
      params: {
        language: "en",
        limit: 10,
        skip: 0
      }
    });

    expect(result).toEqual(mockCollectionsData);
  });
});

describe("renderCollections function", () => {
  const mockCollectionsData = {
    collections: [
      { id: "col1", title: "Collection 1", description: "Description 1", has_child: true },
      { id: "col2", title: "Collection 2", description: "Description 2", has_child: false }
    ]
  };
  
  const t = (key) => key;
  
  test("renders collections with descriptions by default", () => {
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, {})}
      </Router>
    );
    
    const collections = container.querySelectorAll(".collections");
    expect(collections.length).toBe(2);
    
    const descriptions = container.querySelectorAll(".collections-description");
    expect(descriptions.length).toBe(2);
    expect(descriptions[0].textContent).toBe("Description 1");
    expect(descriptions[1].textContent).toBe("Description 2");
  });
  
  test("renders collections without descriptions when showDescriptions is false", () => {
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, { showDescriptions: false })}
      </Router>
    );
    
    const collections = container.querySelectorAll(".collections");
    expect(collections.length).toBe(2);
    
    const descriptions = container.querySelectorAll(".collections-description");
    expect(descriptions.length).toBe(0);
  });
  
  test("renders links for collections with has_child=true by default", () => {
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, {})}
      </Router>
    );
    
    const links = container.querySelectorAll(".collection-link");
    expect(links.length).toBe(1);
    expect(links[0].getAttribute("href")).toBe("/collections/col1");
    expect(links[0].textContent).toBe("Collection 1");
  });
  
  test("renders plain text for collections with has_child=false by default", () => {
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, {})}
      </Router>
    );
    
    const collections = container.querySelectorAll(".collections");
    
    const secondCollection = collections[1];
    expect(secondCollection.textContent).toContain("Collection 2");
    expect(secondCollection.querySelector(".collection-link")).toBeNull();
  });
  
  test("renders buttons when useButtons is true", () => {
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, { useButtons: true, setSelectedCollection: () => {} })}
      </Router>
    );
    
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe("Collection 1");
    expect(buttons[1].textContent).toBe("Collection 2");
  });
  
  test("calls setSelectedCollection when button is clicked", () => {
    const mockSetSelectedCollection = vi.fn();
    
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, { 
          useButtons: true, 
          setSelectedCollection: mockSetSelectedCollection 
        })}
      </Router>
    );
    
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[0]);
    
    expect(mockSetSelectedCollection).toHaveBeenCalledWith(mockCollectionsData.collections[0]);
  });
  
  test("handles null data gracefully", () => {
    const { container } = render(
      <Router>
        {renderCollections(null, t, {})}
      </Router>
    );
    
    const collectionsContainer = container.querySelector(".collections-list-container");
    expect(collectionsContainer).toBeInTheDocument();
    expect(collectionsContainer.children.length).toBe(0);
  });
  
  test("handles empty collections array gracefully", () => {
    const emptyData = { collections: [] };
    
    const { container } = render(
      <Router>
        {renderCollections(emptyData, t, {})}
      </Router>
    );
    
    const collectionsContainer = container.querySelector(".collections-list-container");
    expect(collectionsContainer).toBeInTheDocument();
    expect(collectionsContainer.children.length).toBe(0);
  });
  
  test("combines all options correctly", () => {
    const mockSetSelectedCollection = vi.fn();
    
    const { container } = render(
      <Router>
        {renderCollections(mockCollectionsData, t, { 
          showDescriptions: false,
          useButtons: true, 
          setSelectedCollection: mockSetSelectedCollection 
        })}
      </Router>
    );
    
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(2);
    
    const descriptions = container.querySelectorAll(".collections-description");
    expect(descriptions.length).toBe(0);
    
    fireEvent.click(buttons[0]);
    expect(mockSetSelectedCollection).toHaveBeenCalledWith(mockCollectionsData.collections[0]);
  });
});
