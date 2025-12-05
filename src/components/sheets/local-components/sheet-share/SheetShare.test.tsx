import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";
import SheetShare, { fetchShortUrl } from "./sheetShare.jsx";
import * as reactQuery from "react-query";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import axiosInstance from "../../../../config/axios-config.js";
import "@testing-library/jest-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("../../../../config/axios-config.js", () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
  },
}));

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("SheetShare Component", () => {
  const queryClient = new QueryClient();
  const mockShortUrlData = { shortUrl: "https://short.url/abc" };

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ sheetSlugAndId: "sheet-slug_123" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation((...args) => {
      if (args[0][3]) {
        return {
          data: mockShortUrlData,
          isLoading: false,
        };
      }
      return {
        data: undefined,
        isLoading: false,
      };
    });
    axiosInstance.post.mockResolvedValue({ data: mockShortUrlData });
  });

  const setup = () =>
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <SheetShare />
        </QueryClientProvider>
      </Router>
    );

  test("renders share button", () => {
    setup();
    expect(document.querySelector(".share-button")).toBeInTheDocument();
  });

  test("opens dropdown on share button click", () => {
    setup();
    fireEvent.click(document.querySelector(".share-button"));
    expect(document.querySelector(".share-dropdown")).toBeInTheDocument();
  });

  test("copies link to clipboard and shows copied state", async () => {
    setup();
    fireEvent.click(document.querySelector(".share-button"));
    const copyBtn = screen.getByText(/copy link/i).closest("button");
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockShortUrlData.shortUrl);
    await waitFor(() => {
      expect(screen.getByText(/copy link/i)).toBeInTheDocument();
    });
  });

  test("shows loading state when isLoading is true", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: undefined,
      isLoading: true,
    }));
    setup();
    fireEvent.click(document.querySelector(".share-button"));
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders Facebook and X share links with correct URLs", () => {
    setup();
    fireEvent.click(document.querySelector(".share-button"));
    const facebookLink = screen.getByText(/share on facebook/i).closest("a");
    const xLink = screen.getByText(/share on x/i).closest("a");
    expect(facebookLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockShortUrlData.shortUrl))
    );
    expect(xLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockShortUrlData.shortUrl))
    );
  });

  test("closes dropdown when clicking outside", () => {
    setup();
    fireEvent.click(document.querySelector(".share-button"));
    expect(document.querySelector(".share-dropdown")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(document.querySelector(".share-dropdown")).not.toBeInTheDocument();
  });

  test("fetchShortUrl calls axios with correct params", async () => {
    const url = "http://test.com";
    const textId = "123";
    axiosInstance.post.mockResolvedValueOnce({ data: mockShortUrlData });
    const result = await fetchShortUrl(url, textId);
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/v1/share", {
      text_id: textId,
      language: "bo",
      url,
    });
    expect(result).toEqual(mockShortUrlData);
  });
});