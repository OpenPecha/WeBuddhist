import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import CompareTextView from "./CompareTextView.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { mockReactQuery, mockAxios, mockTolgee, mockUseAuth } from "../../../../../../test-utils/CommonMocks.js";
import { PanelProvider } from "../../../../../../context/PanelContext.jsx";

mockAxios();
mockUseAuth();
mockReactQuery();

let earlyReturnValue = null;

vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: (language) => `lang-${language}`,
  getEarlyReturn: ({ isLoading, error, t }) => earlyReturnValue
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

describe("CompareTextView Component Rendering Tests", () => {
  const queryClient = new QueryClient();
  
  const mockCollectionsData = {
    collections: [
      { id: "col1", title: "Collection 1", has_child: true },
      { id: "col2", title: "Collection 2", has_child: false }
    ]
  };
  
  const mockProps = {
    setIsCompareTextView: vi.fn(),
    addChapter: vi.fn(),
    currentChapter: { id: "chapter-1" }
  };

  const setup = (queryData = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <PanelProvider>
            <CompareTextView {...mockProps} />
          </PanelProvider>
        </TolgeeProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
    earlyReturnValue = null;
  });

  test("Should render initial state correctly with collections list", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    setup();
    
    expect(screen.getByText("connection_panel.compare_text")).toBeInTheDocument();
    
    expect(screen.getByText("Collection 1")).toBeInTheDocument();
    expect(screen.getByText("Collection 2")).toBeInTheDocument();
    
    const collectionButtons = screen.getAllByRole("button");
    expect(collectionButtons.some(button => button.textContent === "Collection 1")).toBe(true);
  });

  test("Should render loading state when collections data is loading", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null
    }));
    
    setup();
    
    expect(screen.queryByText("Collection 1")).not.toBeInTheDocument();
  });

  test("Should render error state when collections fetch fails", () => {
    earlyReturnValue = <div data-testid="error-message">Error: Failed to fetch collections</div>;

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: new Error("Failed to fetch collections")
    }));
    
    setup();
    
    expect(screen.queryByTestId("error-message")).toBeInTheDocument();
    expect(screen.queryByText("Collection 1")).not.toBeInTheDocument();
  });

  test("Should render the component with proper header and close icon", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "collections") {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    
    const { container } = setup();
    
    expect(screen.getByText("connection_panel.compare_text")).toBeInTheDocument();
    
    const closeIcon = container.querySelector(".close-icon");
    expect(closeIcon).toBeInTheDocument();
    
    fireEvent.click(closeIcon);
    expect(mockProps.setIsCompareTextView).toHaveBeenCalledWith("main");
  });
});