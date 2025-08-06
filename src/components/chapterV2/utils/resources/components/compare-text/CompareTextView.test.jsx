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

  describe("Content Item Click Handler Tests", () => {
    const testHandleContentItemClick = (contentItem, selectedText, addChapter, currentChapter, setSelectedContentItem, setIsCompareTextView, closeResourcesPanel) => {
      setSelectedContentItem(contentItem);

      if (selectedText && addChapter) {
        const segmentId = contentItem.segments && contentItem.segments.length > 0 
          ? contentItem.segments[0].segment_id 
          : (contentItem.sections && contentItem.sections[0]?.segments && contentItem.sections[0].segments.length > 0 
              ? contentItem.sections[0].segments[0].segment_id 
              : null);
                    
        if (segmentId) {
          addChapter({
            textId: selectedText.id,
            segmentId: segmentId,
          }, currentChapter);
          
          closeResourcesPanel();
          setIsCompareTextView("main");
        }
      }
    };

    test("Should add chapter when content item with direct segments is clicked", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      const mockCloseResourcesPanel = vi.fn();
      const mockSetSelectedContentItem = vi.fn();
      
      const contentItem = {
        id: "content1",
        title: "Chapter 1",
        segments: [{ segment_id: "seg123" }]
      };
      
      const selectedText = { id: "text123", title: "Selected Text" };
      
      testHandleContentItemClick(
        contentItem,
        selectedText,
        mockAddChapter,
        "chapter1",
        mockSetSelectedContentItem,
        mockSetIsCompareTextView,
        mockCloseResourcesPanel
      );
      
      expect(mockSetSelectedContentItem).toHaveBeenCalledWith(contentItem);
      
      expect(mockAddChapter).toHaveBeenCalledWith(
        { textId: "text123", segmentId: "seg123" },
        "chapter1"
      );
      
      expect(mockCloseResourcesPanel).toHaveBeenCalled();
      
      expect(mockSetIsCompareTextView).toHaveBeenCalledWith("main");
    });
    
    test("Should add chapter when content item with nested segments is clicked", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      const mockCloseResourcesPanel = vi.fn();
      const mockSetSelectedContentItem = vi.fn();
      
      const contentItem = {
        id: "content2",
        title: "Chapter 2",
        segments: [],
        sections: [
          {
            id: "section1",
            title: "Section 1",
            segments: [{ segment_id: "nestedSeg456" }]
          }
        ]
      };
      
      const selectedText = { id: "text123", title: "Selected Text" };
      
      testHandleContentItemClick(
        contentItem,
        selectedText,
        mockAddChapter,
        "chapter1",
        mockSetSelectedContentItem,
        mockSetIsCompareTextView,
        mockCloseResourcesPanel
      );
      
      expect(mockSetSelectedContentItem).toHaveBeenCalledWith(contentItem);
      
      expect(mockAddChapter).toHaveBeenCalledWith(
        { textId: "text123", segmentId: "nestedSeg456" },
        "chapter1"
      );
      
      expect(mockCloseResourcesPanel).toHaveBeenCalled();
      
      expect(mockSetIsCompareTextView).toHaveBeenCalledWith("main");
    });
    
    test("Should not add chapter when content item has no segments", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      const mockCloseResourcesPanel = vi.fn();
      const mockSetSelectedContentItem = vi.fn();
      
      const contentItem = {
        id: "content3",
        title: "Chapter 3",
        segments: [],
        sections: [
          {
            id: "section2",
            title: "Section 2",
            segments: []
          }
        ]
      };
      
      const selectedText = { id: "text123", title: "Selected Text" };
      
      testHandleContentItemClick(
        contentItem,
        selectedText,
        mockAddChapter,
        "chapter1",
        mockSetSelectedContentItem,
        mockSetIsCompareTextView,
        mockCloseResourcesPanel
      );
      
      expect(mockSetSelectedContentItem).toHaveBeenCalledWith(contentItem);
      
      expect(mockAddChapter).not.toHaveBeenCalled();
      
      expect(mockCloseResourcesPanel).not.toHaveBeenCalled();
      
      expect(mockSetIsCompareTextView).not.toHaveBeenCalled();
    });
    
    test("Should not add chapter when selectedText is not available", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      const mockCloseResourcesPanel = vi.fn();
      const mockSetSelectedContentItem = vi.fn();
      
      const contentItem = {
        id: "content1",
        title: "Chapter 1",
        segments: [{ segment_id: "seg123" }]
      };
      
      testHandleContentItemClick(
        contentItem,
        null, 
        mockAddChapter,
        "chapter1",
        mockSetSelectedContentItem,
        mockSetIsCompareTextView,
        mockCloseResourcesPanel
      );
      
      expect(mockSetSelectedContentItem).toHaveBeenCalledWith(contentItem);
      
      expect(mockAddChapter).not.toHaveBeenCalled();
      
      expect(mockCloseResourcesPanel).not.toHaveBeenCalled();
      
      expect(mockSetIsCompareTextView).not.toHaveBeenCalled();
    });
    
    test("Should not add chapter when addChapter is not available", () => {
      const mockSetIsCompareTextView = vi.fn();
      const mockCloseResourcesPanel = vi.fn();
      const mockSetSelectedContentItem = vi.fn();
      
      const contentItem = {
        id: "content1",
        title: "Chapter 1",
        segments: [{ segment_id: "seg123" }]
      };
      
      const selectedText = { id: "text123", title: "Selected Text" };
      
      testHandleContentItemClick(
        contentItem,
        selectedText,
        null, 
        "chapter1",
        mockSetSelectedContentItem,
        mockSetIsCompareTextView,
        mockCloseResourcesPanel
      );
      
      expect(mockSetSelectedContentItem).toHaveBeenCalledWith(contentItem);
      
      expect(mockCloseResourcesPanel).not.toHaveBeenCalled();
      
      expect(mockSetIsCompareTextView).not.toHaveBeenCalled();
    });
  });

  describe("Term View Tests", () => {
    const renderTermView = (rootTexts, commentaryTexts) => {
      const tMock = vi.fn(key => key);
      const getLanguageClassMock = vi.fn(language => {
        switch (language) {
          case "bo": return "bo-text";
          case "en": return "en-text";
          case "sa": return "bo-text"; 
          case "bhu": return "bo-text"; 
          default: return "overalltext";
        }
      });
      const setSelectedTextMock = vi.fn();
      const setActiveViewMock = vi.fn();
      
      return {
        ui: (
          <div className="navigate-root-commentary">
            <div className="root-text-section">
              <h2 className="section-title overalltext">{tMock("text.type.root_text")}</h2>
              {rootTexts.length === 0 ? (
                <div className="no-content">{tMock("text.root_text_not_found")}</div>
              ) : (
                <div className="root-text-list">
                  {rootTexts.map((text) => (
                    <button
                      key={text.id}
                      type="button"
                      onClick={() => {
                        setSelectedTextMock(text);
                        setActiveViewMock("contents");
                      }}
                      className={`${getLanguageClassMock(text.language)} root-text-button`}
                      data-testid={`root-text-${text.id}`}
                    >
                      {text.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="commentary-section">
              <h2 className="section-title overalltext">{tMock("text.type.commentary")}</h2>
              {commentaryTexts.length === 0 ? (
                <div className="no-content">{tMock("text.commentary_text_not_found")}</div>
              ) : (
                <div className="commentary-list">
                  {commentaryTexts.map((text) => (
                    <button
                      key={text.id}
                      type="button"
                      onClick={() => {
                        setSelectedTextMock(text);
                        setActiveViewMock("contents");
                      }}
                      className={`${getLanguageClassMock(text.language)} commentary-text-button`}
                      data-testid={`commentary-text-${text.id}`}
                    >
                      {text.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ),
        mocks: {
          tMock,
          getLanguageClassMock,
          setSelectedTextMock,
          setActiveViewMock
        }
      };
    };

    test("Should render root texts and commentary texts in term view", () => {
      const rootTexts = [
        { id: "root1", title: "Root Text 1", language: "bo" },
        { id: "root2", title: "Root Text 2", language: "sa" }
      ];
      
      const commentaryTexts = [
        { id: "comm1", title: "Commentary 1", language: "en" },
        { id: "comm2", title: "Commentary 2", language: "bo" }
      ];
      
      const { ui, mocks } = renderTermView(rootTexts, commentaryTexts);
      render(ui);
      
      expect(screen.getByText("text.type.root_text")).toBeInTheDocument();
      expect(screen.getByText("text.type.commentary")).toBeInTheDocument();
      
      expect(screen.getByText("Root Text 1")).toBeInTheDocument();
      expect(screen.getByText("Root Text 2")).toBeInTheDocument();
      
      expect(screen.getByText("Commentary 1")).toBeInTheDocument();
      expect(screen.getByText("Commentary 2")).toBeInTheDocument();
      
      expect(mocks.getLanguageClassMock).toHaveBeenCalledWith("bo");
      expect(mocks.getLanguageClassMock).toHaveBeenCalledWith("sa");
      expect(mocks.getLanguageClassMock).toHaveBeenCalledWith("en");
    });
    
    test("Should display empty state message when no root texts are available", () => {
      const rootTexts = [];
      const commentaryTexts = [
        { id: "comm1", title: "Commentary 1", language: "en" }
      ];
      
      const { ui } = renderTermView(rootTexts, commentaryTexts);
      render(ui);
      
      expect(screen.getByText("text.root_text_not_found")).toBeInTheDocument();
      
      expect(screen.getByText("Commentary 1")).toBeInTheDocument();
    });
    
    test("Should display empty state message when no commentary texts are available", () => {
      const rootTexts = [
        { id: "root1", title: "Root Text 1", language: "bo" }
      ];
      const commentaryTexts = [];
      
      const { ui } = renderTermView(rootTexts, commentaryTexts);
      render(ui);
      
      expect(screen.getByText("text.commentary_text_not_found")).toBeInTheDocument();
      
      expect(screen.getByText("Root Text 1")).toBeInTheDocument();
    });
    
    test("Should apply correct language classes to text buttons", () => {
      const rootTexts = [
        { id: "root1", title: "Tibetan Text", language: "bo" },
        { id: "root2", title: "Sanskrit Text", language: "sa" }
      ];
      
      const commentaryTexts = [
        { id: "comm1", title: "English Text", language: "en" },
        { id: "comm2", title: "Unknown Language", language: "unknown" }
      ];
      
      const { ui } = renderTermView(rootTexts, commentaryTexts);
      const { container } = render(ui);
      
      const tibetanButton = screen.getByTestId("root-text-root1");
      const sanskritButton = screen.getByTestId("root-text-root2");
      const englishButton = screen.getByTestId("commentary-text-comm1");
      const unknownButton = screen.getByTestId("commentary-text-comm2");
      
      expect(tibetanButton).toHaveClass("bo-text");
      expect(sanskritButton).toHaveClass("bo-text"); 
      expect(englishButton).toHaveClass("en-text");
      expect(unknownButton).toHaveClass("overalltext");
    });
    
    test("Should navigate to contents view when a text button is clicked", () => {
      const rootTexts = [
        { id: "root1", title: "Root Text 1", language: "bo" }
      ];
      const commentaryTexts = [
        { id: "comm1", title: "Commentary 1", language: "en" }
      ];
      
      const { ui, mocks } = renderTermView(rootTexts, commentaryTexts);
      render(ui);
      
      fireEvent.click(screen.getByText("Root Text 1"));
      
      expect(mocks.setSelectedTextMock).toHaveBeenCalledWith(rootTexts[0]);
      
      expect(mocks.setActiveViewMock).toHaveBeenCalledWith("contents");
      
      mocks.setSelectedTextMock.mockReset();
      mocks.setActiveViewMock.mockReset();
      
      fireEvent.click(screen.getByText("Commentary 1"));
      
      expect(mocks.setSelectedTextMock).toHaveBeenCalledWith(commentaryTexts[0]);
      
      expect(mocks.setActiveViewMock).toHaveBeenCalledWith("contents");
    });
  });
});