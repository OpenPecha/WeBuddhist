import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom";
import AppShare from "./AppShare";
import { APP_STORE_URL, PLAY_STORE_URL, siteName } from "../../utils/constants";

const mockReplace = vi.fn();

const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, "userAgent", {
    value: userAgent,
    writable: true,
    configurable: true,
  });
};

describe("AppShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );
    Object.defineProperty(window, "location", {
      value: { replace: mockReplace },
      writable: true,
      configurable: true,
    });
  });

  test("shows download links on desktop", async () => {
    render(<AppShare />);

    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: `Download ${siteName} on the App Store`,
        }),
      ).toHaveAttribute("href", APP_STORE_URL);
      expect(
        screen.getByRole("link", {
          name: `Download ${siteName} on Google Play`,
        }),
      ).toHaveAttribute("href", PLAY_STORE_URL);
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText("App Store")).toBeInTheDocument();
    expect(screen.getByText("Google Play")).toBeInTheDocument();
  });

  test("redirects iPhone users to the App Store", async () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    );

    render(<AppShare />);

    expect(
      screen.getByText("Redirecting to the app store…"),
    ).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith(APP_STORE_URL);
    expect(
      screen.queryByRole("link", {
        name: `Download ${siteName} on the App Store`,
      }),
    ).not.toBeInTheDocument();
  });

  test("redirects Android users to Google Play", async () => {
    mockUserAgent(
      "Mozilla/5.0 (Android 12; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    );

    render(<AppShare />);

    expect(
      screen.getByText("Redirecting to the app store…"),
    ).toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith(PLAY_STORE_URL);
  });

  test("redirects iPad users to the App Store", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    );

    render(<AppShare />);

    expect(mockReplace).toHaveBeenCalledWith(APP_STORE_URL);
  });
});
