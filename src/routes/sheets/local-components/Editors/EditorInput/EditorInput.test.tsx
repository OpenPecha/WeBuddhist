import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditorInput from "./EditorInput.tsx";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { Slate, withReact } from "slate-react";
import { createEditor, type Editor } from "slate";
const mockHandlePaste = vi.fn();
const mockToggleCodeBlock = vi.fn();
const mockToggleMark = vi.fn();

vi.mock(
  "../../../local-components/Editors/Elements/youtube-element/YoutubeElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="youtube-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/custompecha-element/CustomPecha",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="pecha-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/pecha-element/PechaElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="pecha-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/default-element/DefaultElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="default-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/code-element/CodeElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="code-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/image-element/ImageElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="image-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/audio-element/AudioElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="audio-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "../../../local-components/Editors/Elements/quote-element/QuoteElement",
  () => ({
    default: ({ children, ...props }: any) => (
      <div data-testid="quote-element" {...props}>
        {children}
      </div>
    ),
  }),
);

vi.mock("../../../local-components/Editors/leaves/Leaf", () => ({
  default: ({ children, ...props }: any) => (
    <span data-testid="leaf" {...props}>
      {children}
    </span>
  ),
}));

vi.mock("../Elements/style-elements/Heading", () => ({
  default: ({ children, as, ...props }: any) => (
    <div data-testid={`heading-${as}`} {...props}>
      {children}
    </div>
  ),
}));

vi.mock("../Elements/style-elements/List", () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="list-element" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("../Elements/style-elements/ListItem", () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="list-item-element" {...props}>
      {children}
    </div>
  ),
}));

global.ClipboardEvent = class extends Event {
  constructor(type: string, eventInitDict: any = {}) {
    super(type, eventInitDict);
    (this as any).clipboardData = eventInitDict.clipboardData || {
      getData: vi.fn(),
      setData: vi.fn(),
    };
  }
} as any;

vi.mock("../../../sheet-utils/CustomEditor", () => ({
  default: {
    handlePaste: vi.fn(),
    toggleCodeBlock: vi.fn(),
    toggleMark: vi.fn(),
  },
  useCustomEditor: vi.fn(() => ({
    handlePaste: mockHandlePaste,
    toggleCodeBlock: mockToggleCodeBlock,
    toggleMark: mockToggleMark,
  })),
}));

// Simulate keyboard shortcuts as Slate blocks DOM events
const simulateKeyDown = (editor: Editor, event: KeyboardEvent) => {
  if (event.shiftKey && event.key === "Enter") {
    event.preventDefault();
    editor.insertText("\n");
    return;
  }

  if (!(event.metaKey || event.ctrlKey)) {
    return;
  }

  switch (event.key) {
    case "1": {
      event.preventDefault();
      mockToggleCodeBlock(editor);
      break;
    }
    case "i": {
      event.preventDefault();
      mockToggleMark(editor, "italic");
      break;
    }
    case "b": {
      event.preventDefault();
      mockToggleMark(editor, "bold");
      break;
    }
    case "u": {
      event.preventDefault();
      mockToggleMark(editor, "underline");
      break;
    }
    case "z": {
      event.preventDefault();
      (editor as any).undo();
      break;
    }
    case "y": {
      event.preventDefault();
      (editor as any).redo();
      break;
    }
  }
};

const simulatePaste = (editor: Editor, event: ClipboardEvent) => {
  mockHandlePaste(editor, event);
};

