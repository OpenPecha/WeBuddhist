import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
} from "../../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../../config/axios-config.js";
import SheetDetailPageWithPanelContext, { fetchSheetData, deleteSheet } from "./SheetDetailPage.jsx";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import * as Constants from "../sheet-utils/Constant";

mockAxios();
mockUseAuth();
mockReactQuery();

axiosInstance.delete = vi.fn();

vi.mock("../../resources-side-panel/Resources", () => ({
  default: ({ segmentId, handleClose }) => (
    <div data-testid="resources-panel">
      <button onClick={handleClose}>Close</button>
      <div>Resources for segment: {segmentId}</div>
    </div>
  ),
}));

vi.mock("../../chapterV2/utils/resources/Resources.jsx", () => ({
  default: ({ segmentId, handleClose }) => (
    <div data-testid="resources-panel">
      <button onClick={handleClose}>Close</button>
      <div>Resources for segment: {segmentId}</div>
    </div>
  ),
}));

vi.mock("../local-components/modals/sheet-delete-modal/SheetDeleteModal", () => ({
  SheetDeleteModal: ({ isOpen, onClose, onDelete }) => 
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onClose} data-testid="cancel-delete">Cancel</button>
        <button onClick={onDelete} data-testid="confirm-delete">Delete</button>
      </div>
    ) : null,
}));

