import React from "react";
import { mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Sheets from "./Sheets.jsx";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("./local-components/UserProfileCard/ProfileCard", () => ({
  __esModule: true,
  default: () => <div data-testid="profile-card">ProfileCard</div>,
}));

vi.mock("./local-components/Editors/EditorWrapper", () => {
  const Editor = ({ children, title, initialValue }) => (
    <div data-testid="editor" data-title={title} data-initialvalue={JSON.stringify(initialValue)}>
      {children}
    </div>
  );
  Editor.Input = () => <div data-testid="editor-input">EditorInput</div>;
  Editor.Toolbar = () => <div data-testid="editor-toolbar">EditorToolbar</div>;
  return { __esModule: true, default: Editor };
});

vi.mock('use-debounce', () => ({
  useDebounce: vi.fn((value) => [value]),
}));

vi.mock('./Sheets.scss', () => ({}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'new' })),
    useNavigate: vi.fn(() => vi.fn()),
    BrowserRouter: ({ children }) => <div>{children}</div>,
  };
});

vi.mock('./view-sheet/SheetDetailPage', () => ({
  fetchSheetData: vi.fn(() => Promise.resolve({
    sheet_title: 'Fetched Title',
    content: { segments: [{ type: 'paragraph', children: [{ text: 'Fetched content' }], align: 'left' }] },
  })),
}));

vi.mock('./sheet-utils/Constant', () => ({
  convertSegmentsToSlate: vi.fn((segments) => segments || [
    { type: 'paragraph', children: [{ text: '' }], align: 'left' }
  ]),
}));

const defaultValue = [
  { type: 'paragraph', children: [{ text: '' }], align: 'left' }
];

const mockUseQuery = vi.fn((opts) => {
  if (opts && opts.enabled === false) return { data: undefined };
  if (opts && opts.queryKey && opts.queryKey[1] === 'new') return { data: undefined };
  return {
    data: {
      sheet_title: 'Fetched Title',
      content: { segments: [
        { type: 'paragraph', children: [{ text: 'Fetched content' }], align: 'left' }
      ] },
    },
  };
});

vi.mock('react-query', async () => {
  const actual = await vi.importActual('react-query');
  return {
    ...actual,
    useQuery: (...args) => mockUseQuery(...args),
    QueryClient: actual.QueryClient,
    QueryClientProvider: actual.QueryClientProvider,
  };
});

mockUseAuth();

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <QueryClientProvider client={new QueryClient()}>
      <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
        {children}
      </TolgeeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

describe("Sheets Component", () => {
  const setup = () =>
    render(
      <TestWrapper>
        <Sheets />
      </TestWrapper>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  test("renders Sheets component structure", () => {
    setup();

    expect(document.querySelector(".sheets-wrapper")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("sheet.title.placeholder")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card")).toBeInTheDocument();
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("title input accepts text", () => {
    setup();
    
    const input = screen.getByPlaceholderText("sheet.title.placeholder");
    fireEvent.change(input, { target: { value: "My Sheet Title" } });
    
    expect(input.value).toBe("My Sheet Title");
    expect(sessionStorage.getItem("sheet-title")).toBe("My Sheet Title");
  });

  test("title input has correct styling and placeholder", () => {
    setup();
    
    const input = screen.getByPlaceholderText("sheet.title.placeholder");
    
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveClass("title-input");
    expect(input).toHaveStyle({ fontFamily: "serif" });
  });

  test("passes debounced title to Editor component", async () => {
    const { useDebounce } = await import('use-debounce');
    useDebounce.mockReturnValue(['Debounced Title']);

    setup();
    
    const editor = screen.getByTestId("editor");
    expect(editor).toHaveAttribute("data-title", "Debounced Title");
  });

  test("passes default initialValue to Editor", () => {
    setup();
    const editor = screen.getByTestId("editor");
    expect(editor.getAttribute("data-initialvalue")).toContain('paragraph');
  });

  test("title state updates correctly", () => {
    setup();
    
    const input = screen.getByPlaceholderText("sheet.title.placeholder");
    
    fireEvent.change(input, { target: { value: "First Title" } });
    expect(input.value).toBe("First Title");
    expect(sessionStorage.getItem("sheet-title")).toBe("First Title");
    
    fireEvent.change(input, { target: { value: "Updated Title" } });
    expect(input.value).toBe("Updated Title");
    expect(sessionStorage.getItem("sheet-title")).toBe("Updated Title");
  });

  test("renders all child components of Editor", () => {
    setup();
    
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("component structure is correct", () => {
    setup();
    
    const wrapper = document.querySelector(".sheets-wrapper");
    expect(wrapper).toBeInTheDocument();
    
    const titleInput = screen.getByPlaceholderText("sheet.title.placeholder");
    const profileCard = screen.getByTestId("profile-card");
    const editor = screen.getByTestId("editor");
    
    expect(wrapper).toContainElement(titleInput);
    expect(wrapper).toContainElement(profileCard);
    expect(wrapper).toContainElement(editor);
  });

  test("empty title input initially", () => {
    sessionStorage.removeItem("sheet-title");
    setup();
    
    const input = screen.getByPlaceholderText("sheet.title.placeholder");
    expect(input.value).toBe("");
  });
});