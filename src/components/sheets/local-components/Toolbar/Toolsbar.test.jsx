import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { createEditor } from "slate";
import { Slate, withReact } from "slate-react";
import Toolsbar from "./Toolsbar";
import CustomEditor from "../../sheet-utils/CustomEditor";
import "@testing-library/jest-dom";

vi.mock("../../sheet-utils/CustomEditor", () => ({
  __esModule: true,
  default: {
    isMarkActive: vi.fn(),
    toggleMark: vi.fn(),
    isBlockActive: vi.fn(),
    toggleBlock: vi.fn(),
    toggleCodeBlock: vi.fn(),
    toggleImage: vi.fn(),
  },
}));

vi.mock("./MarkButton", () => ({
  __esModule: true,
  default: ({ children, className }) => (
    <button className={className}>{children}</button>
  ),
}));

vi.mock("./blockButton", () => ({
  __esModule: true,
  default: ({ children, className }) => (
    <button className={className}>{children}</button>
  ),
}));

vi.mock("slate-react", async () => {
  const actual = await vi.importActual("slate-react");
  return {
    ...actual,
    useSlate: vi.fn(),
  };
});

vi.mock("../../sheet-utils/serialize", () => ({
  serialize: vi.fn().mockReturnValue("serialized content"),
}));

vi.mock("react-icons/fa", () => ({
  FaBold: () => <span data-testid="bold-icon">Bold</span>,
  FaItalic: () => <span data-testid="italic-icon">Italic</span>,
  FaUnderline: () => <span data-testid="underline-icon">Underline</span>,
  FaListOl: () => <span data-testid="ordered-list-icon">OL</span>,
  FaListUl: () => <span data-testid="unordered-list-icon">UL</span>,
  FaAlignLeft: () => <span data-testid="align-left-icon">Left</span>,
  FaAlignCenter: () => <span data-testid="align-center-icon">Center</span>,
  FaAlignRight: () => <span data-testid="align-right-icon">Right</span>,
  FaAlignJustify: () => <span data-testid="align-justify-icon">Justify</span>,
  FaQuoteLeft: () => <span data-testid="quote-icon">Quote</span>,
  FaCode: () => <span data-testid="code-icon">Code</span>,
  FaImage: () => <span data-testid="image-icon">Image</span>,
  FaSave: () => <span data-testid="save-icon">Save</span>,
}));

vi.mock("react-icons/lu", () => ({
  LuHeading1: () => <span data-testid="heading1-icon">H1</span>,
  LuHeading2: () => <span data-testid="heading2-icon">H2</span>,
}));

describe("Toolsbar", () => {
  let mockEditor;
  let useSlate;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockEditor = createEditor();
    mockEditor.children = [
      { type: "paragraph", children: [{ text: "Test content" }] }
    ];
    
    const slateReact = await import("slate-react");
    useSlate = slateReact.useSlate;
    useSlate.mockReturnValue(mockEditor);
    
    CustomEditor.isMarkActive.mockReturnValue(false);
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

  test("displays all toolbar elements and buttons", () => {
    renderWithSlate(<Toolsbar editor={mockEditor} />);
    
    expect(screen.getByTestId("bold-icon")).toBeInTheDocument();
    expect(screen.getByTestId("italic-icon")).toBeInTheDocument();
    expect(screen.getByTestId("underline-icon")).toBeInTheDocument();
    
    expect(screen.getByTestId("ordered-list-icon")).toBeInTheDocument();
    expect(screen.getByTestId("unordered-list-icon")).toBeInTheDocument();
    
    expect(screen.getByTestId("align-left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("align-center-icon")).toBeInTheDocument();
    
    expect(screen.getByTestId("quote-icon")).toBeInTheDocument();
    expect(screen.getByTestId("code-icon")).toBeInTheDocument();
    expect(screen.getByTestId("image-icon")).toBeInTheDocument();
    
    expect(screen.getByText("Publish")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  test("displays pecha icon with correct source", () => {
    renderWithSlate(<Toolsbar editor={mockEditor} />);
    
    const pechaIcon = screen.getByAltText("source");
    expect(pechaIcon).toBeInTheDocument();
    expect(pechaIcon).toHaveAttribute("src", expect.stringContaining("pecha_icon.png"));
  });

  test("toggles code block when code button clicked", () => {
    renderWithSlate(<Toolsbar editor={mockEditor} />);
    
    const codeButton = screen.getByTestId("code-icon").closest("button");
    fireEvent.mouseDown(codeButton);
    
    expect(CustomEditor.toggleCodeBlock).toHaveBeenCalledWith(mockEditor);
  });

  test("toggles image when image button clicked", () => {
    renderWithSlate(<Toolsbar editor={mockEditor} />);
    
    const imageButton = screen.getByTestId("image-icon").closest("button");
    fireEvent.mouseDown(imageButton);
    
    expect(CustomEditor.toggleImage).toHaveBeenCalledWith(mockEditor);
  });

  test("serializes content when publish button clicked", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    renderWithSlate(<Toolsbar editor={mockEditor} />);
    
    const publishButton = screen.getByText("Publish");
    fireEvent.click(publishButton);
    
    expect(consoleSpy).toHaveBeenCalledWith([
      {
        text: "serialized content",
        node: 1,
      },
    ]);
    
    consoleSpy.mockRestore();
  });
});