import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import * as reactQuery from "react-query";
import {TolgeeProvider} from "@tolgee/react";
import {fireEvent, render, screen} from "@testing-library/react";
import ShareView from "./ShareView.jsx";
import {vi} from "vitest";
import "@testing-library/jest-dom";
import {mockUseAuth, mockAxios, mockReactQuery, mockTolgee} from "../../../../../../test-utils/CommonMocks.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@tolgee/react", async () => ({
  useTranslate: () => ({
    t: (key) => key,
  }),
  TolgeeProvider: ({ children }) => children
}));

Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(),
  },
  configurable: true,
});

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  ...originalLocation,
  href: "https://example.com/original-url",
};

describe("ShareView Component", () => {
  const queryClient = new QueryClient();
  const mockShortUrlData = {
    shortUrl: "https://gg.com/share/123"
  };

  const mockProps = {
    setIsShareView: vi.fn()
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => {
      return {
        data: {
          shortUrl: "https://gg.com/share/123"
        },
        isLoading: false
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  
  afterAll(() => {
    // Restore original window.location
    window.location = originalLocation;
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <ShareView {...mockProps} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders ShareView component", () => {
    setup();
    expect(document.querySelector(".share-content")).toBeInTheDocument();
    expect(document.querySelector(".share-url-container")).toBeInTheDocument();
    expect(document.querySelector(".social-share-buttons")).toBeInTheDocument();
  });

  test("displays the correct share URL", () => {
    const { container } = setup();
    
    const shareUrl = container.querySelector(".share-url");
    expect(shareUrl).toBeInTheDocument();
    expect(shareUrl.textContent).toBe("https://gg.com/share/123");
  });

  test("handles close button click", () => {
    const { container } = setup();
    
    const closeButton = container.querySelector(".close-icon");
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockProps.setIsShareView).toHaveBeenCalledWith("main");
  });

  test("copies URL to clipboard when copy button is clicked", () => {
    const { container } = setup();
    
    const copyButton = container.querySelector(".copy-button");
    expect(copyButton).toBeInTheDocument();
    
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://gg.com/share/123");
  });

  test("shows checkmark icon after copying", () => {
    const { container, rerender } = setup();
    
    const copyButton = container.querySelector(".copy-button");
    // Before clicking, should show copy icon
    expect(copyButton.querySelector("svg")).toBeInTheDocument();
    
    fireEvent.click(copyButton);
    
    // After clicking, should show checkmark icon
    const checkmarkIcon = container.querySelector(".copy-button svg");
    expect(checkmarkIcon).toBeInTheDocument();
    
    // After 3 seconds, should revert back to copy icon
    vi.advanceTimersByTime(3000);
    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <ShareView {...mockProps} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    const updatedCopyButton = document.querySelector(".copy-button svg");
    expect(updatedCopyButton).toBeInTheDocument();
  });

  test("displays social share buttons", () => {
    const { container } = setup();
    
    const socialButtons = container.querySelectorAll(".social-button");
    expect(socialButtons.length).toBe(2);

    expect(socialButtons[0].textContent).toContain("common.share_on_fb");
    expect(socialButtons[1].textContent).toContain("common.share_on_x");
  });

  test("handles null or undefined sidePanelData gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    const { rerender } = render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <ShareView setIsShareView={mockProps.setIsShareView} sidePanelData={null} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );

    expect(document.querySelector(".share-content")).toBeInTheDocument();
    
    const shareUrl = document.querySelector(".share-url");
    expect(shareUrl.textContent).toBe("");
    
    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <ShareView setIsShareView={mockProps.setIsShareView} sidePanelData={{}} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    
    expect(document.querySelector(".share-content")).toBeInTheDocument();
    
    // Test with empty text_infos object
    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider 
            fallback={"Loading tolgee..."} 
            tolgee={mockTolgee}
          >
            <ShareView setIsShareView={mockProps.setIsShareView} sidePanelData={{ text_infos: {} }} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
    
    expect(document.querySelector(".share-content")).toBeInTheDocument();
    const emptyShareUrl = document.querySelector(".share-url");
    expect(emptyShareUrl.textContent).toBe("");
  });
});