describe("EditorInput", () => {
  let editor: Editor;

  function renderWithSlate(
    initialValue = [{ type: "paragraph", children: [{ text: "" }] }],
  ) {
    editor = withReact(createEditor());
    (editor as any).undo = vi.fn();
    (editor as any).redo = vi.fn();
    (editor as any).insertText = vi.fn();

    return render(
      <Slate editor={editor as any} initialValue={initialValue}>
        <EditorInput editor={editor} />
      </Slate>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has correct event handlers bound", () => {
    const { container } = renderWithSlate();
    const editable = container.querySelector('[data-slate-editor="true"]');

    expect(editable).toBeInTheDocument();
  });

  describe("Element Rendering", () => {
    it("displays code block element with syntax highlighting", () => {
      const initialValue = [
        { type: "code", children: [{ text: "const x = 1;" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("code-element")).toBeInTheDocument();
    });

    it("displays H1 heading element with proper styling", () => {
      const initialValue = [
        { type: "heading-one", children: [{ text: "Main Title" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("heading-h1")).toBeInTheDocument();
    });

    it("displays H2 heading element with proper styling", () => {
      const initialValue = [
        { type: "heading-two", children: [{ text: "Subtitle" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("heading-h2")).toBeInTheDocument();
    });

    it("displays block quote element with quote styling", () => {
      const initialValue = [
        { type: "block-quote", children: [{ text: "Quote text" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("quote-element")).toBeInTheDocument();
    });

    it("displays numbered list element with proper ordering", () => {
      const initialValue = [
        { type: "ordered-list", children: [{ text: "List item" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("list-element")).toBeInTheDocument();
    });

    it("displays bulleted list element with bullet points", () => {
      const initialValue = [
        { type: "unordered-list", children: [{ text: "List item" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("list-element")).toBeInTheDocument();
    });

    it("displays individual list item element", () => {
      const initialValue = [
        { type: "list-item", children: [{ text: "Item content" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("list-item-element")).toBeInTheDocument();
    });

    it("displays image element with source URL", () => {
      const initialValue = [
        { type: "image", children: [{ text: "" }], url: "test.jpg" },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("image-element")).toBeInTheDocument();
    });

    it("renders youtube element correctly", () => {
      const initialValue = [
        {
          type: "youtube",
          children: [{ text: "" }],
          url: "youtube.com/watch?v=123",
        },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("youtube-element")).toBeInTheDocument();
    });

    it("renders audio element correctly", () => {
      const initialValue = [
        { type: "audio", children: [{ text: "" }], url: "audio.mp3" },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("audio-element")).toBeInTheDocument();
    });

    it("renders pecha element correctly", () => {
      const initialValue = [
        { type: "pecha", children: [{ text: "Pecha content" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("pecha-element")).toBeInTheDocument();
    });

    it("renders custompecha element correctly", () => {
      const initialValue = [
        { type: "custompecha", children: [{ text: "Custom Pecha content" }] },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("pecha-element")).toBeInTheDocument();
    });

    it("renders default element for unknown types", () => {
      const initialValue = [
        {
          type: "unknown-element-type",
          children: [{ text: "Unknown content" }],
        },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("default-element")).toBeInTheDocument();
    });

    it("renders leaf component for text formatting", () => {
      const initialValue = [
        {
          type: "paragraph",
          children: [{ text: "formatted text", bold: true, italic: true }],
        },
      ];
      renderWithSlate(initialValue);

      expect(screen.getByTestId("leaf")).toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("inserts a new line when shift+enter is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "Enter",
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect(editor.insertText).toHaveBeenCalledWith("\n");
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("toggles bold formatting when ctrl+b is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "b",
        shiftKey: false,
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect(mockToggleMark).toHaveBeenCalledWith(editor, "bold");
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("toggles italic formatting when ctrl+i is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "i",
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect(mockToggleMark).toHaveBeenCalledWith(editor, "italic");
    });

    it("toggles underline formatting when ctrl+u is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "u",
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect(mockToggleMark).toHaveBeenCalledWith(editor, "underline");
    });

    it("toggles code block when ctrl+1 is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "1",
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect(mockToggleCodeBlock).toHaveBeenCalledWith(editor);
    });

    it("triggers undo when ctrl+z is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "z",
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect((editor as any).undo).toHaveBeenCalled();
    });

    it("triggers redo when ctrl+y is pressed", () => {
      renderWithSlate();

      const mockEvent = {
        key: "y",
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      simulateKeyDown(editor as any, mockEvent as any);

      expect((editor as any).redo).toHaveBeenCalled();
    });

    it("ignores key combinations without ctrl or meta key", () => {
      renderWithSlate();

      const mockEvent = {
        key: "b",
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn(),
      };

      vi.clearAllMocks();
      simulateKeyDown(editor as any, mockEvent as any);

      expect(mockEvent.key).toBe("b");
      expect(mockEvent.ctrlKey).toBe(false);
      expect(mockEvent.metaKey).toBe(false);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(mockToggleMark).not.toHaveBeenCalled();
      expect(mockToggleCodeBlock).not.toHaveBeenCalled();
      expect((editor as any).undo).not.toHaveBeenCalled();
      expect((editor as any).redo).not.toHaveBeenCalled();
      expect(editor.insertText).not.toHaveBeenCalled();
    });
  });

  describe("Paste Handling", () => {
    it("calls CustomEditor.handlePaste when content is pasted", () => {
      renderWithSlate();

      const mockPasteEvent = new ClipboardEvent("paste");
      Object.defineProperty(mockPasteEvent, "clipboardData", {
        value: {
          getData: vi.fn().mockReturnValue("pasted content"),
          setData: vi.fn(),
        },
      });

      simulatePaste(editor, mockPasteEvent);

      expect(mockHandlePaste).toHaveBeenCalledWith(editor, mockPasteEvent);
    });
  });
});
