import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import blockButton from "./blockButton";
import CustomEditor from "../../sheet-utils/CustomEditor";
import "@testing-library/jest-dom";

vi.mock("../../sheet-utils/CustomEditor", () => ({
  __esModule: true,
  default: {
    isBlockActive: vi.fn(),
    toggleBlock: vi.fn(),
  },
}));

vi.mock("slate-react", async () => {
  const actual = await vi.importActual("slate-react");
  return {
    ...actual,
    useSlate: vi.fn(),
  };
});

describe("blockButton", () => {
  let mockEditor;
  let useSlate;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEditor = createEditor();
    
    const slateReact = await import("slate-react");
    useSlate = slateReact.useSlate;
    useSlate.mockReturnValue(mockEditor);
    
    CustomEditor.isBlockActive.mockReturnValue(false);
  });

  const renderWithSlate = (component) => {
    const initialValue = [{ type: "paragraph", children: [{ text: "Test content" }] }];
    return render(
      <Slate editor={withReact(createEditor())} initialValue={initialValue}>
        {component}
      </Slate>
    );
  };

  const defaultProps = {
    format: "heading-one",
    children: "H1",
  };

  test("displays button with children content", () => {
    const BlockButton = blockButton;
    renderWithSlate(<BlockButton {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: "H1" })).toBeInTheDocument();
  });

  test("applies active class when block format is active", () => {
    CustomEditor.isBlockActive.mockReturnValue(true);
    
    const BlockButton = blockButton;
    renderWithSlate(<BlockButton {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: "H1" });
    expect(button).toHaveClass("active");
  });

  test("applies custom className when provided", () => {
    const BlockButton = blockButton;
    renderWithSlate(<BlockButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole("button", { name: "H1" });
    expect(button).toHaveClass("custom-class");
  });

  test("toggles block format when button clicked", () => {
    const BlockButton = blockButton;
    renderWithSlate(<BlockButton {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: "H1" });
    fireEvent.mouseDown(button);
    
    expect(CustomEditor.toggleBlock).toHaveBeenCalledWith(mockEditor, "heading-one");
  });

  test("checks if block format is active on render", () => {
    const BlockButton = blockButton;
    const format = "heading-two";
    
    renderWithSlate(<BlockButton format={format} children="H2" />);
    
    expect(CustomEditor.isBlockActive).toHaveBeenCalledWith(mockEditor, format);
  });
});