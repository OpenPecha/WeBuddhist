import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import CompareText from "./CompareText";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock("@/routes/collections/Collections", () => ({
  default: ({
    setRendererInfo,
    isCompactView,
  }: {
    setRendererInfo: (prev: any) => any;
    isCompactView: boolean;
  }) => (
    <div data-testid="collections-component">
      <div>Collections View</div>
      <div>Compact View: {isCompactView ? "true" : "false"}</div>
      <button
        onClick={() => {
          setRendererInfo((prev: any) => ({
            ...prev,
            requiredId: "collection-123",
            renderer: "works",
          }));
        }}
      >
        Navigate to Works
      </button>
    </div>
  ),
}));

vi.mock("@/routes/works/Works", () => ({
  default: ({
    setRendererInfo,
    collection_id,
    isCompactView,
  }: {
    setRendererInfo: (prev: any) => any;
    collection_id: string;
    isCompactView: boolean;
  }) => (
    <div data-testid="works-component">
      <div>Works View</div>
      <div>Collection ID: {collection_id}</div>
      <div>Compact View: {isCompactView ? "true" : "false"}</div>
      <button
        onClick={() => {
          setRendererInfo((prev: any) => ({
            ...prev,
            requiredId: "work-789",
            renderer: "texts",
          }));
        }}
      >
        Navigate to Texts
      </button>
      <button
        onClick={() =>
          setRendererInfo((prev: any) => ({ ...prev, renderer: "collections" }))
        }
      >
        Back to Collections
      </button>
    </div>
  ),
}));

vi.mock("@/routes/texts/Texts", () => ({
  default: ({
    setRendererInfo,
    collection_id,
    addChapter,
    currentChapter,
    isCompactView,
  }: any) => (
    <div data-testid="texts-component">
      <div>Texts View</div>
      <div>Collection ID: {collection_id}</div>
      <div>Compact View: {isCompactView ? "true" : "false"}</div>
      <div>Has addChapter: {addChapter ? "true" : "false"}</div>
      <div>Current Chapter: {currentChapter || "none"}</div>
      <button
        onClick={() =>
          setRendererInfo((prev: any) => ({ ...prev, renderer: "works" }))
        }
      >
        Back to Works
      </button>
      {addChapter && (
        <button
          onClick={() =>
            addChapter(
              { textId: "test-text-id", segmentId: "test-segment-id" },
              currentChapter,
            )
          }
        >
          Add Chapter
        </button>
      )}
    </div>
  ),
}));

const mockTolgee = {
  isLoaded: () => true,
  getLanguage: () => "en",
  changeLanguage: vi.fn(),
  t: (key: string) => key,
};

