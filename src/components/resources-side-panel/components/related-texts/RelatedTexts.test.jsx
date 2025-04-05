import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import { mockTolgee } from "../../../../test-utils/CommonMocks.js";
import CommentaryView, { fetchCommentaryData } from "./RelatedTexts.jsx";
import axiosInstance from "../../../../config/axios-config.js";
import "@testing-library/jest-dom";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../../../utils/Constants.js", () => ({
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

describe("CommentaryView", () => {
  const queryClient = new QueryClient();
  const mockCommentariesData = {
    commentaries: [
      {
        text_id: "mock-RelatedText-1",
        title: "རྩོམ་པ་པོ་དང་པོ། དབུ་མའི་ལྟ་བའི་གསལ་བཤད།",
        language: "bo",
        content:
          "<p>སེམས་ཀྱི་ངོ་བོ་ནི་གསལ་བ་དང་རིག་པ་ཡིན། དེ་ནི་འོད་གསལ་བ་དང་རྣམ་པར་དག་པ་ཡིན།</p>",
        count: 2,
      },
      {
        text_id: "mock-RelatedText-2",
        title: "RelatedText on Buddhist Philosophy",
        language: "en",
        content:
          "<p>This is a sample RelatedText about Buddhist philosophy and its principles.</p><p>Second paragraph.</p>",
        count: 3,
      },
    ],
  };

  const mockEmptyCommentariesData = {
    commentaries: [],
  };

  let mockSetIsRelatedTextView;
  let mockSetExpandedCommentaries;

  beforeEach(() => {
    vi.resetAllMocks();
    mockSetIsRelatedTextView = vi.fn();
    mockSetExpandedCommentaries = vi.fn();

    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "relatedTexts") {
        return { data: mockCommentariesData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });
  });

  const setup = (props = {}) => {
    const defaultProps = {
      segmentId: "mock-segment-id",
      setIsCommentaryView: mockSetIsRelatedTextView,
      expandedCommentaries: { "mock-RelatedText-1": false, "mock-RelatedText-2": false },
      setExpandedCommentaries: mockSetExpandedCommentaries,
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <CommentaryView {...defaultProps} {...props} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
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
    expect(mockSetIsRelatedTextView).toHaveBeenCalledWith(false);
  });

  test("toggles commentary expansion when show more button is clicked", () => {
    setup();

    const showMoreButtons = document.querySelectorAll(".see-more-link");
    expect(showMoreButtons.length).toBe(2);
    fireEvent.click(showMoreButtons[0]);
    expect(mockSetExpandedCommentaries).toHaveBeenCalled();
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
      }
    );
    expect(result).toEqual(mockCommentariesData);
  });

  test("fetchCommentaryData handles errors gracefully", async () => {
    const segmentId = "mock-segment-id";
    axiosInstance.get.mockRejectedValueOnce(new Error("API Error"));

    const result = await fetchCommentaryData(segmentId);

    expect(result).toEqual({ commentaries: [] });
  });

  test("clicking on 'open text' button calls addChapter", () => {
    const mockAddChapter = vi.fn();
    setup({ addChapter: mockAddChapter });

    const openTextButtons = document.querySelectorAll(".commentary-button");
    // The first button is the 'open text' button
    fireEvent.click(openTextButtons[0]);

    expect(mockAddChapter).toHaveBeenCalledWith({
      contentId: "",
      versionId: "mock-RelatedText-1"
    });
  });

  test("renders correctly with empty commentaries", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce(() => ({
      data: { commentaries: [] },
      isLoading: false
    }));

    setup();
    
    // Should not display any count when there are no commentaries
    expect(screen.getByText("text.commentary")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });
});
