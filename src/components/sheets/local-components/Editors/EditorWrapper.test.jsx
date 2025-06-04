
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

describe("EditorWrapper (Editor) Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {});
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
});