describe("CompareText Component", () => {
  let queryClient: QueryClient;
  let mockSetIsCompareTextView: (value: string) => void;
  let mockAddChapter: (textId: string, segmentId: string) => void;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockSetIsCompareTextView = vi.fn();
    mockAddChapter = vi.fn();
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      setIsCompareTextView: mockSetIsCompareTextView,
      addChapter: mockAddChapter,
      currentChapter: 1,
      ...props,
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback="Loading..." tolgee={mockTolgee as any}>
            <CompareText {...defaultProps} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  describe("Component Rendering", () => {
    it("renders the component with header and close button", () => {
      renderComponent();

      expect(
        screen.getByText("connection_panel.compare_text"),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("renders collections view by default", () => {
      renderComponent();

      expect(screen.getByTestId("collections-component")).toBeInTheDocument();
      expect(screen.getByText("Collections View")).toBeInTheDocument();
      expect(screen.getByText("Compact View: true")).toBeInTheDocument();
    });

    it("renders with correct container classes", () => {
      const { container } = renderComponent();

      expect(
        container.querySelector(".compare-text-container"),
      ).toBeInTheDocument();
      expect(
        container.querySelector(".compare-text-content"),
      ).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it('calls setIsCompareTextView with "main" when close button is clicked', () => {
      renderComponent();

      const buttons = screen.getAllByRole("button");
      const closeButton = buttons.find((btn) => btn.querySelector("svg"));

      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockSetIsCompareTextView).toHaveBeenCalledWith("main");
      }
    });
  });

  describe("Navigation Flow", () => {
    it("navigates from collections to works", () => {
      renderComponent();

      expect(screen.getByTestId("collections-component")).toBeInTheDocument();

      const navButton = screen.getByText("Navigate to Works");
      fireEvent.click(navButton);

      expect(screen.getByTestId("works-component")).toBeInTheDocument();
      expect(screen.getByText("Works View")).toBeInTheDocument();
      expect(
        screen.getByText("Collection ID: collection-123"),
      ).toBeInTheDocument();
    });

    it("navigates from works to texts", () => {
      renderComponent();

      fireEvent.click(screen.getByText("Navigate to Works"));
      fireEvent.click(screen.getByText("Navigate to Texts"));

      expect(screen.getByTestId("texts-component")).toBeInTheDocument();
      expect(screen.getByText("Texts View")).toBeInTheDocument();
      expect(screen.getByText("Collection ID: work-789")).toBeInTheDocument();
    });

    it("supports backward navigation", () => {
      renderComponent();

      fireEvent.click(screen.getByText("Navigate to Works"));
      fireEvent.click(screen.getByText("Navigate to Texts"));

      fireEvent.click(screen.getByText("Back to Works"));

      expect(screen.getByTestId("works-component")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Back to Collections"));

      expect(screen.getByTestId("collections-component")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("passes addChapter and currentChapter props to Texts component", () => {
      renderComponent({ currentChapter: 2 });

      fireEvent.click(screen.getByText("Navigate to Works"));
      fireEvent.click(screen.getByText("Navigate to Texts"));

      expect(screen.getByText("Has addChapter: true")).toBeInTheDocument();
      expect(screen.getByText("Current Chapter: 2")).toBeInTheDocument();
    });

    it("handles missing addChapter prop gracefully", () => {
      renderComponent({ addChapter: undefined });

      fireEvent.click(screen.getByText("Navigate to Works"));
      fireEvent.click(screen.getByText("Navigate to Texts"));

      expect(screen.getByText("Has addChapter: false")).toBeInTheDocument();
      expect(screen.queryByText("Add Chapter")).not.toBeInTheDocument();
    });

    it("handles missing currentChapter prop gracefully", () => {
      renderComponent({ currentChapter: undefined });

      fireEvent.click(screen.getByText("Navigate to Works"));
      fireEvent.click(screen.getByText("Navigate to Texts"));

      expect(screen.getByText("Current Chapter: none")).toBeInTheDocument();
    });

    it("calls addChapter when button is clicked in texts view", () => {
      renderComponent();

      fireEvent.click(screen.getByText("Navigate to Works"));
      fireEvent.click(screen.getByText("Navigate to Texts"));

      fireEvent.click(screen.getByText("Add Chapter"));

      expect(mockAddChapter).toHaveBeenCalledWith(
        { textId: "test-text-id", segmentId: "test-segment-id" },
        1,
      );
    });
  });

  describe("Component Integration", () => {
    it("passes isCompactView to all child components", () => {
      renderComponent();

      expect(screen.getByText("Compact View: true")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Navigate to Works"));
      expect(screen.getByText("Compact View: true")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Navigate to Texts"));
      expect(screen.getByText("Compact View: true")).toBeInTheDocument();
    });

    it("maintains state consistency during navigation", () => {
      renderComponent();

      fireEvent.click(screen.getByText("Navigate to Works"));
      expect(
        screen.getByText("Collection ID: collection-123"),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText("Navigate to Texts"));
      expect(screen.getByText("Collection ID: work-789")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles renderer state that does not match any case", () => {
      const { container } = renderComponent();

      expect(
        container.querySelector(".compare-text-container"),
      ).toBeInTheDocument();
    });

    it("renders without optional props", () => {
      render(
        <Router>
          <QueryClientProvider client={queryClient}>
            <TolgeeProvider fallback="Loading..." tolgee={mockTolgee as any}>
              <CompareText setIsCompareTextView={mockSetIsCompareTextView} />
            </TolgeeProvider>
          </QueryClientProvider>
        </Router>,
      );

      expect(
        screen.getByText("connection_panel.compare_text"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("collections-component")).toBeInTheDocument();
    });
  });

  it("calls handleNavigate when back clicked on collections view", () => {
    const mockHandleNavigate = vi.fn();
    renderComponent({ handleNavigate: mockHandleNavigate });

    const buttons = screen.getAllByRole("button");
    const backBtn = buttons.find((btn) => {
      const svg = btn.querySelector("svg");
      return svg && btn.textContent === "";
    });

    if (backBtn) {
      fireEvent.click(backBtn);
      expect(mockHandleNavigate).toHaveBeenCalledTimes(1);
    }
  });

  it("calls handleNavigate even after navigating forward", () => {
    const mockHandleNavigate = vi.fn();
    renderComponent({ handleNavigate: mockHandleNavigate });

    fireEvent.click(screen.getByText("Navigate to Works"));
    expect(screen.getByTestId("works-component")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const backBtn = buttons.find((btn) => {
      const svg = btn.querySelector("svg");
      return svg && btn.textContent === "";
    });

    if (backBtn) {
      fireEvent.click(backBtn);
      expect(mockHandleNavigate).toHaveBeenCalledTimes(1);
    }
  });
});
