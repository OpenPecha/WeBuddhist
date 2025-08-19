import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import Resources, {fetchSidePanelData} from "./Resources.jsx";
import {mockTolgee} from "../../../../test-utils/CommonMocks.js";
import axiosInstance from "../../../../config/axios-config.js";

vi.mock("../../../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  getEarlyReturn: vi.fn().mockImplementation(({ isLoading, error }) => {
    if (isLoading) return { earlyReturn: true, component: "common.loading" };
    if (error) return { earlyReturn: true, component: "common.error" };
    return { earlyReturn: false };
  }),
}));


const mockContext = {
  isResourcesPanelOpen: true,
  isTranslationSourceOpen: false,
  openResourcesPanel: vi.fn(),
  closeResourcesPanel: vi.fn(),
  toggleResourcesPanel: vi.fn(),
  openTranslationSource: vi.fn(),
  closeTranslationSource: vi.fn(),
  toggleTranslationSource: vi.fn()
};

vi.mock("../../../../context/PanelContext.jsx", () => ({
  usePanelContext: () => mockContext,
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

vi.mock("../../../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  MENU_ITEMS: [
    { label: "common.share", icon: vi.fn() },
    { label: "menu.item2", icon: vi.fn(), isHeader: true },
    { label: "connection_panel.compare_text", icon: vi.fn() },
    { label: "sheet.add_to_sheet", icon: vi.fn() },
    { label: "connection_panel.notes", icon: vi.fn() }
  ],
}));

vi.mock("./components/root-texts/RootText.jsx", () => ({
  default: ({ setIsRootTextView }) => (
    <div data-testid="root-text-view">
      Root Text View
      <button onClick={() => setIsRootTextView("main")}>Back</button>
    </div>
  )
}));

vi.mock("./components/compare-text/CompareTextView.jsx", () => ({
  default: ({ setIsCompareTextView, addChapter, currentChapter }) => (
    <div data-testid="compare-text-view">
      Compare Text View
      <button onClick={() => setIsCompareTextView("main")}>Back</button>
      <button data-testid="add-chapter-btn" onClick={() => addChapter && addChapter({ textId: "test456", segmentId: "seg456" }, currentChapter)}>Add Chapter</button>
    </div>
  )
}));

vi.mock("./components/individual-text-search/IndividualTextSearch.jsx", () => ({
  default: ({ onClose, textId, handleSegmentNavigate }) => (
    <div data-testid="search-view">
      Search View for text: {textId}
      <button onClick={() => onClose()}>Close</button>
      <button data-testid="navigate-btn" onClick={() => handleSegmentNavigate && handleSegmentNavigate("test123")}>Navigate</button>
    </div>
  )
}));

vi.mock("./components/share-view/ShareView.jsx", () => ({
  default: ({ segmentId, setIsShareView }) => (
    <div data-testid="share-view">
      Share View for segment: {segmentId}
      <button onClick={() => setIsShareView("main")}>Back</button>
    </div>
  )
}));

vi.mock("./components/translation-view/TranslationView.jsx", () => ({
  default: ({ segmentId, setIsTranslationView, expandedTranslations, setExpandedTranslations, addChapter, currentChapter, setVersionId }) => (
    <div data-testid="translation-view">
      Translation View for segment: {segmentId}
      <button onClick={() => setIsTranslationView("main")}>Back</button>
      <button data-testid="expand-translation" onClick={() => setExpandedTranslations({ ...expandedTranslations, test123: true })}>Expand</button>
      <button data-testid="set-version" onClick={() => setVersionId && setVersionId("version2")}>Set Version</button>
    </div>
  )
}));

vi.mock("./components/related-texts/RelatedTexts.jsx", () => ({
  default: ({ segmentId, setIsCommentaryView, expandedCommentaries, setExpandedCommentaries }) => (
    <div data-testid="commentary-view">
      Commentary View for segment: {segmentId}
      <button onClick={() => setIsCommentaryView("main")}>Back</button>
      <button data-testid="expand-commentary" onClick={() => setExpandedCommentaries({ ...expandedCommentaries, test123: true })}>Expand</button>
    </div>
  )
}));

