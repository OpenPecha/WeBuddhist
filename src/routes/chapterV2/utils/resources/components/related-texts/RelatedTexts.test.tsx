import { vi, describe, test, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { PanelProvider } from "../../../../../../context/PanelContext";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import CommentaryView, { fetchCommentaryData } from "./RelatedTexts";
import "@testing-library/jest-dom";
import { mockTolgee } from "../../../../../../test-utils/CommonMocks";
import axiosInstance from "../../../../../../config/axios-config";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (language: string) =>
    language === "bo" ? "bo-text" : "en-text",
}));

vi.mock("../../../../../../config/axios-config", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockCloseResourcesPanel = vi.fn();
vi.mock("../../../../../../context/PanelContext", async () => {
  const actual = await vi.importActual(
    "../../../../../../context/PanelContext",
  );
  return {
    ...actual,
    usePanelContext: () => ({
      closeResourcesPanel: mockCloseResourcesPanel,
    }),
  };
});

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

  let mockSetIsRelatedTextView: ReturnType<typeof vi.fn>;
  let mockAddChapter: ReturnType<typeof vi.fn>;
  let mockHandleNavigate: ReturnType<typeof vi.fn>;
  let currentChapter: { textId: string; segmentId: string };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetIsRelatedTextView = vi.fn();
    mockAddChapter = vi.fn();
    mockHandleNavigate = vi.fn();
    currentChapter = {
      textId: "mock-text-1",
      segmentId: "mock-segment-id",
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(((
      queryKey: string[],
    ) => {
      if (queryKey[0] === "relatedTexts") {
        return { data: mockCommentariesData, isLoading: false };
      }
      return { data: null, isLoading: false };
    }) as any);
  });

  const setup = (props: Record<string, unknown> = {}) => {
    const defaultProps = {
      segmentId: "mock-segment-id",
      setIsCommentaryView: mockSetIsRelatedTextView,
      addChapter: mockAddChapter,
      currentChapter: currentChapter,
      handleNavigate: mockHandleNavigate,
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <PanelProvider>
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
    const { container } = setup();

    const buttons = container.querySelectorAll('button[type="button"]');
    const closeButton = buttons[buttons.length - 1];

    fireEvent.click(closeButton);
    expect(mockSetIsRelatedTextView).toHaveBeenCalledWith("main");
  });

  test("fetchCommentaryData makes correct API call", async () => {
    const segmentId = "mock-segment-id";
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockCommentariesData,
    });

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
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("API Error"),
    );

    try {
      await fetchCommentaryData(segmentId);
      expect(true).toBe(false);
    } catch (error: unknown) {
      expect(error).toBeDefined();
      expect((error as Error).message).toBe("API Error");
    }
  });

  test("renders correctly with empty commentaries", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: { commentaries: [] },
      isLoading: false,
    })) as any);

    setup();

    expect(screen.getByText("text.commentary")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  test("calls handleNavigate when back button is clicked", () => {
    const { container } = setup();

    const buttons = container.querySelectorAll('button[type="button"]');
    const backButton = buttons[0];

    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton);
    expect(mockHandleNavigate).toHaveBeenCalled();
  });

  test("calls addChapter and closeResourcesPanel when 'Open Text' button is clicked", () => {
    const dataWithSegments = {
      commentaries: [
        {
          text_id: "mock-text-1",
          title: "Title",
          language: "en",
          segments: [{ segment_id: "seg-1", content: "the-text" }],
        },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: dataWithSegments,
      isLoading: false,
    })) as any);

    setup();

    const openBtn = screen.getByText("text.translation.open_text");
    fireEvent.click(openBtn);

    expect(mockAddChapter).toHaveBeenCalledWith(
      { textId: "mock-text-1", segmentId: "seg-1" },
      currentChapter,
    );
    expect(mockCloseResourcesPanel).toHaveBeenCalled();
  });

  test("renders commentary titles with correct language class", () => {
    const { container } = setup();

    const boTextElements = container.querySelectorAll(".bo-text");
    const enTextElements = container.querySelectorAll(".en-text");

    expect(boTextElements.length).toBeGreaterThan(0);
    expect(enTextElements.length).toBeGreaterThan(0);
  });

  test("renders loading state when data is loading", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: undefined,
      isLoading: true,
    })) as any);

    setup();

    expect(screen.getByText("text.commentary")).toBeInTheDocument();
  });

  test("renders commentary with count when count property exists", () => {
    setup();

    expect(
      screen.getByText(/རྩོམ་པ་པོ་དང་པོ། དབུ་མའི་ལྟ་བའི་གསལ་བཤད།/),
    ).toBeInTheDocument();
  });

  test("does not render segments section when segments array is missing", () => {
    const dataWithoutSegments = {
      commentaries: [
        {
          text_id: "mock-text-1",
          title: "Commentary Without Segments",
          language: "en",
        },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: dataWithoutSegments,
      isLoading: false,
    })) as any);

    setup();

    expect(screen.getByText("Commentary Without Segments")).toBeInTheDocument();
    expect(
      screen.queryByText("text.translation.open_text"),
    ).not.toBeInTheDocument();
  });
});
