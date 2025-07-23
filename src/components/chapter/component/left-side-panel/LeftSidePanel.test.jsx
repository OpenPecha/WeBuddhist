import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import LeftSidePanel from "./LeftSidePanel.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as reactQuery from "@tanstack/react-query";
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
    useSearchParams: () => [new URLSearchParams("?text_id=123"), vi.fn()],
  };
});

vi.mock("../../../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (lang) => lang,
  getLanguageClass: (language) => language === "bo" ? "bo-text" : "en-text"
}));

vi.mock("../../../../utils/constants.js", () => ({
  LANGUAGE: "language"
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
      { contentIndex: 0, sectionId: "" }
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

  test("renders nested sections correctly", async () => {
    const complexMockData = {
      text_detail: {
        language: "bo",
      },
      contents: [
        {
          sections: [
            {
              id: "section-deep",
              title: "Deep Section",
              sections: [
                {
                  id: "section-deep-1",
                  title: "Deep Section 1",
                  sections: [
                    {
                      id: "section-deep-1-1",
                      title: "Deep Section 1.1",
                      sections: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => {
      return { data: complexMockData, isLoading: false };
    });

    setup();
    const deepSectionHeader = screen
      .getByText("Deep Section")
      .closest(".section-header");
    fireEvent.click(deepSectionHeader);

    await waitFor(() => {
      expect(screen.getByText("Deep Section 1")).toBeInTheDocument();
    });

    const deepSection1Header = screen
      .getByText("Deep Section 1")
      .closest(".section-header");
    fireEvent.click(deepSection1Header);

    await waitFor(() => {
      expect(screen.getByText("Deep Section 1.1")).toBeInTheDocument();
    });
  });

  test("handles loading state correctly", async () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => {
      return { data: null, isLoading: true };
    });

    setup();

    expect(screen.getByText("common.loading")).toBeInTheDocument();

    expect(screen.queryByText("Section 1")).not.toBeInTheDocument();
  });

  test("handles empty content and toggles sections with varied content types", async () => {
    const specialMockData = {
      text_detail: {
        language: "bo",
      },
      contents: [
        {
          sections: [
            {
              id: "section-empty",
              title: "Empty Section",
              sections: [],
            },
            {
              id: "section-null",
              title: "Null Section",
              sections: null,
            },
            {
              id: "section-with-children",
              title: "Section With Children",
              sections: [
                {
                  id: "child-section",
                  title: "Child Section",
                  sections: [],
                },
              ],
            },
          ],
        },
      ],
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => {
      return { data: specialMockData, isLoading: false };
    });

    setup({ activeSectionId: "child-section" });

    expect(screen.getByText("Empty Section")).toBeInTheDocument();
    expect(screen.getByText("Null Section")).toBeInTheDocument();
    expect(screen.getByText("Section With Children")).toBeInTheDocument();
    expect(screen.getByText("Child Section")).toBeInTheDocument();

    const emptySection = screen
      .getByText("Empty Section")
      .closest(".section-header");
    fireEvent.click(emptySection);

    const nullSection = screen
      .getByText("Null Section")
      .closest(".section-header");
    fireEvent.click(nullSection);

    const childSection = screen.getByText("Child Section");
    fireEvent.click(childSection);

    const sectionWithChildren = screen
      .getByText("Section With Children")
      .closest(".section-header");
    fireEvent.click(sectionWithChildren);

    await waitFor(() => {
      expect(screen.queryByText("Child Section")).not.toBeInTheDocument();
    });

    // Toggle again to expand
    fireEvent.click(sectionWithChildren);
    await waitFor(() => {
      expect(screen.getByText("Child Section")).toBeInTheDocument();
    });
  });
}); 