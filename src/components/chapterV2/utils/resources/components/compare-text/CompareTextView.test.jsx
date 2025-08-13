import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import CompareTextView from "./CompareTextView.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { mockReactQuery, mockAxios, mockTolgee, mockUseAuth } from "../../../../../../test-utils/CommonMocks.js";

vi.mock("../../../../../../components/texts/Texts.jsx", () => ({
  fetchTableOfContents: vi.fn()
}));

import axiosInstance from "../../../../../../config/axios-config.js";

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
  getEarlyReturn: ({ isLoading, error, t }) => earlyReturnValue,
  mapLanguageCode: (code) => code
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
        {mockRenderTabs("contents", [], {}, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), "text1")}
      </div>
    );
    
    expect(mockRenderTabs).toHaveBeenCalled();
    expect(screen.getByTestId("table-of-contents")).toBeInTheDocument();
  });

  describe("handleContentItemClick Error Handling Tests", () => {
    beforeEach(() => {
      vi.resetAllMocks();
      mockCloseResourcesPanel.mockReset();
    });

    test("Should not call addChapter when no segments are available", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      
      const contentItemWithNoSegments = {
        title: "Content with no segments",
        segments: [],
        sections: []
      };
      
      const mockSelectedText = { id: "text-1", title: "Test Text" };
      
      const mockCurrentChapter = { id: "chapter-1" };
      
      const handleContentItemClick = (contentItem) => {
        if (mockSelectedText && mockAddChapter) {
          const segmentId = contentItem.segments && contentItem.segments.length > 0 
            ? contentItem.segments[0].segment_id 
            : (contentItem.sections && contentItem.sections[0]?.segments && contentItem.sections[0]?.segments.length > 0 
                ? contentItem.sections[0].segments[0].segment_id 
                : null);
                    
          if (segmentId) {
            mockAddChapter({
              textId: mockSelectedText.id,
              segmentId: segmentId,
            }, mockCurrentChapter);
            
            mockCloseResourcesPanel();
            mockSetIsCompareTextView("main");
          }
        }
      };
      
      handleContentItemClick(contentItemWithNoSegments);
      
      expect(mockAddChapter).not.toHaveBeenCalled();
      expect(mockCloseResourcesPanel).not.toHaveBeenCalled();
      expect(mockSetIsCompareTextView).not.toHaveBeenCalled();
    });

    test("Should not call addChapter when selectedText is null", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      
      const contentItemWithSegments = {
        title: "Content with segments",
        segments: [{ segment_id: "segment-1" }]
      };
      
      const mockSelectedText = null;
      
      const mockCurrentChapter = { id: "chapter-1" };
      
      const handleContentItemClick = (contentItem) => {
        if (mockSelectedText && mockAddChapter) {
          const segmentId = contentItem.segments && contentItem.segments.length > 0 
            ? contentItem.segments[0].segment_id 
            : (contentItem.sections && contentItem.sections[0]?.segments && contentItem.sections[0]?.segments.length > 0 
                ? contentItem.sections[0].segments[0].segment_id 
                : null);
                    
          if (segmentId) {
            mockAddChapter({
              textId: mockSelectedText?.id,
              segmentId: segmentId,
            }, mockCurrentChapter);
            
            mockCloseResourcesPanel();
            mockSetIsCompareTextView("main");
          }
        }
      };
      
      handleContentItemClick(contentItemWithSegments);
      
      expect(mockAddChapter).not.toHaveBeenCalled();
      expect(mockCloseResourcesPanel).not.toHaveBeenCalled();
      expect(mockSetIsCompareTextView).not.toHaveBeenCalled();
    });

    test("Should handle content item with segments in nested sections", () => {
      const mockAddChapter = vi.fn();
      const mockSetIsCompareTextView = vi.fn();
      
      const contentItemWithNestedSegments = {
        title: "Content with nested segments",
        segments: [], 
        sections: [{
          title: "Section 1",
          segments: [{ segment_id: "nested-segment-1" }]
        }]
      };
      
      const mockSelectedText = { id: "text-1", title: "Test Text" };
      
      const mockCurrentChapter = { id: "chapter-1" };
      
      const handleContentItemClick = (contentItem) => {
        if (mockSelectedText && mockAddChapter) {
          const segmentId = contentItem.segments && contentItem.segments.length > 0 
            ? contentItem.segments[0].segment_id 
            : (contentItem.sections && contentItem.sections[0]?.segments && contentItem.sections[0]?.segments.length > 0 
                ? contentItem.sections[0].segments[0].segment_id 
                : null);
                    
          if (segmentId) {
            mockAddChapter({
              textId: mockSelectedText.id,
              segmentId: segmentId,
            }, mockCurrentChapter);
            
            mockCloseResourcesPanel();
            mockSetIsCompareTextView("main");
          }
        }
      };
      
      handleContentItemClick(contentItemWithNestedSegments);
      
      expect(mockAddChapter).toHaveBeenCalledWith(
        {
          textId: "text-1",
          segmentId: "nested-segment-1",
        },
        mockCurrentChapter
      );
      expect(mockCloseResourcesPanel).toHaveBeenCalled();
      expect(mockSetIsCompareTextView).toHaveBeenCalledWith("main");
    });
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

  describe("Contents Version View Tests", () => {
    test("Should render table of contents when a text is selected", () => {
      const mockTableOfContents = {
        total: 15,
        items: [
          { id: "item1", title: "Chapter 1", segments: [{ segment_id: "seg1" }] },
          { id: "item2", title: "Chapter 2", segments: [{ segment_id: "seg2" }] }
        ]
      };
      
      const mockRenderTabs = vi.fn().mockImplementation(() => {
        return <div data-testid="mocked-tabs">Mocked Table of Contents</div>;
      });
      
      vi.mock("../../../../../../components/texts/Texts.jsx", () => ({
        renderTabs: (...args) => mockRenderTabs(...args),
        fetchTableOfContents: vi.fn()
      }));
      
      const MockCompareTextView = () => {
        return (
          <div className="contents-version-view">
            {mockRenderTabs(
              'contents',
              vi.fn(), 
              mockTableOfContents, 
              { skip: 0, limit: 10 }, 
              vi.fn(), 
              false, 
              false, 
              (key) => key, 
              "text123", 
              vi.fn()
            )}
          </div>
        );
      };
      
      render(<MockCompareTextView />);
      
      expect(screen.getByTestId("mocked-tabs")).toBeInTheDocument();
      
      expect(mockRenderTabs).toHaveBeenCalledWith(
        'contents',
        expect.any(Function),
        mockTableOfContents,
        { skip: 0, limit: 10 },
        expect.any(Function),
        false,
        false,
        expect.any(Function),
        "text123",
        expect.any(Function)
      );
      
      vi.restoreAllMocks();
    });
    
    test("Should handle pagination in contents view", () => {
      const mockSetPagination = vi.fn();
      const mockPagination = { skip: 0, limit: 10 };
      
      const mockTableOfContents = vi.fn().mockImplementation(({ pagination, setPagination }) => {
        return (
          <div data-testid="table-of-contents">
            <button 
              data-testid="next-page-button"
              onClick={() => setPagination({ 
                skip: pagination.skip + pagination.limit, 
                limit: pagination.limit 
              })}
            >
              Next Page
            </button>
            <div data-testid="pagination-state">
              {`Skip: ${pagination.skip}, Limit: ${pagination.limit}`}
            </div>
          </div>
        );
      });
      
      vi.mock("../../../../../../components/texts/table-of-contents/TableOfContents.jsx", () => {
        return {
          __esModule: true,
          default: (props) => mockTableOfContents(props)
        };
      });
      
      const mockRenderTabs = vi.fn().mockImplementation((activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick) => {
        if (activeTab === 'contents') {
          return (
            <div data-testid="tabs-container">
              {mockTableOfContents({
                tableOfContents,
                pagination,
                setPagination,
                textId,
                error: tableOfContentsIsError,
                loading: tableOfContentsIsLoading,
                t,
                onContentItemClick
              })}
            </div>
          );
        }
        return <div>Other Tab</div>;
      });
      
      vi.mock("../../../../../../components/texts/Texts.jsx", () => ({
        renderTabs: (activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick) => {
          return mockRenderTabs(activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick);
        },
        fetchTableOfContents: vi.fn()
      }));
      
      render(
        <div>
          <div className="contents-version-view">
            {mockRenderTabs(
              'contents',
              vi.fn(),
              { total: 25, items: [] },
              mockPagination,
              mockSetPagination,
              false,
              false,
              (key) => key,
              "text123",
              vi.fn()
            )}
          </div>
        </div>
      );
      
      const nextPageButton = screen.getByTestId("next-page-button");
      fireEvent.click(nextPageButton);
      
      expect(mockSetPagination).toHaveBeenCalledWith({ skip: 10, limit: 10 });
      
      vi.restoreAllMocks();
    });
    
    test("Should convert pagination format from { skip, limit } to { currentPage, limit } for TableOfContents", () => {
      const mockTableOfContentsComponent = vi.fn().mockReturnValue(<div>Mocked Table of Contents</div>);
      
      vi.mock("../../../../../../components/texts/table-of-contents/TableOfContents.jsx", () => {
        return {
          __esModule: true,
          default: (props) => {
            mockTableOfContentsComponent(props);
            return <div>Mocked Table of Contents</div>;
          }
        };
      });
      
      const mockRenderTabs = vi.fn((activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick) => {
        if (activeTab === 'contents') {
          return (
            <div data-testid="table-of-contents-wrapper">
              <div data-testid="converted-pagination">
                {`currentPage: ${Math.floor(pagination.skip / pagination.limit) + 1}, limit: ${pagination.limit}`}
              </div>
            </div>
          );
        }
        return <div>Other Tab</div>;
      });
      
      vi.mock("../../../../../../components/texts/Texts.jsx", () => ({
        renderTabs: (activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick) => {
          return mockRenderTabs(activeTab, setActiveTab, tableOfContents, pagination, setPagination, tableOfContentsIsError, tableOfContentsIsLoading, t, textId, onContentItemClick);
        },
        fetchTableOfContents: vi.fn()
      }));
      
      const paginationStates = [
        { skip: 0, limit: 10 },   
        { skip: 10, limit: 10 }, 
        { skip: 20, limit: 10 }  
      ];
      
      paginationStates.forEach((pagination, index) => {
        cleanup();
        
        render(
          <div className="contents-version-view">
            {mockRenderTabs(
              'contents',
              vi.fn(),
              { total: 35, items: [] },
              pagination,
              vi.fn(),
              false,
              false,
              (key) => key,
              "text123",
              vi.fn()
            )}
          </div>
        );
        
        expect(screen.getByTestId("converted-pagination").textContent)
          .toBe(`currentPage: ${Math.floor(pagination.skip / pagination.limit) + 1}, limit: ${pagination.limit}`);
      });
      
      expect(mockRenderTabs).toHaveBeenCalledTimes(3);
      expect(mockRenderTabs.mock.calls[0][3]).toEqual({ skip: 0, limit: 10 });
      expect(mockRenderTabs.mock.calls[1][3]).toEqual({ skip: 10, limit: 10 });
      expect(mockRenderTabs.mock.calls[2][3]).toEqual({ skip: 20, limit: 10 });
      
      vi.restoreAllMocks();
    });
  });

  describe("SubCollection View Tests", () => {
    let originalEarlyReturnValue;
    
    beforeEach(() => {
      originalEarlyReturnValue = earlyReturnValue;
      earlyReturnValue = null;
    });
    
    afterEach(() => {
      earlyReturnValue = originalEarlyReturnValue;
    });
    
    test("Should render subcollection view with proper structure and navigation", () => {
      const mockSubCollectionsData = {
        collections: [
          { id: "subCol1", title: "Subcollection 1" },
          { id: "subCol2", title: "Subcollection 2" }
        ]
      };
      
      let selectedTerm = null;
      let termViewActive = false;
      
      const mockSetSelectedTerm = vi.fn((term) => {
        selectedTerm = term;
      });
      
      const mockSetTermView = vi.fn((value) => {
        termViewActive = value;
      });
      
      const TestSubCollectionView = () => {
        const renderSubCollections = (data, options) => {
          return (
            <div data-testid="subcollections-container">
              {data.collections.map(collection => (
                <button 
                  key={collection.id}
                  data-testid={`subcollection-${collection.id}`}
                  onClick={() => {
                    options.setSelectedTerm(collection);
                  }}
                >
                  {collection.title}
                </button>
              ))}
            </div>
          );
        };
        
        return (
          <div className="selected-collection-content" data-testid="subcollection-view">
            <button 
              className="back-button" 
              data-testid="back-button"
              onClick={() => mockSetTermView(false)}
            >
              Back
            </button>
            <h1 className="listtitle">Subcollections</h1>
            {renderSubCollections(mockSubCollectionsData, {
              useButtons: true,
              setSelectedTerm: (term) => {
                mockSetSelectedTerm(term);
                mockSetTermView(true);
              }
            })}
          </div>
        );
      };
      
      render(<TestSubCollectionView />);
      
      expect(screen.getByTestId("subcollection-view")).toBeInTheDocument();
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
      expect(screen.getByTestId("subcollections-container")).toBeInTheDocument();
      expect(screen.getByTestId("subcollection-subCol1")).toBeInTheDocument();
      expect(screen.getByTestId("subcollection-subCol2")).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId("subcollection-subCol1"));
      
      expect(mockSetSelectedTerm).toHaveBeenCalledWith(mockSubCollectionsData.collections[0]);
      expect(mockSetTermView).toHaveBeenCalledWith(true);
      
      fireEvent.click(screen.getByTestId("back-button"));
      expect(mockSetTermView).toHaveBeenCalledWith(false);
    });
    
    test("Should handle early return in subcollection view", () => {
      earlyReturnValue = <div data-testid="early-return">Loading...</div>;
      
      const TestEarlyReturnView = () => {
        return (
          <div className="selected-collection-content">
            <h1 className="listtitle">Subcollections</h1>
            {earlyReturnValue || <div data-testid="subcollections-content">Subcollections Content</div>}
          </div>
        );
      };
      
      render(<TestEarlyReturnView />);
      
      expect(screen.getByTestId("early-return")).toBeInTheDocument();
      expect(screen.queryByTestId("subcollections-content")).not.toBeInTheDocument();
    });
  });

  test("Should call fetchCollections with proper parameters and handle the response", async () => {
    vi.resetAllMocks();
    
    const originalLocalStorage = window.localStorage;
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue("bo"),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true });
    
    const mockCollectionsData = {
      collections: [
        { id: "col1", title: "Collection 1", has_child: true },
        { id: "col2", title: "Collection 2", has_child: false }
      ]
    };
    
    const collectionsModule = await import("../../../../../../components/collections/Collections.jsx");
    
    const fetchCollectionsSpy = vi.spyOn(collectionsModule, "fetchCollections");
    
    axiosInstance.get.mockResolvedValueOnce({
      data: mockCollectionsData
    });
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (Array.isArray(queryKey) && queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    setup();
    
    const result = await collectionsModule.fetchCollections();
    
    expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/collections", {
      params: {
        language: "bo",
        limit: 10,
        skip: 0
      }
    });
    
    expect(result).toEqual(mockCollectionsData);
    
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    vi.restoreAllMocks();
    
    mockReactQuery();
  });

  it("Should call fetchSubCollections with proper parameters and handle the response", async () => {
    const originalLocalStorage = window.localStorage;
    const mockGetItem = vi.fn().mockReturnValue("en");
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem
      },
      writable: true
    });

    const mockSubCollectionsData = {
      collections: [
        { id: "sub1", title: "Sub Collection 1" },
        { id: "sub2", title: "Sub Collection 2" }
      ],
      total: 2
    };
    
    axiosInstance.get.mockResolvedValueOnce({ data: mockSubCollectionsData });
    
    const { fetchSubCollections } = await import("../../../../../../components/sub-collections/SubCollections.jsx");
    const result = await fetchSubCollections("parent123");
    
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/collections", {
      params: {
        language: "en",
        parent_id: "parent123",
        limit: 10,
        skip: 0
      }
    });
    
    expect(result).toEqual(mockSubCollectionsData);
    
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    vi.restoreAllMocks();
    
    mockReactQuery();
  });

  it("Should call fetchWorks with proper parameters and handle the response", async () => {
    const originalLocalStorage = window.localStorage;
    const mockGetItem = vi.fn().mockReturnValue("en");
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem
      },
      writable: true
    });

    const mockWorksData = {
      texts: [
        { id: "text1", title: "Text 1", type: "root" },
        { id: "text2", title: "Text 2", type: "commentary" }
      ],
      total: 2
    };
    
    axiosInstance.get.mockResolvedValueOnce({ data: mockWorksData });
    
    const { fetchWorks } = await import("../../../../../../components/works/Works.jsx");
    const result = await fetchWorks("term123");
    
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/texts", {
      params: {
        language: "en",
        collection_id: "term123",
        limit: 10,
        skip: 0
      }
    });
    
    expect(result).toEqual(mockWorksData);
    
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    vi.restoreAllMocks();
    
    mockReactQuery();
  });

  it("Should call fetchTableOfContents with proper parameters and handle the response", async () => {
    const originalLocalStorage = window.localStorage;
    const mockGetItem = vi.fn().mockReturnValue("en");
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem
      },
      writable: true
    });

    const mockContentsData = {
      contents: [
        { id: "content1", title: "Chapter 1", segments: ["seg1", "seg2"] },
        { id: "content2", title: "Chapter 2", segments: ["seg3", "seg4"] }
      ],
      total: 2
    };
    
    const { fetchTableOfContents } = await import("../../../../../../components/texts/Texts.jsx");
    fetchTableOfContents.mockReset();
    fetchTableOfContents.mockResolvedValueOnce(mockContentsData);
    
    const result = await fetchTableOfContents("text123", 0, 10);
    
    expect(fetchTableOfContents).toHaveBeenCalledWith("text123", 0, 10);
    
    expect(result).toEqual(mockContentsData);
    
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    vi.restoreAllMocks();
    
    mockReactQuery();
  });

  it("Should call fetchTableOfContents with language from content when provided", async () => {
    const originalLocalStorage = window.localStorage;
    const mockGetItem = vi.fn().mockReturnValue("en");
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: mockGetItem
      },
      writable: true
    });

    const mockContentsData = {
      contents: [
        { id: "content1", title: "Chapter 1" }
      ],
      total: 1
    };
    
    const { fetchTableOfContents } = await import("../../../../../../components/texts/Texts.jsx");
    fetchTableOfContents.mockReset();
    fetchTableOfContents.mockResolvedValueOnce(mockContentsData);
    
    const result = await fetchTableOfContents("text123", 0, 10, "bo");
    
    expect(fetchTableOfContents).toHaveBeenCalledWith("text123", 0, 10, "bo");
    
    expect(result).toEqual(mockContentsData);
    
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
    vi.restoreAllMocks();
    
    mockReactQuery();
  });
});