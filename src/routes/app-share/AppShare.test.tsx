import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import "@testing-library/jest-dom";
import { TolgeeProvider } from "@tolgee/react";
import AppShare from "./AppShare";
import { APP_STORE_URL, PLAY_STORE_URL } from "../../utils/constants";
import { mockTolgee } from "../../test-utils/CommonMocks";

const mockAssign = vi.fn();

const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, "userAgent", {
    value: userAgent,
    writable: true,
    configurable: true,
  });
};

const renderAppShare = () =>
  render(
    <TolgeeProvider tolgee={mockTolgee}>
      <AppShare />
    </TolgeeProvider>,
  );

describe("AppShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { assign: mockAssign },
      writable: true,
      configurable: true,
    });
  });

  test("redirects mobile users to the app open page", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    );

    renderAppShare();

    expect(mockAssign).toHaveBeenCalledWith("/open");
    expect(screen.getByText("Opening WeBuddhist…")).toBeInTheDocument();
  });

  test("shows download modal with QR on desktop", async () => {
    mockUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );

    renderAppShare();

    await waitFor(() => {
      expect(
        screen.getByText("Get the app for the full experience"),
      ).toBeInTheDocument();
      expect(
        screen.getByAltText("QR code to download WeBuddhist"),
      ).toHaveAttribute("src", "/img/QR-download.png");
      expect(screen.getByRole("link", { name: "App Store" })).toHaveAttribute(
        "href",
        APP_STORE_URL,
      );
      expect(screen.getByRole("link", { name: "Google Play" })).toHaveAttribute(
        "href",
        PLAY_STORE_URL,
      );
    });

    expect(mockAssign).not.toHaveBeenCalled();
  });
});
