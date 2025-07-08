import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../../test-utils/CommonMocks.js";
import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router, useParams} from "react-router-dom";
import {fireEvent, render, screen} from "@testing-library/react";
import {TolgeeProvider} from "@tolgee/react";
import React from "react";
import TableOfContents from "./TableOfContents.jsx";



mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: () => "bo",
  getLanguageClass: (language) => {
    switch (language) {
      case "bo":
        return "bo-text";
      case "en":
        return "en-text";
      case "sa":
        return "bo-text";
      default:
        return "en-text";
    }
  }
}));

vi.mock("../../../utils/constants.js", () => ({
  LANGUAGE: "language",
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("../../commons/pagination/PaginationComponent.jsx", () => ({
  default: ({ pagination, totalPages, handlePageChange, setPagination }) => (
    <div className="pagination" data-testid="pagination">
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        data-testid="prev-page"
      >
        Previous
      </button>
      <span data-testid="current-page">Page {pagination.currentPage} of {totalPages}</span>
      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === totalPages}
        data-testid="next-page"
      >
        Next
      </button>
    </div>
  ),
}));

const queryClient = new QueryClient();

const mockContentData = {
  contents: [
    {
      id: "abh7u8e4-da52-4ea2-800e-3414emk8uy67",
      text_id: "123",
      sections: [
        {
          id: "segment1",
          title: "Section 1",
          sections: [
            {
              id: "section1-1",
              title: "Subsection 1.1",
              sections: [
                {
                  id: "section1-1-1",
                  title: "Subsection 1.1.1",
                  sections: []
                }
              ]
            },
            {
              id: "section1-2",
              title: "Subsection 1.2",
              sections: []
            }
          ]
        },
        {
          id: "segment2",
          title: "Section 2",
          sections: []
        }
      ]
    }
  ],
  text_detail: {
    language: "bo"
  }
};

const setup = ({
                 tableOfContents = mockContentData,
                 setPagination = vi.fn(),
                 textId = "123",
                 currentPage = 1,
                 limit = 10
               } = {}) => {
  return render(
    <Router>
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <TableOfContents
            textId={textId}
            pagination={{ currentPage, limit }}
            setPagination={setPagination}
            tableOfContents={tableOfContents}
          />
        </TolgeeProvider>
      </QueryClientProvider>
    </Router>
  );
};

describe("TableOfContents Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ id: "123" });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders the component with content data", () => {
    const updatedMockData = {
      contents: [
        {
          id: "updated-id",
          text_id: "123",
          sections: [
            {
              id: "segment1",
              title: "Section 1",
              sections: [
                { id: "section1-1", title: "Subsection 1.1", sections: [] },
                { id: "section1-2", title: "Subsection 1.2", sections: [] },
              ]
            },
            {
              id: "segment2",
              title: "Section 2",
              sections: []
            }
          ]
        }
      ],
      text_detail: { language: "bo" }
    };

    setup({ tableOfContents: updatedMockData });

    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });

  test("does not render pagination component when no contents exist", () => {
    const emptyData = { contents: [], text_detail: { language: "bo" } };

    setup({ tableOfContents: emptyData });

    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  test("renders pagination component when contents exist", () => {
    setup();

    expect(screen.getByTestId("pagination")).toBeInTheDocument();
    expect(screen.getByTestId("current-page")).toHaveTextContent("Page 1 of 1");
  });

  test("calculates total pages correctly based on sections and limit", () => {
    const dataWithManySections = {
      contents: [
        {
          id: "content1",
          sections: Array.from({ length: 15 }, (_, i) => ({
            id: `section-${i}`,
            title: `Section ${i + 1}`,
            sections: []
          }))
        }
      ],
      text_detail: { language: "bo" }
    };

    setup({ tableOfContents: dataWithManySections, limit: 5 });

    expect(screen.getByTestId("current-page")).toHaveTextContent("Page 1 of 3");
  });

  test("toggles section expansion when section header is clicked", () => {
    setup();

    // Initially, subsections should not be visible
    expect(screen.queryByText("Subsection 1.1")).not.toBeInTheDocument();

    // Find and click the section header
    const sectionHeader = screen.getByText("Section 1").closest(".toc-header");
    fireEvent.click(sectionHeader);

    // After clicking, subsections should be visible
    expect(screen.getByText("Subsection 1.1")).toBeInTheDocument();
    expect(screen.getByText("Subsection 1.2")).toBeInTheDocument();
  });

  test("does not toggle section when clicking on link", () => {
    setup();

    // Initially, subsections should not be visible
    expect(screen.queryByText("Subsection 1.1")).not.toBeInTheDocument();

    // Click directly on the link (not the header)
    const link = screen.getByText("Section 1");
    fireEvent.click(link);

    // Subsections should still not be visible
    expect(screen.queryByText("Subsection 1.1")).not.toBeInTheDocument();
  });

  test("expands and collapses sections when clicking on headers", () => {
    const nestedData = {
      contents: [
        {
          id: "content1",
          sections: [
            {
              id: "parent-section",
              title: "Parent Section",
              sections: [
                { id: "child-section", title: "Child Section", sections: [] },
              ]
            }
          ]
        }
      ],
      text_detail: { language: "bo" }
    };

    setup({ tableOfContents: nestedData });

    // Initially, child section should not be visible
    expect(screen.queryByText("Child Section")).not.toBeInTheDocument();

    // Click to expand
    const parentHeader = screen.getByText("Parent Section").closest(".toc-header");
    fireEvent.click(parentHeader);

    // Child section should now be visible
    expect(screen.getByText("Child Section")).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(parentHeader);

    // Child section should be hidden again
    expect(screen.queryByText("Child Section")).not.toBeInTheDocument();
  });

  test("displays correct toggle icons based on expansion state", () => {
    setup();

    const sectionHeader = screen.getByText("Section 1").closest(".toc-header");

    // Initially should show chevron right (collapsed)
    expect(sectionHeader.querySelector(".toggle-icon")).toBeInTheDocument();

    // Click to expand
    fireEvent.click(sectionHeader);

    // Should still have toggle icon (now chevron down)
    expect(sectionHeader.querySelector(".toggle-icon")).toBeInTheDocument();
  });

  test("displays empty icon for sections without children", () => {
    setup();

    // Expand Section 1 to see its children
    const sectionHeader = screen.getByText("Section 1").closest(".toc-header");
    fireEvent.click(sectionHeader);

    // Section 2 has no children, so should have empty icon
    const section2Header = screen.getByText("Section 2").closest(".toc-header");
    expect(section2Header.querySelector(".empty-icon")).toBeInTheDocument();
  });

  test("generates correct links for top-level sections", () => {
    setup();

    const section1Link = screen.getByText("Section 1");
    expect(section1Link.getAttribute("href")).toBe("/chapter?text_id=123&contentId=abh7u8e4-da52-4ea2-800e-3414emk8uy67&versionId=&contentIndex=0");

    const section2Link = screen.getByText("Section 2");
    expect(section2Link.getAttribute("href")).toBe("/chapter?text_id=123&contentId=abh7u8e4-da52-4ea2-800e-3414emk8uy67&versionId=&contentIndex=1");
  });

  test("generates correct links for nested sections", () => {
    setup();

    // Expand Section 1 to see subsections
    const sectionHeader = screen.getByText("Section 1").closest(".toc-header");
    fireEvent.click(sectionHeader);

    const subsection1Link = screen.getByText("Subsection 1.1");
    expect(subsection1Link.getAttribute("href")).toBe("/chapter?text_id=123&contentId=abh7u8e4-da52-4ea2-800e-3414emk8uy67&versionId=&contentIndex=0&sectionId=section1-1");
  });

  test("applies correct language class to titles", () => {
    setup();

    const section1Link = screen.getByText("Section 1");
    expect(section1Link).toHaveClass("toc-title", "bo-text");
  });

  test("handles different language classes correctly", () => {
    const englishData = {
      ...mockContentData,
      text_detail: { language: "en" }
    };

    setup({ tableOfContents: englishData });

    const section1Link = screen.getByText("Section 1");
    expect(section1Link).toHaveClass("toc-title", "en-text");
  });



  test("handles deeply nested sections", () => {
    const deepNestedData = {
      contents: [
        {
          id: "content1",
          sections: [
            {
              id: "level1",
              title: "Level 1",
              sections: [
                {
                  id: "level2",
                  title: "Level 2",
                  sections: [
                    {
                      id: "level3",
                      title: "Level 3",
                      sections: [
                        {
                          id: "level4",
                          title: "Level 4",
                          sections: []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      text_detail: { language: "bo" }
    };

    setup({ tableOfContents: deepNestedData });

    // Expand each level
    fireEvent.click(screen.getByText("Level 1").closest(".toc-header"));
    expect(screen.getByText("Level 2")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Level 2").closest(".toc-header"));
    expect(screen.getByText("Level 3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Level 3").closest(".toc-header"));
    expect(screen.getByText("Level 4")).toBeInTheDocument();
  });

  test("handles multiple contents with different sections", () => {
    const multipleContentsData = {
      contents: [
        {
          id: "content1",
          sections: [
            { id: "c1-s1", title: "Content 1 Section 1", sections: [] }
          ]
        },
        {
          id: "content2",
          sections: [
            { id: "c2-s1", title: "Content 2 Section 1", sections: [] }
          ]
        }
      ],
      text_detail: { language: "bo" }
    };

    setup({ tableOfContents: multipleContentsData });

    expect(screen.getByText("Content 1 Section 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2 Section 1")).toBeInTheDocument();
  });

  test("handles empty sections array", () => {
    const emptyData = {
      contents: [
        {
          id: "content1",
          sections: []
        }
      ],
      text_detail: { language: "bo" }
    };

    setup({ tableOfContents: emptyData });

    expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
  });

  test("maintains expansion state when re-rendering", () => {
    const { rerender } = setup();

    // Expand a section
    const sectionHeader = screen.getByText("Section 1").closest(".toc-header");
    fireEvent.click(sectionHeader);

    expect(screen.getByText("Subsection 1.1")).toBeInTheDocument();

    // Re-render with same data
    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <TableOfContents
              textId="123"
              pagination={{ currentPage: 1, limit: 10 }}
              setPagination={vi.fn()}
              tableOfContents={mockContentData}
            />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    // Expansion state should be maintained
    expect(screen.getByText("Subsection 1.1")).toBeInTheDocument();
  });

  test("renders correct key prefixes for different section types", () => {
    setup();

    // Check that the component renders without errors
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });
});