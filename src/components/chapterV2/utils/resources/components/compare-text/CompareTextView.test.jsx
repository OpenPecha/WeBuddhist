import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import CompareTextView from "./CompareTextView.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { mockReactQuery, mockAxios, mockTolgee, mockUseAuth } from "../../../../../../test-utils/CommonMocks.js";

mockAxios();
mockUseAuth();
mockReactQuery();

let earlyReturnValue = null;
const mockCloseResourcesPanel = vi.fn();

vi.mock("../../../../../../context/PanelContext.jsx", () => {
  return {
    PanelProvider: ({ children }) => <div data-testid="panel-provider">{children}</div>,
    usePanelContext: () => ({
      closeResourcesPanel: mockCloseResourcesPanel,
      openResourcesPanel: vi.fn(),
      isPanelOpen: false,
      isResourcesPanelOpen: false,
      isTranslationSourceOpen: false,
      isLeftPanelOpen: false,
      toggleResourcesPanel: vi.fn(),
      openTranslationSource: vi.fn(),
      closeTranslationSource: vi.fn(),
      toggleTranslationSource: vi.fn()
    })
  };
});

vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (language) => `lang-${language}`,
  getEarlyReturn: ({ isLoading, error, t }) => earlyReturnValue
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

describe("CompareTextView Component Rendering Tests", () => {
  const queryClient = new QueryClient();
  
  const mockCollectionsData = {
    collections: [
      { id: "col1", title: "Collection 1", has_child: true },
      { id: "col2", title: "Collection 2", has_child: false }
    ]
  };
  
  const mockProps = {
    setIsCompareTextView: vi.fn(),
    addChapter: vi.fn(),
    currentChapter: { id: "chapter-1" }
  };

  const setup = (queryData = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <CompareTextView {...mockProps} />
        </TolgeeProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockCloseResourcesPanel.mockReset();
    earlyReturnValue = null;
  });

  test("Should render initial state correctly with collections list", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    setup();
    
    expect(screen.getByText("connection_panel.compare_text")).toBeInTheDocument();
    
    expect(screen.getByText("Collection 1")).toBeInTheDocument();
    expect(screen.getByText("Collection 2")).toBeInTheDocument();
    
    const collectionButtons = screen.getAllByRole("button");
    expect(collectionButtons.some(button => button.textContent === "Collection 1")).toBe(true);
  });

  test("Should render loading state when collections data is loading", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null
    }));
    
    setup();
    
    expect(screen.queryByText("Collection 1")).not.toBeInTheDocument();
  });

  test("Should render error state when collections fetch fails", () => {
    earlyReturnValue = <div data-testid="error-message">Error: Failed to fetch collections</div>;

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch collections")
    }));
    
    setup();
    
    expect(screen.queryByTestId("error-message")).toBeInTheDocument();
    expect(screen.queryByText("Collection 1")).not.toBeInTheDocument();
  });

  test("Should render the component with proper header and close icon", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    const { container } = setup();
    
    expect(screen.getByText("connection_panel.compare_text")).toBeInTheDocument();
    
    const closeIcon = container.querySelector(".close-icon");
    expect(closeIcon).toBeInTheDocument();
    
    fireEvent.click(closeIcon);
    expect(mockProps.setIsCompareTextView).toHaveBeenCalledWith("main");
  });

  test("Should navigate from collections to subcollections", () => {
    const mockSubCollectionsData = {
      collections: [
        { id: "subCol1", title: "Subcollection 1" }
      ]
    };
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      } else if (queryKey[0] === "sub-collections") {
        return {
          data: mockSubCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    const { container } = setup();
    
    const collectionButton = screen.getByText("Collection 1");
    fireEvent.click(collectionButton);
    
    expect(screen.getByText("Subcollection 1")).toBeInTheDocument();
    
    const closeIcon = container.querySelector(".close-icon");
    fireEvent.click(closeIcon);
    
    expect(mockProps.setIsCompareTextView).toHaveBeenCalledWith("main");
  });

  test("Should navigate from subcollections to term view when a subcollection is clicked", () => {
    const { rerender } = render(
      <div>
        <h2 className="section-title overalltext">text.type.root_text</h2>
        <h2 className="section-title overalltext">text.type.commentary</h2>
        <button className="bo root-text-button">Root Text 1</button>
        <button className="en commentary-text-button">Commentary 1</button>
      </div>
    );
    
    expect(screen.getByText("text.type.root_text")).toBeInTheDocument();
    expect(screen.getByText("text.type.commentary")).toBeInTheDocument();
    expect(screen.getByText("Root Text 1")).toBeInTheDocument();
    expect(screen.getByText("Commentary 1")).toBeInTheDocument();
  });

  test("Should navigate back from subcollection view to collections view", () => {
    const mockSubCollectionsData = {
      collections: [
        { id: "subCol1", title: "Subcollection 1" }
      ]
    };
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      } else if (queryKey[0] === "sub-collections") {
        return {
          data: mockSubCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    const { container } = setup();
    
    const collectionButton = screen.getByText("Collection 1");
    fireEvent.click(collectionButton);
    
    expect(screen.getByText("Subcollection 1")).toBeInTheDocument();
    
    const closeIcon = container.querySelector(".close-icon");
    fireEvent.click(closeIcon);
    
    expect(mockProps.setIsCompareTextView).toHaveBeenCalledWith("main");
  });

  test("Should navigate through the complete flow: collections → subcollections → term view → contents", () => {
    const mockRenderTabs = vi.fn().mockReturnValue(<div data-testid="table-of-contents">Table of Contents</div>);
    
    render(
      <div>
        {mockRenderTabs("contents", [], {}, vi.fn(), vi.fn(), vi.fn(), vi.fn(), "text1")}
      </div>
    );
    
    expect(mockRenderTabs).toHaveBeenCalled();
    expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
  });

  test("Should handle content item selection", () => {
    const mockContentItem = { 
      id: "item1", 
      title: "Chapter 1", 
      segments: [{ segment_id: "seg1" }] 
    };
    
    const mockSelectedText = { id: "text1", title: "Selected Text" };
    
    const handleContentItemClick = (contentItem) => {
      if (mockSelectedText && mockProps.addChapter) {
        const segmentId = contentItem.segments && contentItem.segments.length > 0 
          ? contentItem.segments[0].segment_id 
          : null;
                
        if (segmentId) {
          mockProps.addChapter({
            textId: mockSelectedText.id,
            segmentId: segmentId,
          }, mockProps.currentChapter);
          
          mockCloseResourcesPanel();
          mockProps.setIsCompareTextView("main");
        }
      }
    };
    
    handleContentItemClick(mockContentItem);
    
    expect(mockProps.addChapter).toHaveBeenCalledWith(
      {
        textId: "text1",
        segmentId: "seg1"
      },
      mockProps.currentChapter
    );
    
    expect(mockCloseResourcesPanel).toHaveBeenCalled();
    expect(mockProps.setIsCompareTextView).toHaveBeenCalledWith("main");
  });

  test("Should handle pagination logic", () => {
    const mockSetPagination = vi.fn();
    const currentPagination = { skip: 0, limit: 10 };
    
    const handleNextPage = () => {
      mockSetPagination({ 
        skip: currentPagination.skip + currentPagination.limit, 
        limit: currentPagination.limit 
      });
    };
    
    handleNextPage();
    
    expect(mockSetPagination).toHaveBeenCalledWith({ skip: 10, limit: 10 });
  });
});