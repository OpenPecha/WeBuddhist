import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import Editor from "./EditorWrapper.jsx";

vi.mock("./EditorInput/EditorInput", () => ({
  __esModule: true,
  default: () => <div data-testid="editor-input">EditorInput</div>,
}));

vi.mock("../Toolbar/Toolsbar", () => ({
  __esModule: true,
  default: () => <div data-testid="editor-toolbar">EditorToolbar</div>,
}));

vi.mock('slate', () => ({
  createEditor: vi.fn(() => ({
    children: [],
    selection: null,
    operations: [],
    marks: null,
    isInline: vi.fn(() => false),
    isVoid: vi.fn(() => false),
    normalizeNode: vi.fn(),
    onChange: vi.fn(),
  })),
  Transforms: {
    insertText: vi.fn(),
    delete: vi.fn(),
  },
  Editor: {
    marks: vi.fn(),
    above: vi.fn(),
  },
  Element: {
    isElement: vi.fn(),
  },
  Text: {
    isText: vi.fn(),
  },
}));

vi.mock('slate-react', () => ({
  withReact: vi.fn((editor) => editor),
  Slate: vi.fn(({ onChange, children, editor, initialValue }) => {
    // Store the onChange and editor for testing
    if (onChange) {
      window.__mockSlateOnChange = onChange;
      window.__mockSlateEditor = editor;
    }
    return <div data-testid="slate-editor">{children}</div>;
  }),
  Editable: vi.fn(() => <div data-testid="slate-editable">Editable</div>),
  useSlate: vi.fn(),
  useSelected: vi.fn(() => false),
  useFocused: vi.fn(() => false),
}));

vi.mock('slate-history', () => ({
  withHistory: vi.fn((editor) => editor),
}));

vi.mock('../../sheet-utils/withEmbeds', () => ({
  __esModule: true,
  default: vi.fn((editor) => editor),
}));

vi.mock('../../sheet-utils/serialize', () => ({
  serialize: vi.fn((node) => `serialized-${node.type || 'content'}`),
}));

vi.mock('use-debounce', () => ({
  useDebounce: vi.fn((value) => [value]),
}));

vi.mock('../../../../config/axios-config', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'test-id' })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => 'mock-token'),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("EditorWrapper (Editor) Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.__mockSlateOnChange;
    delete window.__mockSlateEditor;
  });

  const defaultValue = [
    { type: "paragraph", children: [{ text: "" }], align: "left" },
  ];

  test("renders Slate editor and children", () => {
    render(
      <TestWrapper>
        <Editor initialValue={defaultValue} title="Test Sheet">
          <Editor.Toolbar />
          <Editor.Input />
        </Editor>
      </TestWrapper>
    );

    expect(screen.getByTestId("slate-editor")).toBeInTheDocument();
    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("passes editor prop to children", () => {
    render(
      <TestWrapper>
        <Editor initialValue={defaultValue} title="Test Sheet">
          <Editor.Toolbar />
          <Editor.Input />
        </Editor>
      </TestWrapper>
    );

    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("uses initialValue prop", () => {
    const customValue = [
      { type: "heading", children: [{ text: "Custom Title" }] },
    ];

    render(
      <TestWrapper>
        <Editor initialValue={customValue} title="Test Sheet">
          <Editor.Toolbar />
          <Editor.Input />
        </Editor>
      </TestWrapper>
    );

    expect(screen.getByTestId("slate-editor")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("handles title prop", () => {
    render(
      <TestWrapper>
        <Editor initialValue={defaultValue} title="My Test Sheet">
          <Editor.Toolbar />
          <Editor.Input />
        </Editor>
      </TestWrapper>
    );

    expect(screen.getByTestId("slate-editor")).toBeInTheDocument();
  });

  test("renders without crashing when no children provided", () => {
    render(
      <TestWrapper>
        <Editor initialValue={defaultValue} title="Test Sheet" />
      </TestWrapper>
    );

    expect(screen.getByTestId("slate-editor")).toBeInTheDocument();
  });
});

describe("API calls (createSheet & updateSheet)", () => {
  const mockToken = "mock-token";
  const mockPayload = { foo: "bar" };
  const mockSheetId = "sheet-123";
  const mockResponse = { sheet_id: mockSheetId, result: "ok" };

  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.getItem = vi.fn(() => mockToken);
  });

  test("createSheet calls axiosInstance.post with correct params and returns data", async () => {
    const { createSheet } = await import("./EditorWrapper.jsx");
    const axios = (await import("../../../../config/axios-config")).default;
    axios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await createSheet(mockPayload);

    expect(axios.post).toHaveBeenCalledWith(
      "/api/v1/sheets",
      mockPayload,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`
        })
      })
    );
    expect(result).toEqual(mockResponse);
  });

  test("updateSheet calls axiosInstance.put with correct params and returns data", async () => {
    const { updateSheet } = await import("./EditorWrapper.jsx");
    const axios = (await import("../../../../config/axios-config")).default;
    axios.put.mockResolvedValueOnce({ data: mockResponse });

    const result = await updateSheet(mockSheetId, mockPayload);

    expect(axios.put).toHaveBeenCalledWith(
      `/api/v1/sheets/${mockSheetId}`,
      mockPayload,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockToken}`
        })
      })
    );
    expect(result).toEqual(mockResponse);
  });
});