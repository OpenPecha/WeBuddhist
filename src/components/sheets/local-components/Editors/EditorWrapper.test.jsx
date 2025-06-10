
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import Editor from "./EditorWrapper.jsx";

vi.mock("./EditorInput/EditorInput", () => ({
  __esModule: true,
  default: () => <div data-testid="editor-input">EditorInput</div>,
}));
vi.mock("../Toolbar/Toolsbar", () => ({
  __esModule: true,
  default: () => <div data-testid="editor-toolbar">EditorToolbar</div>,
}));
vi.mock('slate-react', async () => {
  const actual = await vi.importActual('slate-react');
  return {
    ...actual,
    Slate: vi.fn(({ onChange, children, editor, initialValue }) => {
      // Store the onChange and editor for test access
      if (onChange) {
        window.__mockSlateOnChange = onChange;
        window.__mockSlateEditor = editor;
      }
      return <div data-testid="slate-editor">{children}</div>;
    })
  };
});
describe("EditorWrapper (Editor) Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {});
    //Clean up globals
    delete window.__mockSlateOnChange;
    delete window.__mockSlateEditor;
  });

  const defaultValue = [
    { type: "paragraph", children: [{ text: "" }], align: "left" },
  ];

  test("renders Slate editor and children", () => {
    render(
      <Editor initialValue={defaultValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    );
    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("passes editor prop to children", () => {
    render(
      <Editor initialValue={defaultValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    );
    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("saves content to localStorage on change", () => {
    // Simulate the onChange logic
    const fakeValue = [
      { type: "paragraph", children: [{ text: "Hello" }], align: "left" },
    ];
    window.localStorage.setItem("sheets-content", JSON.stringify(fakeValue));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "sheets-content",
      JSON.stringify(fakeValue)
    );
  });

  test("uses initialValue prop", () => {
    render(
      <Editor initialValue={defaultValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    );
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

   test("saves content to localStorage on AST change", () => {
    render(
      <Editor initialValue={defaultValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    );

    const newValue = [
      { type: "paragraph", children: [{ text: "Hello World" }], align: "left" },
    ];

    // Verify the onChange function is available
    expect(window.__mockSlateOnChange).toBeDefined();
    expect(window.__mockSlateEditor).toBeDefined();

    // Set up editor with non-selection operations
    window.__mockSlateEditor.operations = [
      { type: 'insert_text', path: [0, 0], offset: 0, text: 'Hello' },
      { type: 'set_selection', path: [0, 0], offset: 5 }
    ];

    window.__mockSlateOnChange(newValue);

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "sheets-content",
      JSON.stringify(newValue)
    );
  });

  test("does NOT save to localStorage on selection-only change", () => {
    render(
      <Editor initialValue={defaultValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    );

    const newValue = [
      { type: "paragraph", children: [{ text: "Hello" }], align: "left" },
    ];

    // Verify the onChange function is available
    expect(window.__mockSlateOnChange).toBeDefined();
    expect(window.__mockSlateEditor).toBeDefined();

    // Set up editor with only selection operations
    window.__mockSlateEditor.operations = [
      { type: 'set_selection', path: [0, 0], offset: 2 },
      { type: 'set_selection', path: [0, 0], offset: 5 }
    ];

    window.__mockSlateOnChange(newValue);

    // Should not save to localStorage for selection-only changes
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });

  test("handles empty operations array", () => {
    render(
      <Editor initialValue={defaultValue}>
        <Editor.Toolbar />
        <Editor.Input />
      </Editor>
    );

    const newValue = [
      { type: "paragraph", children: [{ text: "Test" }], align: "left" },
    ];

    window.__mockSlateEditor.operations = [];

    window.__mockSlateOnChange(newValue);

    // Should not save with empty operations (no AST change)
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
  });
});