vi.mock("react-youtube", () => ({
  default: ({ videoId }) => (
    <div data-testid="youtube-player" data-videoid={videoId}>
      YouTube Player: {videoId}
    </div>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: vi.fn(() => [
      new URLSearchParams(),
      vi.fn(),
    ]),
    useNavigate: vi.fn(() => mockNavigate),
  };
});

const mockNavigate = vi.fn();

vi.mock("../local-components/Editors/Elements/pecha-element/PechaElement.jsx", () => ({
  fetchSegmentDetails: vi.fn()
}));

import { fetchSegmentDetails } from "../local-components/Editors/Elements/pecha-element/PechaElement.jsx";
const mockFetchSegmentDetails = vi.mocked(fetchSegmentDetails);

describe("SheetDetailPage Component", () => {
  const queryClient = new QueryClient();
  const mockSheetData = {
    sheet_title: "Test Sheet",
    views: 42,
    publisher: {
      name: "Test User",
      username: "testuser",
      avatar_url: "https://example.com/avatar.jpg",
    },
    content: {
      segments: [
        {
          segment_id: "segment1",
          type: "source",
          content: "Source content",
          language: "bo",
          text_title: "Source Title",
        },
        {
          segment_id: "segment2",
          type: "content",
          content: "Text content",
        },
        {
          segment_id: "segment3",
          type: "image",
          content: "https://example.com/image.jpg",
        },
      ],
    },
  };

  const mockSheetDataWithUserInfo = {
    ...mockSheetData,
    publisher: {
      ...mockSheetData.publisher,
      email: "testuser@example.com"
    },
    is_published: false
  };
  
  const mockUserInfoData = {
    email: "testuser@example.com"
  }

  let extractSpotifyInfoSpy;
  let mockSetSearchParams;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockSetSearchParams = vi.fn();
    useParams.mockReturnValue({ sheetSlugAndId: "test-sheet-626ddc35-a146-4bca-a3a3-b8221c501df3" });
    
    const mockUseSearchParams = vi.fn(() => [
      new URLSearchParams(),
      mockSetSearchParams,
    ]);
    
    vi.doMock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return {
        ...actual,
        useParams: vi.fn().mockReturnValue({ sheetSlugAndId: "test-sheet-626ddc35-a146-4bca-a3a3-b8221c501df3" }),
        useSearchParams: mockUseSearchParams,
        useNavigate: vi.fn(() => mockNavigate),
      };
    });

    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKeyOrConfig, queryFn, options) => {
      if (Array.isArray(queryKeyOrConfig)) {
        if (queryKeyOrConfig[0] === 'shortUrl') {
          return { 
            data: { shortUrl: 'https://short.url/test' },
            isLoading: false 
          };
        }
      } 
      else if (queryKeyOrConfig && queryKeyOrConfig.queryKey) {
        if (queryKeyOrConfig.queryKey[0] === 'userInfo') {
          return { data: mockUserInfoData, isLoading: false, error: null };
        }
      }
      
      return { data: mockSheetDataWithUserInfo, isLoading: false, error: null };
    });

    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: vi.fn(),
      isLoading: false,
    }));

    extractSpotifyInfoSpy = vi.spyOn(Constants, "extractSpotifyInfo").mockImplementation(() => null);
    
    mockFetchSegmentDetails.mockResolvedValue({
      text: {
        text_id: "mock-text-id-123",
        title: "Mock Text Title",
        language: "en"
      },
      content: "Mock segment content"
    });
  });

  const mockAddChapter = vi.fn();
  const mockCurrentChapter = { id: 'test-chapter', textId: 'test-text-id' };

  afterEach(() => {
    vi.clearAllMocks();
    mockAddChapter.mockClear();
  });

  const setup = (props = {}) => {
    const defaultProps = {
      addChapter: mockAddChapter,
      currentChapter: mockCurrentChapter,
      ...props
    };
    
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <SheetDetailPageWithPanelContext {...defaultProps} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders sheet details correctly", () => {
    setup();
    expect(screen.getByText("Test Sheet")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Source Title")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }));

    setup();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays not found message when sheet data is null", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("displays not found message when segments array is empty", () => {
    const emptySheetData = {
      ...mockSheetData,
      content: {
        segments: [],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: emptySheetData,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("displays not found message when fetchSheetData fails", async () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch sheet"),
    }));
    axiosInstance.get.mockRejectedValueOnce(new Error("Failed to fetch sheet"));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("renders video segment correctly", () => {
    const videoSheetData = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "video1",
            type: "video",
            content: "dQw4w9WgXcQ",
          },
        ],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: videoSheetData,
      isLoading: false,
      error: null,
    }));

    setup();
    const youtubePlayer = screen.getByTestId("youtube-player");
    expect(youtubePlayer).toBeInTheDocument();
    expect(youtubePlayer).toHaveAttribute("data-videoid", "dQw4w9WgXcQ");
    expect(screen.getByText("YouTube Player: dQw4w9WgXcQ")).toBeInTheDocument();
  });

  test("renders different segment types correctly", () => {
    setup();
    
    expect(screen.getByText("Source Title")).toBeInTheDocument();
    expect(screen.getByAltText("source icon")).toBeInTheDocument();
    
    expect(screen.getByText("Text content")).toBeInTheDocument();
    
    expect(screen.getByAltText("Sheet content")).toBeInTheDocument();
  });

  test("renders toolbar with correct icons and view count", () => {
    setup();
    
    expect(screen.getByText("42")).toBeInTheDocument();
    
    const toolbar = screen.getByRole("main");
    expect(toolbar).toBeInTheDocument();
  });

  test("renders user info with avatar, name and username", () => {
    setup();
    
    const avatar = screen.getByAltText("user");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  test("handles sheet with zero views", () => {
    const sheetWithZeroViews = {
      ...mockSheetData,
      views: 0,
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetWithZeroViews,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("handles sheet with undefined views", () => {
    const sheetWithUndefinedViews = {
      ...mockSheetData,
      views: undefined,
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetWithUndefinedViews,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("calls addChapter with correct parameters when source segment is clicked", async () => {
    setup();
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    fireEvent.click(sourceButton);
    
    await waitFor(() => {
      expect(mockAddChapter).toHaveBeenCalledWith(
        {
          textId: "mock-text-id-123",
          segmentId: "segment1"
        },
        mockCurrentChapter,
        true
      );
    });
  });

  test("calls addChapter when provided as prop", async () => {
    const mockAddChapterLocal = vi.fn();
    setup({ addChapter: mockAddChapterLocal });
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    fireEvent.click(sourceButton);
    
    await waitFor(() => {
      expect(mockAddChapterLocal).toHaveBeenCalledWith(
        {
          textId: "mock-text-id-123",
          segmentId: "segment1"
        },
        mockCurrentChapter,
        true
      );
    });
  });


  test("handles fetchSegmentDetails returning data without text property", async () => {
    mockFetchSegmentDetails.mockResolvedValueOnce({
      text_id: "fallback-text-id-456",
      content: "Mock segment content"
    });
    
    setup();
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    fireEvent.click(sourceButton);
    
    await waitFor(() => {
      expect(mockAddChapter).toHaveBeenCalledWith(
        {
          textId: "fallback-text-id-456",
          segmentId: "segment1"
        },
        mockCurrentChapter,
        true
      );
    });
  });

  test("handles fetchSegmentDetails returning data with both text.text_id and text_id undefined", async () => {
    mockFetchSegmentDetails.mockResolvedValueOnce({
      content: "Mock segment content"
    });
    
    setup();
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    fireEvent.click(sourceButton);
    
    await waitFor(() => {
      expect(mockAddChapter).toHaveBeenCalledWith(
        {
          textId: undefined,
          segmentId: "segment1"
        },
        mockCurrentChapter,
        true
      );
    });
  });

  test("calls fetchSegmentDetails with correct segment_id", async () => {
    setup();
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    fireEvent.click(sourceButton);
    
    await waitFor(() => {
      expect(mockFetchSegmentDetails).toHaveBeenCalledWith("segment1");
    });
  });

  test("source button click is async and waits for fetchSegmentDetails", async () => {
    let resolvePromise;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockFetchSegmentDetails.mockReturnValueOnce(pendingPromise);
    
    setup();
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    fireEvent.click(sourceButton);
    
    expect(mockAddChapter).not.toHaveBeenCalled();
    
    resolvePromise({
      text: {
        text_id: "async-text-id",
        title: "Async Text Title",
        language: "en"
      }
    });
    
    await waitFor(() => {
      expect(mockAddChapter).toHaveBeenCalledWith(
        {
          textId: "async-text-id",
          segmentId: "segment1"
        },
        mockCurrentChapter,
        true
      );
    });
  });

  test("multiple source segment clicks call fetchSegmentDetails multiple times", async () => {
    const sheetWithMultipleSources = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "segment1",
            type: "source",
            content: "Source content 1",
            language: "bo",
            text_title: "Source Title 1",
          },
          {
            segment_id: "segment2",
            type: "source",
            content: "Source content 2",
            language: "bo",
            text_title: "Source Title 2",
          }
        ]
      }
    };
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((config) => {
      if (config.queryKey?.[0] === 'sheetData') {
        return {
          data: sheetWithMultipleSources,
          isLoading: false
        };
      }
      return {
        data: mockUserInfoData,
        isLoading: false
      };
    });
    
    const { container } = setup();
    
    const sourceSegmentButtons = container.querySelectorAll('.segment-source');
    expect(sourceSegmentButtons).toHaveLength(2);
    
    fireEvent.click(sourceSegmentButtons[0]);
    
    await waitFor(() => {
      expect(mockFetchSegmentDetails).toHaveBeenCalledWith("segment1");
    });
    
    fireEvent.click(sourceSegmentButtons[1]);
    
    await waitFor(() => {
      expect(mockFetchSegmentDetails).toHaveBeenCalledWith("segment2");
    });
    
    expect(mockFetchSegmentDetails).toHaveBeenCalledTimes(2);
  });



  test("opens delete modal when trash icon is clicked", () => {
  setup();
  
  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  
  const trashIcon = screen.getByRole("main").querySelector('svg[data-testid="trash-icon"]');
  
  const toolbarItems = screen.getByRole("main").querySelectorAll('.view-toolbar-item');
  const trashButton = toolbarItems[1]; 
  const trashIconElement = trashButton.querySelector('svg:nth-last-child(2)'); 
  
  fireEvent.click(trashIconElement);
  
  expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  expect(screen.getByTestId("cancel-delete")).toBeInTheDocument();
  expect(screen.getByTestId("confirm-delete")).toBeInTheDocument();
  });

  test("opens delete modal by clicking trash icon alternative approach", () => {
  setup();
  
  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  
  const svgElements = screen.getAllByRole("main").flatMap(element => 
    Array.from(element.querySelectorAll('svg'))
  );
  
  const trashIcon = svgElements.find(svg => {
    const paths = svg.querySelectorAll('path');
    return paths.length > 0; 
  });

  const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
  const trashElement = toolbarContainer.querySelector('svg:nth-last-child(2)');
  
  fireEvent.click(trashElement);

  expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  });

  test("modal state management - open and close", () => {
  setup();

  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();

  const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
  const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
  fireEvent.click(trashIcon);

  expect(screen.getByTestId("delete-modal")).toBeInTheDocument();

  const cancelButton = screen.getByTestId("cancel-delete");
  fireEvent.click(cancelButton);

  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  test("delete modal remains closed initially", () => {
  setup();

  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  
  const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
  const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
  expect(trashIcon).toBeInTheDocument();
  
  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  test("can open and close modal multiple times", () => {
  setup();
  
  const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
  const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');

  fireEvent.click(trashIcon);
  expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  
  fireEvent.click(screen.getByTestId("cancel-delete"));
  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();

  fireEvent.click(trashIcon);
  expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  
  fireEvent.click(screen.getByTestId("cancel-delete"));
  expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  test("other toolbar icons don't trigger delete modal", () => {
  setup();
  
  const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
  const allIcons = toolbarContainer.querySelectorAll('svg:nth-last-child(2)');

  for (let i = 0; i < allIcons.length - 1; i++) {
    fireEvent.click(allIcons[i]);
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  }

  fireEvent.click(allIcons[allIcons.length - 1]);
  expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  });

  test("closes delete modal when cancel is clicked", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: false,
    }));

    setup();
    
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  test("calls deleteSheet mutation when delete is confirmed", async () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: false,
    }));

    setup();
    expect(mockMutate).toBeDefined();
  });

  test("handles segment with no language (defaults to en)", () => {
    const sheetWithNoLanguage = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "segment1",
            type: "source",
            content: "Source content",
            text_title: "Source Title",
          },
        ],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetWithNoLanguage,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("Source Title")).toBeInTheDocument();
  });

  test("renders content segment with dangerouslySetInnerHTML", () => {
    const sheetWithHtmlContent = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "segment1",
            type: "content",
            content: "<strong>Bold content</strong>",
          },
        ],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetWithHtmlContent,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("Bold content")).toBeInTheDocument();
  });

  test("renders source segment with dangerouslySetInnerHTML", () => {
    const sheetWithHtmlSource = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "segment1",
            type: "source",
            content: "<em>Italic source</em>",
            language: "bo",
            text_title: "Source Title",
          },
        ],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetWithHtmlSource,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("Italic source")).toBeInTheDocument();
  });

  test("returns null for unknown segment type", () => {
    const sheetWithUnknownSegment = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "segment1",
            type: "unknown",
            content: "Unknown content",
          },
        ],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetWithUnknownSegment,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("Test Sheet")).toBeInTheDocument();
  });

  describe("handleDeleteSheet function tests", () => {
  test("handleDeleteSheet is called with correct context", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: false,
    }));

    setup();

    const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
    const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');

    fireEvent.click(trashIcon);
    fireEvent.click(screen.getByTestId("confirm-delete"));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  test("handleDeleteSheet works when mutation is in loading state", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: true, 
    }));

    setup();

    const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
    const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
    fireEvent.click(trashIcon);

    const confirmButton = screen.getByTestId("confirm-delete");
    fireEvent.click(confirmButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  test("handleDeleteSheet function is properly bound to confirm button", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: false,
    }));

    setup();

    const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
    const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
    fireEvent.click(trashIcon);

    const confirmButton = screen.getByTestId("confirm-delete");
    expect(confirmButton).toBeInTheDocument();

    const cancelButton = screen.getByTestId("cancel-delete");
    fireEvent.click(cancelButton);
    expect(mockMutate).not.toHaveBeenCalled();

    fireEvent.click(trashIcon);
    fireEvent.click(screen.getByTestId("confirm-delete"));
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  test("handleDeleteSheet function doesn't interfere with other modal actions", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: false,
    }));

    setup();

    const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
    const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
    fireEvent.click(trashIcon);

    const cancelButton = screen.getByTestId("cancel-delete");
    fireEvent.click(cancelButton);
    fireEvent.click(cancelButton);
    
    expect(mockMutate).not.toHaveBeenCalled();

    fireEvent.click(trashIcon);
    fireEvent.click(screen.getByTestId("confirm-delete"));
    
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  test("handleDeleteSheet maintains function reference integrity", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: false,
    }));
    const { rerender } = render(
      <Router>
        <QueryClientProvider client={new QueryClient()}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <SheetDetailPageWithPanelContext />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
    const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
    fireEvent.click(trashIcon);
    fireEvent.click(screen.getByTestId("confirm-delete"));
    
    expect(mockMutate).toHaveBeenCalledTimes(1);

    rerender(
      <Router>
        <QueryClientProvider client={new QueryClient()}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <SheetDetailPageWithPanelContext />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    fireEvent.click(trashIcon);
    fireEvent.click(screen.getByTestId("confirm-delete"));
    
    expect(mockMutate).toHaveBeenCalledTimes(2);
  });
  });

  test("handleDeleteSheet error handling", () => {
  const mockMutate = vi.fn();
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  let deleteOnErrorCallback;
  
  vi.spyOn(reactQuery, "useMutation").mockImplementation((config) => {
    if (config.mutationFn && config.mutationFn.toString().includes('deleteSheet')) {
      deleteOnErrorCallback = config.onError;
    }
    return {
      mutate: mockMutate,
      isLoading: false,
    };
  });

  setup();

  const toolbarContainer = screen.getByRole("main").querySelector('.view-toolbar-item:last-child');
  const trashIcon = toolbarContainer.querySelector('svg:nth-last-child(2)');
  fireEvent.click(trashIcon);
  fireEvent.click(screen.getByTestId("confirm-delete"));

  const testError = new Error("Delete failed");
  deleteOnErrorCallback(testError);

  expect(consoleSpy).toHaveBeenCalledWith("Error deleting sheet:", testError);
  
  consoleSpy.mockRestore();
  });

  describe("getAudioSrc function tests", () => {
    test("renders audio segment with Spotify URL correctly", () => {
      extractSpotifyInfoSpy.mockReturnValue({ type: "track", id: "4iV5W9uYEdYUVa79Axb7Rh" });

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio1",
              type: "audio",
              content: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio1");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("https://open.spotify.com/embed/track/4iV5W9uYEdYUVa79Axb7Rh?utm_source=generator");
      expect(extractSpotifyInfoSpy).toHaveBeenCalledWith("https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh");
    });

    test("renders audio segment with SoundCloud URL correctly", () => {
      extractSpotifyInfoSpy.mockReturnValue(null);

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio2",
              type: "audio",
              content: "https://soundcloud.com/test/track"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio2");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Ftest%2Ftrack&color=%23ff5500");
      expect(extractSpotifyInfoSpy).toHaveBeenCalledWith("https://soundcloud.com/test/track");
    });

    test("handles audio segment with unsupported URL (returns null)", () => {
      extractSpotifyInfoSpy.mockReturnValue(null);

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio3",
              type: "audio",
              content: "https://example.com/unsupported-audio"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio3");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("");
      expect(extractSpotifyInfoSpy).toHaveBeenCalledWith("https://example.com/unsupported-audio");
    });

    test("renders audio segment with Spotify album URL", () => {
      extractSpotifyInfoSpy.mockReturnValue({ type: "album", id: "1A2B3C4D5E6F7G8H9I0J" });

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio4",
              type: "audio",
              content: "https://open.spotify.com/album/1A2B3C4D5E6F7G8H9I0J"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio4");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("https://open.spotify.com/embed/album/1A2B3C4D5E6F7G8H9I0J?utm_source=generator");
    });

    test("renders audio segment with Spotify playlist URL", () => {
      extractSpotifyInfoSpy.mockReturnValue({ type: "playlist", id: "37i9dQZF1DX0XUsuxWHRQd" });

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio5",
              type: "audio",
              content: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio5");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator");
    });
  });

  test("fetchSheetData calls the correct API endpoint", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockSheetData });
    
    const sheetId = "test-id";
    await fetchSheetData(sheetId);
    
    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/sheets/${sheetId}`, {
      params: {
        skip: 0,
        limit: 10,
      }
    });
  });

  test("fetchSheetData handles API errors", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("API Error"));
    
    const sheetId = "test-id";
    
    await expect(fetchSheetData(sheetId)).rejects.toThrow("API Error");
    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/sheets/${sheetId}`, {
      params: {
        skip: 0,
        limit: 10,
      }
    });
  });

  test("deleteSheet calls the correct API endpoint", async () => {
    axiosInstance.delete.mockClear();
    axiosInstance.delete.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    
    const sheetId = "test-id";
    const result = await deleteSheet(sheetId);
    
    expect(axiosInstance.delete).toHaveBeenCalledWith(`/api/v1/sheets/${sheetId}`);
    expect(result).toBe(true);
  });

  test("deleteSheet handles API errors", async () => {
    axiosInstance.delete.mockClear();
    axiosInstance.delete.mockRejectedValueOnce(new Error("Delete failed"));
    
    const sheetId = "test-id";
    
    await expect(deleteSheet(sheetId)).rejects.toThrow("Delete failed");
    expect(axiosInstance.delete).toHaveBeenCalledWith(`/api/v1/sheets/${sheetId}`);
  });

  test("deleteSheetMutation navigates to community page on success", async () => {
    const navigateMock = vi.fn();
    const closeModalMock = vi.fn();
    
    const onSuccess = () => {
      closeModalMock();
      navigateMock('/community');
    };
    
    axiosInstance.delete.mockClear();
    axiosInstance.delete.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    
    await deleteSheet("626ddc35-a146-4bca-a3a3-b8221c501df3");
    onSuccess();
    
    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/api/v1/sheets/626ddc35-a146-4bca-a3a3-b8221c501df3"
    );
    expect(closeModalMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/community");
  });

  test("deleteSheetMutation handles error properly", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    axiosInstance.delete.mockClear();
    axiosInstance.delete.mockImplementationOnce(() => Promise.reject(new Error("Delete failed")));
    
    const onError = (error) => {
      console.error("Error deleting sheet:", error);
    };
    
    try {
      await deleteSheet("626ddc35-a146-4bca-a3a3-b8221c501df3");
    } catch (error) {
      onError(error);
    }
    
    expect(axiosInstance.delete).toHaveBeenCalledWith(
      "/api/v1/sheets/626ddc35-a146-4bca-a3a3-b8221c501df3"
    );
    expect(consoleSpy).toHaveBeenCalledWith("Error deleting sheet:", expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  test("calls window.print when print icon is clicked", () => {
    const originalPrint = window.print;
    window.print = vi.fn();
    
    setup();
    
    const toolbarItems = screen.getByRole("main").querySelectorAll('.view-toolbar-item');
    const printIconContainer = toolbarItems[1]; 
    const printIcon = printIconContainer.querySelector('svg:first-child'); 
    
    fireEvent.click(printIcon);
    
    expect(window.print).toHaveBeenCalledTimes(1);
    
    window.print = originalPrint;
  });

  test("handles mutation loading state", () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockMutate,
      isLoading: true,
    }));

    setup();
    expect(screen.getByText("Test Sheet")).toBeInTheDocument();
  });

  test("renders main container with correct CSS classes", () => {
    setup();
    
    const mainContainer = screen.getByRole("main");
    expect(mainContainer).toHaveClass("sheet-detail-container");
  });

  test("renders correctly with minimal props", () => {
    const mockAddChapterLocal = vi.fn();
    setup({ addChapter: mockAddChapterLocal, currentChapter: undefined });
    
    const sourceButton = screen.getByRole("button", { name: /source title/i });
    expect(sourceButton).toBeInTheDocument();
    
    const mainContainer = screen.getByRole("main");
    expect(mainContainer).toHaveClass("sheet-detail-container");
  });

  test("renders multiple segments of different types", () => {
    const multiSegmentData = {
      ...mockSheetData,
      content: {
        segments: [
          {
            segment_id: "segment1",
            type: "source",
            content: "Source content",
            language: "bo",
            text_title: "Source Title",
          },
          {
            segment_id: "segment2",
            type: "content",
            content: "Text content",
          },
          {
            segment_id: "segment3",
            type: "image",
            content: "https://example.com/image.jpg",
          },
          {
            segment_id: "segment4",
            type: "video",
            content: "dQw4w9WgXcQ",
          },
        ],
      },
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: multiSegmentData,
      isLoading: false,
      error: null,
    }));

    setup();
    
    expect(screen.getByText("Source Title")).toBeInTheDocument();
    expect(screen.getByText("Text content")).toBeInTheDocument();
    expect(screen.getByAltText("Sheet content")).toBeInTheDocument();
    expect(screen.getByTestId("youtube-player")).toBeInTheDocument();
  });

  test("renders visibility button for sheet owner and handles click", () => {
    const mockUpdateMutation = vi.fn();
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKeyOrConfig, queryFn, options) => {
      if (Array.isArray(queryKeyOrConfig)) {
        if (queryKeyOrConfig[0] === 'shortUrl') {
          return { 
            data: { shortUrl: 'https://short.url/test' },
            isLoading: false 
          };
        }
      } 
      else if (queryKeyOrConfig && queryKeyOrConfig.queryKey) {
        if (queryKeyOrConfig.queryKey[0] === 'userInfo') {
          return { data: mockUserInfoData, isLoading: false, error: null };
        }
      }
      
      return { data: mockSheetDataWithUserInfo, isLoading: false, error: null };
    });
  
    vi.spyOn(reactQuery, "useMutation").mockImplementation(() => ({
      mutate: mockUpdateMutation,
      isLoading: false,
    }));
  
    setup();
  
    const visibilityButton = screen.getByText("Private");
    expect(visibilityButton).toBeInTheDocument();
    
    fireEvent.click(visibilityButton);
    expect(mockUpdateMutation).toHaveBeenCalledWith(true);
  });

  test("handles updateSheetVisibility error", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    let visibilityOnErrorCallback;
    
    vi.spyOn(reactQuery, "useMutation").mockImplementation((config) => {
      if (config.mutationFn && config.mutationFn.toString().includes('updateSheetVisibility')) {
        visibilityOnErrorCallback = config.onError;
      }
      return {
        mutate: vi.fn(),
        isLoading: false,
      };
    });
  
    setup();
  
    const testError = new Error("Visibility update failed");
    visibilityOnErrorCallback(testError);
  
    expect(consoleSpy).toHaveBeenCalledWith("Error updating visibility:", testError);
    consoleSpy.mockRestore();
  });

  test("invalidates queries on successful visibility update", () => {
    const mockQueryClient = { invalidateQueries: vi.fn() };
    let visibilityOnSuccessCallback;
    
    vi.spyOn(reactQuery, "useQueryClient").mockReturnValue(mockQueryClient);
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKeyOrConfig, queryFn, options) => {
      if (Array.isArray(queryKeyOrConfig)) {
        if (queryKeyOrConfig[0] === 'shortUrl') {
          return { 
            data: { shortUrl: 'https://short.url/test' },
            isLoading: false 
          };
        }
      } 
      else if (queryKeyOrConfig && queryKeyOrConfig.queryKey) {
        if (queryKeyOrConfig.queryKey[0] === 'userInfo') {
          return { data: mockUserInfoData, isLoading: false, error: null };
        }
      }
      
      return { data: mockSheetDataWithUserInfo, isLoading: false, error: null };
    });
  
    vi.spyOn(reactQuery, "useMutation").mockImplementation((config) => {
      if (config.mutationFn && config.mutationFn.toString().includes('updateSheetVisibility')) {
        visibilityOnSuccessCallback = config.onSuccess;
      }
      return {
        mutate: vi.fn(),
        isLoading: false,
      };
    });
  
    setup();
  
    visibilityOnSuccessCallback();
  
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ 
      queryKey: ['sheetData', expect.any(String)] 
    });
  });
});