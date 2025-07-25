import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {fireEvent, render, screen} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import Resources, {fetchSidePanelData} from "./Resources.jsx";
import {mockTolgee} from "../../../../test-utils/CommonMocks.js";
import axiosInstance from "../../../../config/axios-config.js";

vi.mock("../../../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
}));


const mockContext = {
  isResourcesPanelOpen: true,
  isTranslationSourceOpen: false,
  openResourcesPanel: vi.fn(),
  closeResourcesPanel: vi.fn(),
  toggleResourcesPanel: vi.fn(),
  openTranslationSource: vi.fn(),
  closeTranslationSource: vi.fn(),
  toggleTranslationSource: vi.fn()
};

vi.mock("../../../../context/PanelContext.jsx", () => ({
  usePanelContext: () => mockContext,
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

vi.mock("../../../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  MENU_ITEMS: [
    { label: "common.share", icon: vi.fn() },
    { label: "menu.item2", icon: vi.fn(), isHeader: true }
  ],
}));

vi.mock("./components/root-texts/RootText.jsx", () => ({
  default: ({ setIsRootTextView }) => (
    <div data-testid="root-text-view">
      Root Text View
      <button onClick={() => setIsRootTextView("main")}>Back</button>
    </div>
  )
}));

describe("Resources Side Panel", () => {
  const queryClient = new QueryClient();
  const mockTextData = {
    text: {
      title: "Test Title",
      id: "test123"
    }
  };
  const mockSidePanelData = {
    segment_info: {
      short_url: "https://test.com/share",
      translations: 2,
      resources: {
        sheets: 3
      },
      related_text: {
        commentaries: 2,
        root_text: 1
      }
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "textDetail") {
        return { data: mockTextData, isLoading: false };
      } else if (queryKey[0] === "sidePanel") {
        return { data: mockSidePanelData, isLoading: false };
      }
      return { data: null, isLoading: false };
    });
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("bo-IN");
    // mockSearchParams.delete('segment_id')
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
              <Resources segmentId={"test123"} addChapter={() => vi.fn()} setVersionId={() => vi.fn()}
                         versionId={"version1"}/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("fetchSidePanelData makes correct API call", async () => {
    const segmentId = "test123";
    axiosInstance.get.mockResolvedValueOnce({ data: mockSidePanelData });

    const result = await fetchSidePanelData(segmentId);

    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/segments/${segmentId}/info`,);
    expect(result).toEqual(mockSidePanelData);
  });



  test("shows translation view when clicking on translations option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { 
          data: {
            segment_info: {
              translations: 5
            }
          }
        };
      }
      return { data: null, isLoading: false };
    });
    
    const { container } = setup();
    
    const translationText = screen.getByText(/connection_pannel\.translations/);
    fireEvent.click(translationText);
    expect(screen.queryByText(/side_nav\.about_text/)).not.toBeInTheDocument();
  });

  test("shows commentary view when clicking on commentary option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { 
          data: {
            segment_info: {
              related_text: {
                commentaries: 2
              }
            }
          }
        };
      }
      return { data: null, isLoading: false };
    });
    
    const { container } = setup();
    const commentaryText = screen.getByText(/text\.commentary/);
    fireEvent.click(commentaryText);
    
    expect(screen.queryByText(/side_nav\.about_text/)).not.toBeInTheDocument();
  });

  test("shows share view when clicking on share menu item", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { data: mockSidePanelData };
      }
      return { data: null, isLoading: false };
    });
    
    const { container } = setup();
    const shareItems = screen.getAllByText(/common\.share/);
    fireEvent.click(shareItems[0]);
    
    expect(screen.queryByText(/side_nav\.about_text/)).not.toBeInTheDocument();
  });

  test("toggles visibility with showPanel prop", () => {
    const originalIsResourcesPanelOpen = mockContext.isResourcesPanelOpen;
    mockContext.isResourcesPanelOpen = false;
    
    const { container } = render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Resources 
              segmentId={"test123"} 
              setVersionId={() => vi.fn()}
              versionId={"version1"}
            />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    
    let panel = container.querySelector('.right-panel');
    expect(panel).not.toHaveClass('show');
    mockContext.isResourcesPanelOpen = originalIsResourcesPanelOpen;
  });

  test("shows root text view when clicking on root text option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return {
          data: {
            segment_info: {
              related_text: {
                root_text: 2,
              },
            },
          },
        };
      }
      return { data: null, isLoading: false };
    });

    setup();
    const rootTextElement = screen.getByText(/text\.root_text/);
    fireEvent.click(rootTextElement);

    expect(screen.getByTestId("root-text-view")).toBeInTheDocument();
  });

  test("renders menu items correctly including header items", () => {
    setup();

    const headerItem = screen.getByText("menu.item2");
    expect(headerItem.closest("button")).toHaveClass("textgreat");
  });

  test("renders the panel backdrop that closes the panel when clicked", () => {
    setup();

    const backdrop = document.querySelector(".panel-backdrop");
    expect(backdrop).toBeInTheDocument();

    fireEvent.click(backdrop);
    expect(mockContext.closeResourcesPanel).toHaveBeenCalled();
  });
})