import { vi, describe, test, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import RootTextView, { fetchRootTextData } from "./RootText";
import "@testing-library/jest-dom";
import { mockTolgee } from "../../../../../../test-utils/CommonMocks";
import axiosInstance from "../../../../../../config/axios-config";
import { PanelProvider } from "../../../../../../context/PanelContext";
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
  getLanguageClass: (language: string) => {
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

  let mockSetIsRootTextView: ReturnType<typeof vi.fn>;
  let mockAddChapter: ReturnType<typeof vi.fn>;
  let currentChapter: { textId: string; segmentId: string };
  let mockHandleNavigate: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetIsRootTextView = vi.fn();
    mockAddChapter = vi.fn();
    mockHandleNavigate = vi.fn();
    currentChapter = {
      textId: "mock-root-text-1",
      segmentId: "mock-segment-id",
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(((
      queryKey: string[],
    ) => {
      if (queryKey[0] === "rootTexts") {
        return { data: mockRootTextData, isLoading: false };
      }
      return { data: null, isLoading: false };
    }) as any);

    document.querySelector = vi.fn().mockImplementation((selector: string) => {
      if (selector === ".root-texts-list") {
        return {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }
      return null;
    });
  });

  const setup = (props: Record<string, unknown> = {}) => {
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
      </Router>,
    );
  };

  test("renders root texts with correct title and count", () => {
    setup();
    expect(screen.getByText("text.root_text (2)")).toBeInTheDocument();
  });

  test("fetchRootTextData makes correct API call", async () => {
    const segmentId = "mock-segment-id";
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockRootTextData,
    });

    const result = await fetchRootTextData(segmentId);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/v1/segments/${segmentId}/root_text`,
    );
    expect(result).toEqual(mockRootTextData);
  });

  test("fetchRootTextData handles errors gracefully", async () => {
    const segmentId = "mock-segment-id";
    (axiosInstance.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("API Error"),
    );

    try {
      await fetchRootTextData(segmentId);
      expect(true).toBe(false);
    } catch (error: unknown) {
      expect(error).toBeDefined();
      expect((error as Error).message).toBe("API Error");
    }
  });

  test("renders correctly with empty root texts", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: mockEmptyRootTextData,
      isLoading: false,
    })) as any);

    setup();

    expect(screen.getByText("text.root_text")).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  test("applies correct language class to root text titles", () => {
    const { container } = setup();

    const boTextElements = container.querySelectorAll(".bo-text");
    const enTextElements = container.querySelectorAll(".en-text");

    expect(boTextElements.length).toBeGreaterThan(0);
    expect(enTextElements.length).toBeGreaterThan(0);

    expect(boTextElements[0]).toHaveTextContent("རྩ་བའི་གཞུང་དང་པོ།");

    expect(enTextElements[0]).toHaveTextContent(
      "Root Text on Buddhist Philosophy",
    );
  });

  test("calls setIsRootTextView when close icon is clicked", () => {
    const { container } = setup();

    const buttons = container.querySelectorAll('button[type="button"]');
    const closeButton = buttons[buttons.length - 1];

    fireEvent.click(closeButton);

    expect(mockSetIsRootTextView).toHaveBeenCalledWith("main");
  });

  test("sets up event listener for footnote clicks on mount", () => {
    const mockRootTextsList = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    document.querySelector = vi.fn().mockImplementation((selector: string) => {
      if (selector === ".root-texts-list") {
        return mockRootTextsList;
      }
      return null;
    });

    setup();
    expect(mockRootTextsList.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    const handleFootnoteClick =
      mockRootTextsList.addEventListener.mock.calls[0][1];

    const mockFootnoteMarker = {
      classList: {
        contains: vi.fn().mockReturnValue(true),
      },
      nextElementSibling: {
        classList: {
          contains: vi.fn().mockReturnValue(true),
          toggle: vi.fn(),
        },
      },
    };

    const mockEvent = {
      target: mockFootnoteMarker,
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    };
    const result = handleFootnoteClick(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(
      mockFootnoteMarker.nextElementSibling.classList.toggle,
    ).toHaveBeenCalledWith("active");
    expect(result).toBe(false);
  });

  test("calls addChapter and closeResourcesPanel when 'Open Text' button is clicked", () => {
    setup();

    const openTextButtons = screen.getAllByText("text.translation.open_text");
    expect(openTextButtons.length).toBeGreaterThan(0);

    fireEvent.click(openTextButtons[0]);

    expect(mockAddChapter).toHaveBeenCalledWith(
      {
        textId: "mock-root-text-1",
        segmentId: "mock-segment-id",
      },
      currentChapter,
    );

    expect(mockCloseResourcesPanel).toHaveBeenCalled();
  });

  test("calls handleNavigate when back button is clicked", () => {
    const { container } = setup();

    const buttons = container.querySelectorAll('button[type="button"]');
    const backButton = buttons[0];

    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(mockHandleNavigate).toHaveBeenCalled();
  });

  test("renders segment content with TextExpand component", () => {
    setup();

    expect(screen.getByText("རྩ་བའི་གཞུང་དང་པོ།")).toBeInTheDocument();
    expect(
      screen.getByText("Root Text on Buddhist Philosophy"),
    ).toBeInTheDocument();
  });

  test("renders loading state when data is loading", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: undefined,
      isLoading: true,
    })) as any);

    setup();

    expect(screen.getByText("text.root_text")).toBeInTheDocument();
  });

  test("renders root text with count when count property exists", () => {
    const mockDataWithCount = {
      segment_root_mapping: [
        {
          text_id: "mock-root-text-1",
          title: "Test Root Text",
          language: "en",
          count: 5,
          segments: [
            {
              segment_id: "mock-segment-id",
              content: "<p>Test content</p>",
            },
          ],
        },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: mockDataWithCount,
      isLoading: false,
    })) as any);

    setup();

    expect(screen.getByText(/Test Root Text.*\(5\)/)).toBeInTheDocument();
  });

  test("does not render segments section when segments array is missing", () => {
    const mockDataWithoutSegments = {
      segment_root_mapping: [
        {
          text_id: "mock-root-text-1",
          title: "Test Root Text Without Segments",
          language: "en",
        },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementationOnce((() => ({
      data: mockDataWithoutSegments,
      isLoading: false,
    })) as any);

    setup();

    expect(
      screen.getByText("Test Root Text Without Segments"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("text.translation.open_text"),
    ).not.toBeInTheDocument();
  });
});
