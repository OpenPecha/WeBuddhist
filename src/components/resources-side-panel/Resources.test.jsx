import {vi} from "vitest";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {fireEvent, render, screen} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import {mockTolgee} from "../../test-utils/CommonMocks.js";
import Resources, {fetchSidePanelData} from "./Resources.jsx";
import axiosInstance from "../../config/axios-config.js";

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
  const mockSideTextData = {
    text_infos: {
      short_url: "https://test.com/share",
      translations: 2,
      sheets: 3,
      web_pages: 1,
      related_texts: [
        { title: "Related Text 1", count: 2 },
        { title: "Related Text 2", count: 1 }
      ]
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation((queryKey) => {
      if (queryKey[0] === "textDetail") {
        return { data: mockTextData, isLoading: false };
      } else if (queryKey[0] === "texts") {
        return { data: mockSideTextData, isLoading: false };
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
            <Resources showPanel={true} setShowPanel={() => vi.fn()} textId={"test123"} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };


  test("fetchTextsInfo makes correct API call", async () => {
    const textId = "test123";
    axiosInstance.get.mockResolvedValueOnce({ data: mockSideTextData });

    const result = await fetchSidePanelData(textId);

    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/texts/${textId}/infos`, {
      params: {
        language: "bo",
        text_id: textId
      }
    });
    expect(result).toEqual(mockSideTextData);
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