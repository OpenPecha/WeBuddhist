import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import Sheets from "./Sheets";
import { mockTolgee } from "../../../test-utils/CommonMocks";
import { QueryClientProvider, QueryClient } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import * as reactQuery from "react-query";

vi.mock("../../commons/pagination/PaginationComponent", () => ({
  default: ({ pagination, totalPages }) => (
    <div data-testid="pagination-component">
      Page {pagination.currentPage} of {totalPages}
    </div>
  ),
}));

vi.mock("../../../utils/highlightUtils.jsx", () => ({
  highlightSearchMatch: (text, searchText, className) => text,
}));
vi.mock("react-icons/ci", () => ({
  CiBookmark: () => <div data-testid="bookmark-icon">Bookmark</div>,
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key, defaultValue) => defaultValue || key,
    }),
  };
});

describe("Sheets Component", () => {
  const queryClient = new QueryClient();
  
  const mockSheetData = {
    search: {
      text: "word that is being searched"
    },
    sheets: [
      {
        sheet_title: "བཟོད་པའི་མཐུ་སྟོབས།",
        sheet_summary: "བཟོད་པའི་ཕན་ཡོན་དང་ཁོང་ཁྲོའི་ཉེས་དམིགས་ཀྱི་གཏམ་རྒྱུད་འདི། ད་ལྟའང་བོད་ཀྱི་གྲོང་གསེབ་དེར་གླེང་སྒྲོས་སུ་གྱུར་ཡོད་དོ།། །།",
        publisher_id: 48,
        sheet_id: 114,
        publisher_name: "Yeshi Lhundup",
        publisher_url: "/profile/yeshi-lhundup",
        publisher_image: "https://storage.googleapis.com/pecha-profile-img/yeshi-lhundup-1742619970-small.png",
        publisher_position: "LCM",
        publisher_organization: "pecha.org"
      },
      {
        sheet_title: "Teaching 1st Jan 2025",
        sheet_summary: "sadf asdfas dfas",
        publisher_id: 61,
        sheet_id: 170,
        publisher_name: "Yeshi Lhundup",
        publisher_url: "/profile/yeshi-lhundup2",
        publisher_image: "",
        publisher_position: "",
        publisher_organization: ""
      }
    ],
    skip: 0,
    limit: 10,
    total: 2
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders sheets when data is loaded successfully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSheetData,
      isLoading: false,
      error: null
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("བཟོད་པའི་མཐུ་སྟོབས།")).toBeInTheDocument();
    expect(screen.getByText("Teaching 1st Jan 2025")).toBeInTheDocument();
    expect(screen.getByText("བཟོད་པའི་ཕན་ཡོན་དང་ཁོང་ཁྲོའི་ཉེས་དམིགས་ཀྱི་གཏམ་རྒྱུད་འདི། ད་ལྟའང་བོད་ཀྱི་གྲོང་གསེབ་དེར་གླེང་སྒྲོས་སུ་གྱུར་ཡོད་དོ།། །།")).toBeInTheDocument();
    expect(screen.getByText("sadf asdfas dfas")).toBeInTheDocument();
    
    expect(screen.getAllByText("Yeshi Lhundup")).toHaveLength(2);
    expect(screen.getByText("pecha.org")).toBeInTheDocument();
    
    expect(document.querySelector('.results-count')).toHaveTextContent(/sheet\.search\.total.*2/);

    expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  test("displays publisher initials when image is not available", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSheetData,
      isLoading: false,
      error: null
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("YL")).toBeInTheDocument();
  });

  test("handles pagination correctly", () => {
    const sheetsData = {
      ...mockSheetData,
      sheets: Array(30).fill(mockSheetData.sheets[0])
    };
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sheetsData,
      isLoading: false,
      error: null
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    // Check if pagination appears for 30 items (default: 10 per page)
    const paginationComponent = screen.getByTestId("pagination-component");
    expect(paginationComponent).toBeInTheDocument();
  });

  test("displays bookmark icon for each sheet", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSheetData,
      isLoading: false,
      error: null
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    const bookmarkIcons = screen.getAllByTestId("bookmark-icon");
    expect(bookmarkIcons).toHaveLength(2);
  });

  test("handles 404 error correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: { response: { status: 404 } }
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("No results to display.")).toBeInTheDocument();
  });

  test("handles empty sheets array correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: { sheets: [] },
      isLoading: false,
      error: null
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText("No results to display.")).toBeInTheDocument();
  });

  test("handles general error correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: { message: "Network error" }
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <Sheets query="test" />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Error loading content/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });
});
