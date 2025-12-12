import { fireEvent, render, screen } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
  type UseQueryResult,
} from "react-query";
import { vi, describe, beforeEach, test, expect, type Mock } from "vitest";
import SheetShare, { fetchShortUrl } from "./sheetShare.js";
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

vi.mock("@/components/ui/dropdown-menu.tsx", () => {
  const DropdownMenu = ({ children }: any) => <div>{children}</div>;
  const DropdownMenuTrigger = ({ children }: any) => <div>{children}</div>;
  const DropdownMenuContent = ({ children }: any) => <div>{children}</div>;
  const DropdownMenuItem = ({
    children,
    onClick,
    disabled,
  }: {
    children: any;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  );
  return {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  };
});

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("SheetShare Component", () => {
  const queryClient = new QueryClient();
  const mockShortUrlData = { shortUrl: "https://short.url/abc" };
  const mockUseParams = useParams as unknown as Mock;
  const mockUseQuery = vi.spyOn(reactQuery, "useQuery") as unknown as Mock;
  const axiosPostMock = axiosInstance.post as unknown as Mock;

  const buildQueryResult = (override: any = {}) =>
    ({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      status: "success",
      ...override,
    }) as unknown as UseQueryResult;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseParams.mockReturnValue({ sheetSlugAndId: "sheet-slug_123" });
    mockUseQuery.mockReturnValue(buildQueryResult({ data: mockShortUrlData }));
    axiosPostMock.mockResolvedValue({ data: mockShortUrlData });
    Element.prototype.hasPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  const setup = () =>
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <SheetShare />
        </QueryClientProvider>
      </Router>,
    );

  test("renders share button", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Change language" }),
    ).toBeInTheDocument();
  });

  test("opens dropdown on share button click and shows options", () => {
    setup();
    expect(screen.getByText(/share on facebook/i)).toBeInTheDocument();
    expect(screen.getByText(/share on x/i)).toBeInTheDocument();
    expect(screen.getByText(/copy link/i)).toBeInTheDocument();
  });

  test("copies link to clipboard", async () => {
    setup();
    const copyBtn = screen.getByText(/copy link/i);
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockShortUrlData.shortUrl,
    );
  });

  test("shows loading state when isLoading is true", () => {
    mockUseQuery.mockReturnValueOnce(buildQueryResult({ isLoading: true }));
    setup();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders Facebook and X share links with correct URLs", () => {
    setup();
    const facebookLink = screen.getByText(/share on facebook/i).closest("a");
    const xLink = screen.getByText(/share on x/i).closest("a");
    expect(facebookLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockShortUrlData.shortUrl)),
    );
    expect(xLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(mockShortUrlData.shortUrl)),
    );
  });

  test("fetchShortUrl calls axios with correct params", async () => {
    const url = "http://test.com";
    const textId = "123";
    axiosPostMock.mockResolvedValueOnce({ data: mockShortUrlData });
    const result = await fetchShortUrl(url, textId);
    expect(axiosPostMock).toHaveBeenCalledWith("/api/v1/share", {
      text_id: textId,
      language: "bo",
      url,
    });
    expect(result).toEqual(mockShortUrlData);
  });
});