describe("Resources Side Panel", () => {
  const queryClient = new QueryClient();
  const mockTextData = {
    text: {
      title: "Test Title",
      id: "test123"
    }
  };
  const mockSidePanelData = {
    segment_info: {
      short_url: "https://test.com/share",
      translations: 2,
      text_id: "text123",
      resources: {
        sheets: 3
      },
      related_text: {
        commentaries: 2,
        root_text: 1
      }
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "textDetail") {
        return { data: mockTextData, isLoading: false };
      } else if (queryKey[0] === "sidePanel") {
        return { data: mockSidePanelData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo-IN");
  });

  const setup = (props = {}) => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
              <Resources 
                segmentId={"test123"} 
                addChapter={() => vi.fn()} 
                setVersionId={() => vi.fn()}
                versionId={"version1"}
                {...props}
              />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("fetchSidePanelData makes correct API call", async () => {
    const segmentId = "test123";
    axiosInstance.get.mockResolvedValueOnce({ data: mockSidePanelData });

    const result = await fetchSidePanelData(segmentId);

    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/segments/${segmentId}/info`,);
    expect(result).toEqual(mockSidePanelData);
  });



  test("shows translation view when clicking on translations option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { 
          data: {
            segment_info: {
              translations: 5
            }
          }
        };
      }
      return { data: null, isLoading: false };
    });
    
    const { container } = setup();
    
    const translationText = screen.getByText(/connection_pannel\.translations/);
    fireEvent.click(translationText);
    expect(screen.queryByText(/side_nav\.about_text/)).not.toBeInTheDocument();
  });

  test("shows commentary view when clicking on commentary option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { 
          data: {
            segment_info: {
              related_text: {
                commentaries: 2
              }
            }
          }
        };
      }
      return { data: null, isLoading: false };
    });
    
    const { container } = setup();
    const commentaryText = screen.getByText(/text\.commentary/);
    fireEvent.click(commentaryText);
    
    expect(screen.queryByText(/side_nav\.about_text/)).not.toBeInTheDocument();
  });

  test("shows share view when clicking on share menu item", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { data: mockSidePanelData };
      }
      return { data: null, isLoading: false };
    });
    
    const { container } = setup();
    const shareItems = screen.getAllByText(/common\.share/);
    fireEvent.click(shareItems[0]);
    
    expect(screen.queryByText(/side_nav\.about_text/)).not.toBeInTheDocument();
  });

  test("toggles visibility with showPanel prop", () => {
    const originalIsResourcesPanelOpen = mockContext.isResourcesPanelOpen;
    mockContext.isResourcesPanelOpen = false;
    
    const { container } = render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Resources 
              segmentId={"test123"} 
              setVersionId={() => vi.fn()}
              versionId={"version1"}
            />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    
    let panel = container.querySelector('.right-panel');
    expect(panel).not.toHaveClass('show');
    mockContext.isResourcesPanelOpen = originalIsResourcesPanelOpen;
  });

  test("shows root text view when clicking on root text option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return {
          data: {
            segment_info: {
              related_text: {
                root_text: 2,
              },
            },
          },
        };
      }
      return { data: null, isLoading: false };
    });

    setup();
    const rootTextElement = screen.getByText(/text\.root_text/);
    fireEvent.click(rootTextElement);

    expect(screen.getByTestId("root-text-view")).toBeInTheDocument();
  });

  test("renders menu items correctly including header items", () => {
    setup();

    const headerItem = screen.getByText("menu.item2");
    expect(headerItem.closest("button")).toHaveClass("text-great");
  });

  test("renders the panel backdrop that closes the panel when clicked", () => {
    setup();

    const backdrop = document.querySelector(".panel-backdrop");
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop);
    expect(mockContext.closeResourcesPanel).toHaveBeenCalled();
  });

  test("shows compare text view when clicking on compare text menu item", () => {
    setup();
    
    const compareTextItem = screen.getByText(/connection_panel\.compare_text/);
    fireEvent.click(compareTextItem);
    
    expect(screen.getByTestId("compare-text-view")).toBeInTheDocument();
  });

  test("shows search view when clicking on search button", () => {
    setup();
    
    const searchButton = screen.getByText(/connection_panel\.search_in_this_text/);
    fireEvent.click(searchButton);
    
    expect(screen.getByTestId("search-view")).toBeInTheDocument();
    expect(screen.getByText(`Search View for text: ${mockSidePanelData.segment_info.text_id}`)).toBeInTheDocument();
  });

  test("handles segment navigation in search view", () => {
    const mockHandleSegmentNavigate = vi.fn();
    
    setup({ handleSegmentNavigate: mockHandleSegmentNavigate });
    
    const searchButton = screen.getByText(/connection_panel\.search_in_this_text/);
    fireEvent.click(searchButton);
    
    const navigateButton = screen.getByTestId("navigate-btn");
    fireEvent.click(navigateButton);
    
    expect(mockHandleSegmentNavigate).toHaveBeenCalledWith("test123");
  });

  test("manages expanded states for commentaries", () => {
    setup();
    
    const commentaryText = screen.getByText(/text\.commentary/);
    fireEvent.click(commentaryText);
    
    const expandButton = screen.getByTestId("expand-commentary");
    fireEvent.click(expandButton);
    
    expect(expandButton).toBeInTheDocument();
  });

  test("manages expanded states for translations", () => {
    setup();
    
    const translationText = screen.getByText(/connection_pannel\.translations/);
    fireEvent.click(translationText);
    
    const expandButton = screen.getByTestId("expand-translation");
    fireEvent.click(expandButton);
    
    expect(expandButton).toBeInTheDocument();
  });

  test("sets version ID when provided with setVersionId prop", () => {
    const mockSetVersionId = vi.fn();
    
    setup({ setVersionId: mockSetVersionId });
    
    const translationText = screen.getByText(/connection_pannel\.translations/);
    fireEvent.click(translationText);
    
    const setVersionButton = screen.getByTestId("set-version");
    fireEvent.click(setVersionButton);
    
    expect(mockSetVersionId).toHaveBeenCalledWith("version2");
  });

  test("renders resources section when sheets are available", () => {
    setup();
    
    const resourcesText = screen.getByText(/common\.sheets/);
    expect(resourcesText).toBeInTheDocument();
    expect(resourcesText.textContent).toContain("(3)");
  });

  test("uses handleClose prop when provided instead of closeResourcesPanel", () => {
    const mockHandleClose = vi.fn();
    
    const { container } = setup({ handleClose: mockHandleClose });
    
    const closeButton = container.querySelector('.close-icon');
    fireEvent.click(closeButton);
    
    expect(mockHandleClose).toHaveBeenCalled();
    expect(mockContext.closeResourcesPanel).not.toHaveBeenCalled();
  });

  test("filters out specific menu items from display", () => {
    setup();
    
    expect(screen.queryByText(/sheet\.add_to_sheet/)).not.toBeInTheDocument();
    expect(screen.queryByText(/connection_panel\.notes/)).not.toBeInTheDocument();
  });

  test("handles edge case when sidePanelData is undefined", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: undefined,
      isLoading: false
    }));
    
    setup();
    
    expect(screen.getByText(/panel\.resources/)).toBeInTheDocument();
    
    expect(screen.queryByText(/common\.sheets/)).not.toBeInTheDocument();
    expect(screen.queryByText(/text\.commentary/)).not.toBeInTheDocument();
    expect(screen.queryByText(/text\.root_text/)).not.toBeInTheDocument();
    expect(screen.queryByText(/connection_pannel\.translations/)).not.toBeInTheDocument();
  });

  test("handles edge case when related_text properties are missing", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: {
        segment_info: {
          translations: 2,
        }
      },
      isLoading: false
    }));
    
    setup();
    
    expect(screen.getByText(/panel\.resources/)).toBeInTheDocument();
    
    expect(screen.queryByText(/text\.related_texts/)).not.toBeInTheDocument();
  });

  test("handles addChapter prop in CompareTextView", () => {
    const mockAddChapter = vi.fn();
    const mockCurrentChapter = { index: 1 };
    
    setup({ 
      addChapter: mockAddChapter,
      currentChapter: mockCurrentChapter
    });
    
    const compareTextItem = screen.getByText(/connection_panel\.compare_text/);
    fireEvent.click(compareTextItem);
    
    const addChapterButton = screen.getByTestId("add-chapter-btn");
    fireEvent.click(addChapterButton);
    
    expect(mockAddChapter).toHaveBeenCalledWith(
      { textId: "test456", segmentId: "seg456" },
      mockCurrentChapter
    );
  });

  test("handles loading state", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true
    }));
    
    setup();
    
    expect(screen.getByText(/panel\.resources/)).toBeInTheDocument();
  });
})