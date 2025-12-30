import {
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
  mockLocalStorage,
} from "../../test-utils/CommonMocks.ts";
import {
  vi,
  describe,
  beforeEach,
  test,
  expect,
  type Mock,
  type MockInstance,
} from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import * as reactQuery from "react-query";
import axiosInstance from "../../config/axios-config.ts";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TolgeeProvider } from "@tolgee/react";
import Texts, { fetchTableOfContents, fetchVersions } from "./Texts.tsx";

mockUseAuth();
mockReactQuery();

vi.mock("./versions/Versions.tsx", () => ({
  __esModule: true,
  default: () => <div data-testid="versions-component">Versions Component</div>,
}));

vi.mock("./commentaries/Commentaries.tsx", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="commentaries-component">Commentaries Component</div>
  ),
}));

vi.mock("../../utils/helperFunctions.tsx", () => ({
  mapLanguageCode: (code: string) => (code === "bo-IN" ? "bo" : code),
  getLanguageClass: () => "language-class",
  getEarlyReturn: () => "",
}));

vi.mock("../../utils/constants.ts", () => ({
  LANGUAGE: "LANGUAGE",
  siteName: "Webuddhist",
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: () => [new URLSearchParams("?type=works"), vi.fn()],
    useLocation: () => ({
      pathname: "/texts/123",
      state: {
        parentCollection: { id: "collection-123", title: "Test Collection" },
      },
    }),
  };
});

describe("Texts Component", () => {
  const tableOfContentsData = { contents: [{ id: "content-1" }] };
  const versionsData = { text: { title: "Sample Text", language: "bo-IN" } };
  const commentariesData = { items: [{ id: "commentary-1" }] };

  let localStorageMock: any;
  let axiosGetMock: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("bo-IN");
    (useParams as unknown as Mock).mockReturnValue({ id: "123" });
    (reactQuery.useQuery as Mock).mockImplementation((queryKey: any) => {
      const key = Array.isArray(queryKey) ? queryKey[0] : queryKey;
      if (key === "table-of-contents") {
        return {
          data: tableOfContentsData,
          isLoading: false,
          error: undefined,
        };
      }
      if (key === "versions") {
        return { data: versionsData, isLoading: false, error: undefined };
      }
      if (key === "commentaries") {
        return { data: commentariesData, isLoading: false, error: undefined };
      }
      return { data: undefined, isLoading: false, error: undefined };
    });
    axiosGetMock = vi
      .spyOn(axiosInstance, "get")
      .mockResolvedValue({ data: tableOfContentsData });
  });

  const setup = () => {
    const queryClient = new QueryClient();
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Texts />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  test("renders title with language class", () => {
    const { container } = setup();
    const title = container.querySelector("p.language-class");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Sample Text");
  });

  test("shows versions tab by default and switches to commentaries", async () => {
    const user = userEvent.setup();
    setup();

    const versionsTab = screen.getByRole("tab", { name: /version/i });
    expect(versionsTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("versions-component")).toBeInTheDocument();

    const commentariesTab = screen.getByRole("tab", { name: /commentary/i });
    await user.click(commentariesTab);
    expect(commentariesTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("commentaries-component")).toBeInTheDocument();
  });

  test("fetchTableOfContents maps language code", async () => {
    sessionStorage.setItem("textLanguage", "bo-IN");
    axiosGetMock.mockResolvedValueOnce({ data: tableOfContentsData });

    const result = await fetchTableOfContents("123", 0, 10);

    expect(axiosGetMock).toHaveBeenCalledWith("/api/v1/texts/123/contents", {
      params: { language: "bo", limit: 10, skip: 0 },
    });
    expect(result).toEqual(tableOfContentsData);
    sessionStorage.removeItem("textLanguage");
  });

  test("fetchVersions maps language code", async () => {
    sessionStorage.setItem("textLanguage", "bo-IN");
    axiosGetMock.mockResolvedValueOnce({ data: { versions: [] } });

    const result = await fetchVersions("123", 0, 10);

    expect(axiosGetMock).toHaveBeenCalledWith("/api/v1/texts/123/versions", {
      params: { language: "bo", limit: 10, skip: 0 },
    });
    expect(result).toEqual({ versions: [] });
    sessionStorage.removeItem("textLanguage");
  });
});
