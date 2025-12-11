import React from "react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { PanelProvider } from "../../../../../../context/PanelContext.js";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import CommentaryView, { fetchCommentaryData } from "./RelatedTexts.js";
import "@testing-library/jest-dom";
import { mockTolgee } from "../../../../../../test-utils/CommonMocks.js";
import axiosInstance from "../../../../../../config/axios-config.js";

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
  getLanguageClass: (language) => (language === "bo" ? "bo-text" : "en-text"),
}));

describe("CommentaryView", () => {
  const queryClient = new QueryClient();
  const mockCommentariesData = {
    commentaries: [
      {
        text_id: "mock-RelatedText-1",
        segment_id: "mock-segment-id",
        title: "རྩོམ་པ་པོ་དང་པོ། དབུ་མའི་ལྟ་བའི་གསལ་བཤད།",
        language: "bo",
        content: [
          "<p>སེམས་ཀྱི་ངོ་བོ་ནི་གསལ་བ་དང་རིག་པ་ཡིན། དེ་ནི་འོད་གསལ་བ་དང་རྣམ་པར་དག་པ་ཡིན།</p>",
        ],
        count: 2,
      },
      {
        text_id: "mock-RelatedText-2",
        segment_id: "mock-segment-id",
        title: "RelatedText on Buddhist Philosophy",
        language: "en",
        content: [
          "<p>This is a sample RelatedText about Buddhist philosophy and its principles.</p>",
          "<p>Second paragraph.</p>",
        ],
        count: 3,
      },
    ],
  };

  const mockEmptyCommentariesData = {
    commentaries: [],
  };

  let mockSetIsRelatedTextView;

  beforeEach(() => {
    vi.resetAllMocks();
    mockSetIsRelatedTextView = vi.fn();

    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "relatedTexts") {
        return { data: mockCommentariesData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });

    // Mock the PanelContext
    vi.mock("../../../../../../context/PanelContext.jsx", () => ({
      usePanelContext: () => ({
        isResourcesPanelOpen: true,
        isTranslationSourceOpen: false,
        isLeftPanelOpen: false,
        openResourcesPanel: vi.fn(),
        closeResourcesPanel: vi.fn(),
        toggleResourcesPanel: vi.fn(),
        openTranslationSource: vi.fn(),
        closeTranslationSource: vi.fn(),
        toggleTranslationSource: vi.fn(),
        openLeftPanel: vi.fn(),
        closeLeftPanel: vi.fn(),
        toggleLeftPanel: vi.fn(),
      }),
      PanelProvider: ({ children, value }) => <div>{children}</div>,
    }));
  });

  const setup = (props = {}) => {
    const defaultProps = {
      segmentId: "mock-segment-id",
      setIsCommentaryView: mockSetIsRelatedTextView,
      addChapter: vi.fn(),
      sectionindex: 0,
    };

    const mockPanelContextValue = {
      isResourcesPanelOpen: true,
      isTranslationSourceOpen: false,
      isLeftPanelOpen: false,
      openResourcesPanel: vi.fn(),
      closeResourcesPanel: vi.fn(),
      toggleResourcesPanel: vi.fn(),
      openTranslationSource: vi.fn(),
      closeTranslationSource: vi.fn(),
      toggleTranslationSource: vi.fn(),
      openLeftPanel: vi.fn(),
      closeLeftPanel: vi.fn(),
      toggleLeftPanel: vi.fn(),
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <PanelProvider value={mockPanelContextValue}>
              <CommentaryView {...defaultProps} {...props} />
            </PanelProvider>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  test("renders related texts with correct title and count", () => {
    setup();
    expect(screen.getByText("text.commentary (2)")).toBeInTheDocument();
  });

  test("closes commentary view when close icon is clicked", () => {
    setup();
    const closeIcon = document.querySelector(".close-icon");
    fireEvent.click(closeIcon);
    expect(mockSetIsRelatedTextView).toHaveBeenCalledWith("main");
  });

  test("fetchCommentaryData makes correct API call", async () => {
    const segmentId = "mock-segment-id";
    axiosInstance.get.mockResolvedValueOnce({ data: mockCommentariesData });

    const result = await fetchCommentaryData(segmentId);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/v1/segments/${segmentId}/commentaries`,
      {
        params: {
          skip: 0,
          limit: 10,
        },
      },
    );
    expect(result).toEqual(mockCommentariesData);
  });

  test("fetchCommentaryData handles errors gracefully", async () => {
    const segmentId = "mock-segment-id";
    axiosInstance.get.mockRejectedValueOnce(new Error("API Error"));

    try {
      await fetchCommentaryData(segmentId);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe("API Error");
    }
  });

  test("renders correctly with empty commentaries", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce(() => ({
      data: { commentaries: [] },
      isLoading: false,
    }));

    setup();

    // Should not display any count when there are no commentaries
    expect(screen.getByText("text.commentary")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  test("calls handleNavigate when back icon is clicked", () => {
    const handleNavigate = vi.fn();
    setup({ handleNavigate });
    const backIcon = document.querySelector(".back-icon");
    expect(backIcon).toBeInTheDocument();
    fireEvent.click(backIcon);
    expect(handleNavigate).toHaveBeenCalled();
  });

  test("executes query and clicking open text triggers addChapter", async () => {
    const dataWithSegments = {
      commentaries: [
        {
          text_id: "mock--1",
          title: "Title",
          language: "en",
          segments: [{ segment_id: "seg-1", content: "the-text" }],
        },
      ],
    };

    axiosInstance.get.mockResolvedValueOnce({ data: dataWithSegments });
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((_, queryFn) => {
      queryFn();
      return { data: dataWithSegments, isLoading: false };
    });

    const addChapter = vi.fn();
    setup({ addChapter, currentChapter: { id: 1 }, handleNavigate: vi.fn() });

    const openBtn = screen.getByText("text.translation.open_text");
    fireEvent.click(openBtn);

    expect(addChapter).toHaveBeenCalledWith(
      { textId: "mock--1", segmentId: "seg-1" },
      { id: 1 },
    );
  });
});
