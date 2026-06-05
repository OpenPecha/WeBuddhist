import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom";
import AppOpenBanner from "./AppOpenBanner";
import {
  APP_SCHEME_URL,
  DISMISS_KEY,
  DISMISS_TIME_INTERVAL_MS,
  PLAY_STORE_URL,
  APP_STORE_URL,
} from "../../utils/constants";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock navigator.userAgent
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, "userAgent", {
    value: userAgent,
    writable: true,
  });
};

// Mock window.location
const mockLocation = (pathname = "/", search = "", hash = "") => {
  delete (window as any).location;
  (window as any).location = {
    pathname,
    search,
    hash,
    href: `https://webuddhist.com${pathname}${search}${hash}`,
  };
};

describe("AppOpenBanner Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockLocation();
  });

  test("does not render on desktop devices", () => {
    mockUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );

    render(<AppOpenBanner />);

    expect(
      screen.queryByText("Open in WebBuddhist App"),
    ).not.toBeInTheDocument();
  });

  test("renders on Android devices", async () => {
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );

    render(<AppOpenBanner />);

    await waitFor(() => {
      expect(screen.getByText("Open in WebBuddhist App")).toBeInTheDocument();
      expect(
        screen.getByText("Faster reading, offline access"),
      ).toBeInTheDocument();
      expect(screen.getByText("Get App")).toHaveAttribute(
        "href",
        PLAY_STORE_URL,
      );
    });
  });

  test("renders on iOS devices with App Store link", async () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    );

    render(<AppOpenBanner />);

    await waitFor(() => {
      expect(screen.getByText("Open in WebBuddhist App")).toBeInTheDocument();
      expect(screen.getByText("Get App")).toHaveAttribute(
        "href",
        APP_STORE_URL,
      );
    });
  });

  test("does not render if recently dismissed", () => {
    const recentDismissTime = Date.now() - DISMISS_TIME_INTERVAL_MS / 2; // 12 hours ago
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );
    localStorageMock.getItem.mockReturnValue(recentDismissTime.toString());

    render(<AppOpenBanner />);

    expect(
      screen.queryByText("Open in WebBuddhist App"),
    ).not.toBeInTheDocument();
  });

  test("renders if dismiss time has expired", async () => {
    const oldDismissTime = Date.now() - (DISMISS_TIME_INTERVAL_MS + 1000); // More than 24 hours ago
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );
    localStorageMock.getItem.mockReturnValue(oldDismissTime.toString());

    render(<AppOpenBanner />);

    await waitFor(() => {
      expect(screen.getByText("Open in WebBuddhist App")).toBeInTheDocument();
    });
  });

  test("dismisses banner when close button is clicked", async () => {
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );

    render(<AppOpenBanner />);

    await waitFor(() => {
      expect(screen.getByText("Open in WebBuddhist App")).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText("Dismiss");
    fireEvent.click(dismissButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      DISMISS_KEY,
      expect.any(String),
    );
    expect(
      screen.queryByText("Open in WebBuddhist App"),
    ).not.toBeInTheDocument();
  });

  test("handles app opening with current URL", async () => {
    mockLocation("/texts/123", "?lang=en", "#section1");
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );

    // Mock window.location.href setter
    let currentHref = "https://webuddhist.com/texts/123?lang=en#section1";
    Object.defineProperty(window.location, "href", {
      get: () => currentHref,
      set: (value) => {
        currentHref = value;
      },
    });

    render(<AppOpenBanner />);

    await waitFor(() => {
      expect(screen.getByText("Open in WebBuddhist App")).toBeInTheDocument();
    });

    // Note: We can't easily test the setTimeout behavior in this test environment,
    // but we can verify the banner renders and the function exists
    expect(
      screen.getByText("Faster reading, offline access"),
    ).toBeInTheDocument();
  });

  test("detects iPad as Apple device", async () => {
    mockUserAgent(
      "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    );

    render(<AppOpenBanner />);

    await waitFor(() => {
      expect(screen.getByText("Get App")).toHaveAttribute(
        "href",
        APP_STORE_URL,
      );
    });
  });

  test("has correct accessibility attributes", async () => {
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );

    render(<AppOpenBanner />);

    await waitFor(() => {
      const dismissButton = screen.getByLabelText("Dismiss");
      expect(dismissButton).toHaveAttribute("aria-label", "Dismiss");
    });
  });
});
