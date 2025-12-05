import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import RootTextView, { fetchRootTextData } from "./RootText.js";
import "@testing-library/jest-dom";
import {mockTolgee} from "../../../../../../test-utils/CommonMocks.js";
import axiosInstance from "../../../../../../config/axios-config.js";
import {PanelProvider} from "../../../../../../context/PanelContext.js";
vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (language) => {
    switch (language) {
      case "bo":
        return "bo-text";
      case "en":
        return "en-text";
      case "sa":
        return "sa-text";
      default:
        return "en-text";
    }
  },
}));

vi.mock("../../../../config/axios-config.js", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("RootTextView", () => {
  const queryClient = new QueryClient();
  const mockRootTextData = {
    segment_root_mapping: [
      {
        text_id: "mock-root-text-1",
        title: "རྩ་བའི་གཞུང་དང་པོ།",
        language: "bo",
        segments: [
          {
            segment_id: "mock-segment-id",
            content:
              "<p>འདི་ནི་རྩ་བའི་གཞུང་གི་ནང་དོན་ཡིན།</p><p>གཉིས་པའི་བརྗོད་པ།</p>",
          },
        ],
      },
      {
        text_id: "mock-root-text-2",
        title: "Root Text on Buddhist Philosophy",
        language: "en",
        segments: [
          {
            segment_id: "mock-segment-id",
            content:
              "<p>This is a sample root text about Buddhist philosophy.</p><p>Second paragraph with a <span class='footnote-marker'>*</span><span class='footnote'>This is a footnote</span> footnote.</p>",
          },
        ],
      },
    ],
  };

  const mockEmptyRootTextData = {
    segment_root_mapping: [],
  };

  let mockSetIsRootTextView;
  let mockAddChapter;
  let mockCloseResourcesPanel;
  let currentChapter;
  let mockHandleNavigate;
  beforeEach(() => {
    vi.resetAllMocks();
    mockSetIsRootTextView = vi.fn();
    mockAddChapter = vi.fn();
    mockCloseResourcesPanel = vi.fn();
    mockHandleNavigate = vi.fn();
    currentChapter = {
      textId: "mock-root-text-1",
      segmentId: "mock-segment-id",
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "rootTexts") {
        return { data: mockRootTextData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });

    // Mock document.querySelector for event listener tests
    document.querySelector = vi.fn().mockImplementation((selector) => {
      if (selector === ".root-texts-list") {
        return {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return null;
    });
  });

  const setup = (props = {}) => {
    const defaultProps = {
      segmentId: "mock-segment-id",
      setIsRootTextView: mockSetIsRootTextView,
      addChapter: mockAddChapter,
      sectionindex: 0,
      currentChapter: currentChapter,
      handleNavigate: mockHandleNavigate,
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <PanelProvider>
              <RootTextView {...defaultProps} {...props} />
            </PanelProvider>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders root texts with correct title and count", () => {
    setup();
    expect(screen.getByText("text.root_text (2)")).toBeInTheDocument();
  });

  test("fetchRootTextData makes correct API call", async () => {
    const segmentId = "mock-segment-id";
    axiosInstance.get.mockResolvedValueOnce({ data: mockRootTextData });

    const result = await fetchRootTextData(segmentId);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/v1/segments/${segmentId}/root_text`
    );
    expect(result).toEqual(mockRootTextData);
  });

  test("fetchRootTextData handles errors gracefully", async () => {
    const segmentId = "mock-segment-id";
    axiosInstance.get.mockRejectedValueOnce(new Error("API Error"));

    try {
      await fetchRootTextData(segmentId);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe("API Error");
    }
  });

  test("renders correctly with empty root texts", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce(() => ({
      data: mockEmptyRootTextData,
      isLoading: false
    }));

    setup();
    
    // Should not display any count when there are no root texts
    expect(screen.getByText("text.root_text")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  test("applies correct language class to root text titles", () => {
    setup();
    
    // First, find all elements with the class 'root-text-title'
    const rootTextTitles = document.querySelectorAll('.root-text-title');
    
    // Check that we have the expected number of titles
    expect(rootTextTitles.length).toBe(2);
    
    // Check that the first title (Tibetan) has the bo-text class
    expect(rootTextTitles[0]).toHaveClass('bo-text');
    
    // Check that the second title (English) has the en-text class
    expect(rootTextTitles[1]).toHaveClass('en-text');
  });
  
  test("calls setIsRootTextView when close icon is clicked", () => {
    setup();
    // Find the close icon
    const closeIcon = document.getElementsByClassName('close-icon')[0];
    
    // Click the close icon
    fireEvent.click(closeIcon);
    // Verify
    expect(mockSetIsRootTextView).toHaveBeenCalledWith("main");
  });

  test("sets up event listener for footnote clicks on mount", () => {
    // Mock a real DOM element
    const mockRootTextsList = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    // Mock document.querySelector to return our mock element
    document.querySelector = vi.fn().mockImplementation((selector) => {
      if (selector === ".root-texts-list") {
        return mockRootTextsList;
      }
      return null;
    });
    
    setup();
    // Verify addEventListener was called correctly
    expect(mockRootTextsList.addEventListener).toHaveBeenCalledWith(
      'click', 
      expect.any(Function)
    );
    // Actual handler function
    const handleFootnoteClick = mockRootTextsList.addEventListener.mock.calls[0][1];
    
    const mockFootnoteMarker = {
      classList: {
        contains: vi.fn().mockReturnValue(true)
      },
      nextElementSibling: {
        classList: {
          contains: vi.fn().mockReturnValue(true),
          toggle: vi.fn()
        }
      }
    };
    
    const mockEvent = {
      target: mockFootnoteMarker,
      stopPropagation: vi.fn(),
      preventDefault: vi.fn()
    };
    // Call the handler function
    const result = handleFootnoteClick(mockEvent);
    //Verify
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockFootnoteMarker.nextElementSibling.classList.toggle).toHaveBeenCalledWith('active');
    expect(result).toBe(false);
  });
});
