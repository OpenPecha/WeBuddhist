import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { LANGUAGE } from "../../utils/constants.ts";

const getLanguageMock = vi.fn();

vi.mock("@tolgee/react", () => ({
  useTolgee: () => ({
    getLanguage: getLanguageMock,
  }),
}));

import Planviewer from "./Planviewer.tsx";

describe("Planviewer", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  test("renders iframe with plan viewer URL and english lang from tolgee", () => {
    getLanguageMock.mockReturnValue("en");
    localStorageMock.getItem.mockReturnValue(null);

    render(<Planviewer />);

    const iframe = screen.getByTitle("WeBuddhist plan viewer");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://plans.webuddhist.com/?lang=en",
    );
    expect(iframe).toHaveClass("block", "h-dvh", "w-full", "border-0");
  });

  test("maps tolgee language codes for plan viewer lang param", () => {
    getLanguageMock.mockReturnValue("bo-IN");

    render(<Planviewer />);

    expect(screen.getByTitle("WeBuddhist plan viewer")).toHaveAttribute(
      "src",
      "https://plans.webuddhist.com/?lang=bo",
    );
  });

  test("uses localStorage language when tolgee has no language", () => {
    getLanguageMock.mockReturnValue(undefined);
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === LANGUAGE ? "zh-Hans-CN" : null,
    );

    render(<Planviewer />);

    expect(screen.getByTitle("WeBuddhist plan viewer")).toHaveAttribute(
      "src",
      "https://plans.webuddhist.com/?lang=zh",
    );
  });

  test("defaults to en when no language is stored", () => {
    getLanguageMock.mockReturnValue(null);
    localStorageMock.getItem.mockReturnValue(null);

    render(<Planviewer />);

    expect(screen.getByTitle("WeBuddhist plan viewer")).toHaveAttribute(
      "src",
      "https://plans.webuddhist.com/?lang=en",
    );
  });
});
