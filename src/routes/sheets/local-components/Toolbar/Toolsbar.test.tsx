import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    toggleSheetSegment: vi.fn(),
  },
  useCustomEditor: vi.fn(() => ({
    isMarkActive: vi.fn(),
    toggleMark: vi.fn(),
    isBlockActive: vi.fn(),
    toggleBlock: vi.fn(),
    toggleCodeBlock: vi.fn(),
    toggleImage: vi.fn(),
    toggleSheetSegment: vi.fn(),
  })),
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("./MarkButton", () => ({
  __esModule: true,
  default: ({ children, className, format }) => (
    <button className={className} data-format={format}>
      {children}
    </button>
  ),
}));

vi.mock("./blockButton", () => ({
  __esModule: true,
  default: ({ children, className, format }) => (
    <button className={className} data-format={format}>
      {children}
    </button>
  ),
}));

vi.mock("slate-react", async () => {
  const actual = await vi.importActual("slate-react");
  return {
    ...actual,
    useSlate: vi.fn(),
  };
});

vi.mock("../../sheet-utils/Constant", () => ({
  createPayload: vi.fn(),
}));

vi.mock("../Editors/EditorWrapper", () => ({
  updateSheet: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../modals/alert-modal/AlertModal", () => ({
  __esModule: true,
  default: ({ type, message, onClose }) => (
    <div data-testid="alert-modal" data-type={type}>
      <span>{message}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
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
}));

vi.mock("react-icons/lu", () => ({
  LuHeading1: () => <span data-testid="heading1-icon">H1</span>,
  LuHeading2: () => <span data-testid="heading2-icon">H2</span>,
}));

vi.mock("../../../../assets/icons/pecha_icon.png", () => ({
  default: "mocked-pecha-icon.png",
}));

describe("Toolsbar", () => {
  let mockEditor;
  let useSlate;
  let mockToggleCodeBlock;
  let mockToggleImage;
  let mockToggleSheetSegment;
  let mockUpdateSheet;
  let mockNavigate;
  let mockCreatePayload;
  let mockUseCustomEditor;

  const defaultProps = {
    editor: null,
    value: [{ type: "paragraph", children: [{ text: "Test content" }] }],
    title: "Test Title",
    sheetId: "test-sheet-id",
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockToggleCodeBlock = vi.fn();
    mockToggleImage = vi.fn();
    mockToggleSheetSegment = vi.fn();
    mockUpdateSheet = vi.fn();
    mockNavigate = vi.fn();
    mockCreatePayload = vi.fn();

    mockEditor = createEditor();
    mockEditor.children = [
      { type: "paragraph", children: [{ text: "Test content" }] },
    ];

    const slateReact = await import("slate-react");
    useSlate = slateReact.useSlate;
    useSlate.mockReturnValue(mockEditor);

    const customEditorModule = await import("../../sheet-utils/CustomEditor");
    mockUseCustomEditor = customEditorModule.useCustomEditor;
    mockUseCustomEditor.mockReturnValue({
      isMarkActive: vi.fn(),
      toggleMark: vi.fn(),
      isBlockActive: vi.fn(),
      toggleBlock: vi.fn(),
      toggleCodeBlock: mockToggleCodeBlock,
      toggleImage: mockToggleImage,
      toggleSheetSegment: mockToggleSheetSegment,
    });

    CustomEditor.isMarkActive.mockReturnValue(false);
    CustomEditor.isBlockActive.mockReturnValue(false);

    const constantModule = await import("../../sheet-utils/Constant");
    constantModule.createPayload.mockImplementation(mockCreatePayload);

    const editorWrapperModule = await import("../Editors/EditorWrapper");
    editorWrapperModule.updateSheet.mockImplementation(mockUpdateSheet);

    const routerModule = await import("react-router-dom");
    routerModule.useNavigate.mockReturnValue(mockNavigate);

    mockCreatePayload.mockReturnValue({ test: "payload" });
    mockUpdateSheet.mockResolvedValue({ success: true });

    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: vi.fn(() => "Test Sheet Title"),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  const renderWithSlate = (component) => {
    const initialValue = [
      { type: "paragraph", children: [{ text: "Test content" }] },
    ];
    return render(
      <Slate editor={withReact(createEditor())} initialValue={initialValue}>
        {component}
      </Slate>,
    );
  };

  test("displays pecha icon with correct source", () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const pechaIcon = screen.getByAltText("source");
    expect(pechaIcon).toBeInTheDocument();
    expect(pechaIcon).toHaveAttribute("src", "mocked-pecha-icon.png");
  });

  test("toggles sheet segment when pecha icon clicked", () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const pechaButton = screen.getByAltText("source").closest("button");
    fireEvent.mouseDown(pechaButton);

    expect(mockToggleSheetSegment).toHaveBeenCalledWith(mockEditor);
  });

  test("toggles code block when code button clicked", () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const codeButton = screen.getByTestId("code-icon").closest("button");
    fireEvent.mouseDown(codeButton);

    expect(mockToggleCodeBlock).toHaveBeenCalledWith(mockEditor);
  });

  test("toggles image when image button clicked", () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const imageButton = screen.getByTestId("image-icon").closest("button");
    fireEvent.mouseDown(imageButton);

    expect(mockToggleImage).toHaveBeenCalledWith(mockEditor);
  });

  test("publishes sheet when publish button clicked", async () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const publishButton = screen.getByText("publish");
    fireEvent.click(publishButton);

    expect(mockCreatePayload).toHaveBeenCalledWith(
      defaultProps.value,
      defaultProps.title,
      true,
    );
    expect(mockUpdateSheet).toHaveBeenCalledWith(defaultProps.sheetId, {
      test: "payload",
    });
  });

  test("shows success alert after successful publish", async () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const publishButton = screen.getByText("publish");
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId("alert-modal")).toBeInTheDocument();
      expect(screen.getByTestId("alert-modal")).toHaveAttribute(
        "data-type",
        "success",
      );
      expect(
        screen.getByText("Sheet published successfully!"),
      ).toBeInTheDocument();
    });
  });

  test("shows error alert when publish fails", async () => {
    mockUpdateSheet.mockRejectedValue(new Error("Failed to update"));
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const publishButton = screen.getByText("publish");
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByTestId("alert-modal")).toBeInTheDocument();
      expect(screen.getByTestId("alert-modal")).toHaveAttribute(
        "data-type",
        "error",
      );
      expect(screen.getByText("Failed to publish sheet.")).toBeInTheDocument();
    });
  });

  test("uses session storage title when title prop is not provided", async () => {
    const propsWithoutTitle = { ...defaultProps, title: undefined };
    renderWithSlate(<Toolsbar {...propsWithoutTitle} editor={mockEditor} />);

    const publishButton = screen.getByText("publish");
    fireEvent.click(publishButton);

    expect(mockCreatePayload).toHaveBeenCalledWith(
      defaultProps.value,
      "Test Sheet Title",
      true,
    );
  });

  test("disables publish button when sheetId is not provided", () => {
    const propsWithoutSheetId = { ...defaultProps, sheetId: undefined };
    renderWithSlate(<Toolsbar {...propsWithoutSheetId} editor={mockEditor} />);

    const publishButton = screen.getByText("publish");
    expect(publishButton).toBeDisabled();
    expect(publishButton).toHaveClass("disabled-button");
  });

  test("prevents default behavior on mouseDown events", () => {
    renderWithSlate(<Toolsbar {...defaultProps} editor={mockEditor} />);

    const codeButton = screen.getByTestId("code-icon").closest("button");
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");

    fireEvent(codeButton, mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
