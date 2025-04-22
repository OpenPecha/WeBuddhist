import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {fireEvent, render, screen} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import {mockTolgee} from "../../test-utils/CommonMocks.js";
import Resources, {fetchSidePanelData} from "./Resources.jsx";
import axiosInstance from "../../config/axios-config.js";
import ShareView from "./components/share-view/ShareView.jsx";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../utils/Constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  menuItems: [
    { label: "common.share", icon: vi.fn() },
    { label: "menu.item2", icon: vi.fn() }
  ],
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
    segment_infos: {
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
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <Resources showPanel={true} setShowPanel={() => vi.fn()} segmentId={"test123"} addChapter={() => vi.fn()} setVersionId={() => vi.fn()} versionId={"version1"}/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("fetchSidePanelData makes correct API call", async () => {
    const segmentId = "test123";
    axiosInstance.get.mockResolvedValueOnce({ data: mockSidePanelData });

    const result = await fetchSidePanelData(segmentId);

    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/segments/${segmentId}/infos`, {
      params: {
        language: "bo",
        segmentId
      }
    });
    expect(result).toEqual(mockSidePanelData);
  });

  test("closes panel when clicking close icon", () => {
    const mockSetShowPanel = vi.fn();
    
    const { container } = render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Resources 
              showPanel={true} 
              setShowPanel={mockSetShowPanel} 
              segmentId={"test123"} 
              setVersionId={() => vi.fn()}
              versionId={"version1"}
            />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    
    const closeIcon = container.querySelector(".close-icon");
    expect(closeIcon).not.toBeNull();
    
    fireEvent.click(closeIcon);
    expect(mockSetShowPanel).toHaveBeenCalledWith(false);
  });

  test("shows translation view when clicking on translations option", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "sidePanel") {
        return { 
          data: {
            segment_infos: {
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
            segment_infos: {
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
    const { rerender } = render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Resources 
              showPanel={false} 
              setShowPanel={vi.fn()} 
              segmentId={"test123"} 
              setVersionId={() => vi.fn()}
              versionId={"version1"}
            />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    let panel = document.querySelector('.right-panel');
    expect(panel).not.toHaveClass('show');
  });
  // test("renders share view and handles copy functionality", async () => {
  //   setup();
  //
  //   // Open side panel
  //   fireEvent.click(document.querySelector(".text-segment"));
  //
  //   // Find and click share menu item
  //   const menuItems = document.querySelectorAll(".panel-content p");
  //   const shareItem = Array.from(menuItems).find(item =>
  //     item.textContent.includes("common.share")
  //   );
  //   fireEvent.click(shareItem);
  //
  //   // Verify share view is shown
  //   expect(screen.getByText("text.share_link")).toBeInTheDocument();
  //
  //   // Test copy functionality
  //   const mockClipboard = {
  //     writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  //   };
  //   Object.assign(navigator, { clipboard: mockClipboard });
  //
  //   const copyButton = document.querySelector(".copy-button");
  //   fireEvent.click(copyButton);
  //
  //   expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://test.com/share");
  // });

})