import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import LeftSidePanel from "./LeftSidePanel.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../../../../context/PanelContext.jsx", () => ({
  usePanelContext: () => ({
    isLeftPanelOpen: true,
    closeLeftPanel: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams("?text_id=123")],
  };
});

vi.mock("../../../../utils/Constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (lang) => lang,
  getLanguageClass: () => "language-class",
}));

describe("LeftSidePanel Component", () => {
  const queryClient = new QueryClient();

  const mockTocData = {
    text_detail: {
      language: "bo",
    },
    contents: [
      {
        sections: [
          {
            id: "section-1",
            title: "Section 1",
            sections: [
              {
                id: "section-1-1",
                title: "Section 1.1",
                sections: [],
              },
            ],
          },
          {
            id: "section-2",
            title: "Section 2",
            sections: [],
          },
        ],
      },
    ],
  };

  const mockUpdateChapter = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "toc") {
        return { data: mockTocData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo");
  });

  const setup = (props = {}) => {
    const defaultProps = {
      updateChapter: mockUpdateChapter,
      currentChapter: { id: "chapter-1" },
      activeSectionId: null,
      ...props,
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <LeftSidePanel {...defaultProps} />
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders TOC data and handles section expansion", async () => {
    setup();

    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();

    expect(screen.queryByText("Section 1.1")).not.toBeInTheDocument();

    const section1Header = screen
      .getByText("Section 1")
      .closest(".section-header");
    fireEvent.click(section1Header);

    await waitFor(() => {
      expect(screen.getByText("Section 1.1")).toBeInTheDocument();
    });
  });

  test("handles section click and calls updateChapter", async () => {
    setup();

    const section1Button = screen.getByText("Section 1");
    fireEvent.click(section1Button);

    expect(mockUpdateChapter).toHaveBeenCalledWith(
      { id: "chapter-1" },
      { contentIndex: 0, sectionId: "section-1" }
    );
  });

  test("automatically expands parent sections when activeSectionId is set", async () => {
    setup({ activeSectionId: "section-1-1" });

    await waitFor(() => {
      expect(screen.getByText("Section 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Section 1.1")).toBeInTheDocument();
    });
  });
});
