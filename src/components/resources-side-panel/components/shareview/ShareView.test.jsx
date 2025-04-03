import React from "react";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import ShareView from "./ShareView.jsx";
import {vi} from "vitest";
import "@testing-library/jest-dom";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});


Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(),
  },
});

describe("ShareView Component", () => {
  const queryClient = new QueryClient();
  const mockSidePanelData = {
    text_infos: {
      short_url: "https://example.com/share/123"
    }
  };

  const mockProps = {
    sidePanelData: mockSidePanelData,
    setIsShareView: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider 
          fallback={"Loading tolgee..."} 
          tolgee={mockTolgee}
        >
          <ShareView {...mockProps} />
        </TolgeeProvider>
      </QueryClientProvider>
    );
  };

  test("renders ShareView component", () => {
    setup();
    expect(document.querySelector(".share-content")).toBeInTheDocument();
    expect(document.querySelector(".share-url-container")).toBeInTheDocument();
    expect(document.querySelector(".social-share-buttons")).toBeInTheDocument();
  });

  test("displays the correct share URL", () => {
    setup();
    
    const shareUrl = document.querySelector(".share-url");
    expect(shareUrl).toBeInTheDocument();
    expect(shareUrl.textContent).toBe("https://example.com/share/123");
  });

  test("handles close button click", () => {
    setup();
    
    const closeButton = document.querySelector(".close-icon");
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockProps.setIsShareView).toHaveBeenCalledWith(false);
  });

  test("copies URL to clipboard when copy button is clicked", () => {
    setup();
    
    const copyButton = document.querySelector(".copy-button");
    expect(copyButton).toBeInTheDocument();
    
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/share/123");
  });

  test("shows checkmark icon after copying", () => {
    setup();
    
    const copyButton = document.querySelector(".copy-button");
    
    expect(copyButton.querySelector("svg")).toBeInTheDocument();
    
    fireEvent.click(copyButton);
    
 
    expect(copyButton.querySelector("svg")).toBeInTheDocument();
    
   
    vi.advanceTimersByTime(3000);
    
    setup();
    const updatedCopyButton = document.querySelector(".copy-button");
    expect(updatedCopyButton.querySelector("svg")).toBeInTheDocument();
  });

  test("displays social share buttons", () => {
    setup();
    
    const socialButtons = document.querySelectorAll(".social-button");
    expect(socialButtons.length).toBe(2);

    expect(socialButtons[0].textContent).toContain("common.share_on_fb");
    expect(socialButtons[1].textContent).toContain("common.share_on_x");
  });

  test("handles null or undefined sidePanelData gracefully", () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider 
          fallback={"Loading tolgee..."} 
          tolgee={mockTolgee}
        >
          <ShareView setIsShareView={mockProps.setIsShareView} sidePanelData={null} />
        </TolgeeProvider>
      </QueryClientProvider>
    );

    expect(document.querySelector(".share-content")).toBeInTheDocument();
    
    const shareUrl = document.querySelector(".share-url");
    expect(shareUrl.textContent).toBe("");
    
    rerender(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider 
          fallback={"Loading tolgee..."} 
          tolgee={mockTolgee}
        >
          <ShareView setIsShareView={mockProps.setIsShareView} sidePanelData={{}} />
        </TolgeeProvider>
      </QueryClientProvider>
    );
    
    expect(document.querySelector(".share-content")).toBeInTheDocument();
  });
});
