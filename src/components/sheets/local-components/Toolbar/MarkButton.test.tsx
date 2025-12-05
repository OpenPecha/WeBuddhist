import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import MarkButton from "./MarkButton";
import CustomEditor from "../../sheet-utils/CustomEditor";
import "@testing-library/jest-dom";

const mockIsMarkActive = vi.fn();
const mockToggleMark = vi.fn();

vi.mock("../../sheet-utils/CustomEditor", () => ({
  __esModule: true,
  default: {
    isMarkActive: vi.fn(),
    toggleMark: vi.fn(),
  },
  useCustomEditor: vi.fn(() => ({
    isMarkActive: mockIsMarkActive,
    toggleMark: mockToggleMark,
  })),
}));

vi.mock("slate-react", async () => {
  const actual = await vi.importActual("slate-react");
  return {
    ...actual,
    useSlate: vi.fn(),
  };
});

describe("MarkButton", () => {
  let mockEditor;
  let useSlate;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockIsMarkActive.mockClear();
    mockToggleMark.mockClear();
    mockEditor = createEditor();
    
    const slateReact = await import("slate-react");
    useSlate = slateReact.useSlate;
    useSlate.mockReturnValue(mockEditor);
    
    mockIsMarkActive.mockReturnValue(false);
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
    format: "bold",
    children: "B",
  };

  test("displays button with children content", () => {
    renderWithSlate(<MarkButton {...defaultProps} />);
    
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
  });

  test("applies active class when text format is active", () => {
    mockIsMarkActive.mockReturnValue(true);
    
    renderWithSlate(<MarkButton {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: "B" });
    expect(button).toHaveClass("active");
  });

  test("applies custom className when provided", () => {
    renderWithSlate(<MarkButton {...defaultProps} className="custom-class" />);
    
    const button = screen.getByRole("button", { name: "B" });
    expect(button).toHaveClass("custom-class");
  });

  test("toggles text format when button clicked", () => {
    renderWithSlate(<MarkButton {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: "B" });
    fireEvent.mouseDown(button);
    
    expect(mockToggleMark).toHaveBeenCalledWith(mockEditor, "bold");
  });

  test("checks if text format is active on render", () => {
    const format = "italic";
    
    renderWithSlate(<MarkButton format={format} children="I" />);
    
    expect(mockIsMarkActive).toHaveBeenCalledWith(mockEditor, format);
  });
});