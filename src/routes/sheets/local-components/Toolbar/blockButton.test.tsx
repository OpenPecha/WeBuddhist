import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import BlockButton from "./blockButton";
import "@testing-library/jest-dom";

const mockIsBlockActive = vi.fn();
const mockToggleBlock = vi.fn();

vi.mock("../../sheet-utils/CustomEditor", () => ({
  __esModule: true,
  default: {
    isBlockActive: vi.fn(),
    toggleBlock: vi.fn(),
  },
  useCustomEditor: vi.fn(() => ({
    isBlockActive: mockIsBlockActive,
    toggleBlock: mockToggleBlock,
  })),
}));

vi.mock("slate-react", async () => {
  const actual = await vi.importActual("slate-react");
  return {
    ...actual,
    useSlate: vi.fn(),
  };
});

describe("BlockButton", () => {
  let mockEditor;
  let useSlate;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockIsBlockActive.mockClear();
    mockToggleBlock.mockClear();
    mockEditor = createEditor();
    
    const slateReact = await import("slate-react");
    useSlate = slateReact.useSlate;
    useSlate.mockReturnValue(mockEditor);
    
    mockIsBlockActive.mockReturnValue(false);
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
    renderWithSlate(<BlockButton {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: "H1" })).toBeInTheDocument();
  });

  test("applies active class when block format is active", () => {
    mockIsBlockActive.mockReturnValue(true);
    
    renderWithSlate(<BlockButton {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: "H1" });
    expect(button).toHaveClass("active");
  });

  test("applies custom className when provided", () => {
    renderWithSlate(<BlockButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole("button", { name: "H1" });
    expect(button).toHaveClass("custom-class");
  });

  test("toggles block format when button clicked", () => {
    renderWithSlate(<BlockButton {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: "H1" });
    fireEvent.mouseDown(button);
    
    expect(mockToggleBlock).toHaveBeenCalledWith(mockEditor, "heading-one");
  });

  test("checks if block format is active on render", () => {
    const format = "heading-two";
    
    renderWithSlate(<BlockButton format={format} children="H2" />);
    
    expect(mockIsBlockActive).toHaveBeenCalledWith(mockEditor, format);
  });
});