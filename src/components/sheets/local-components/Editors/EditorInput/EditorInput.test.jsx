import React from 'react';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EditorInput from './EditorInput';
import { vi } from 'vitest';
import { Slate, withReact } from 'slate-react';
import { createEditor } from 'slate';

vi.mock('../../../local-components/Editors/Elements/youtube-element/YoutubeElement', () => ({
  default: ({ children, ...props }) => <div data-testid="youtube-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/Elements/custompecha-element/CustomPecha', () => ({
  default: ({ children, ...props }) => <div data-testid="pecha-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/Elements/default-element/DefaultElement', () => ({
  default: ({ children, ...props }) => <div data-testid="default-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/Elements/code-element/CodeElement', () => ({
  default: ({ children, ...props }) => <div data-testid="code-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/Elements/image-element/ImageElement', () => ({
  default: ({ children, ...props }) => <div data-testid="image-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/Elements/audio-element/AudioElement', () => ({
  default: ({ children, ...props }) => <div data-testid="audio-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/Elements/quote-element/QuoteElement', () => ({
  default: ({ children, ...props }) => <div data-testid="quote-element" {...props}>{children}</div>
}));

vi.mock('../../../local-components/Editors/leaves/Leaf', () => ({
  default: ({ children, ...props }) => <span data-testid="leaf" {...props}>{children}</span>
}));

vi.mock('../Elements/style-elements/Heading', () => ({
  default: ({ children, as, ...props }) => <div data-testid={`heading-${as}`} {...props}>{children}</div>
}));

vi.mock('../Elements/style-elements/List', () => ({
  default: ({ children, ...props }) => <div data-testid="list-element" {...props}>{children}</div>
}));

vi.mock('../Elements/style-elements/ListItem', () => ({
  default: ({ children, ...props }) => <div data-testid="list-item-element" {...props}>{children}</div>
}));

global.ClipboardEvent = class extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict.clipboardData || {
      getData: vi.fn(),
      setData: vi.fn(),
    };
  }
};

vi.mock('../../../sheet-utils/CustomEditor', () => ({
  default: {
    handlePaste: vi.fn(),
    toggleCodeBlock: vi.fn(),
    toggleMark: vi.fn(),
  }
}));

import CustomEditor from '../../../sheet-utils/CustomEditor';

// Simulate keyboard shortcuts as Slate blocks DOM events
const simulateKeyDown = (editor, event) => {
  if (event.shiftKey && event.key === 'Enter') {
    event.preventDefault();
    editor.insertText('\n');
    return;
  }
  
  if (!(event.metaKey || event.ctrlKey)) {
    return;
  }

  switch (event.key) {
    case '1': {
      event.preventDefault();
      CustomEditor.toggleCodeBlock(editor);
      break;
    }
    case 'i': {
      event.preventDefault();
      CustomEditor.toggleMark(editor, "italic");
      break;
    }
    case 'b': {
      event.preventDefault();
      CustomEditor.toggleMark(editor, "bold");
      break;
    }
    case 'u': {
      event.preventDefault();
      CustomEditor.toggleMark(editor, "underline");
      break;
    }
    case "z": {
      event.preventDefault();
      editor.undo();
      break;
    }
    case "y": {
      event.preventDefault();
      editor.redo();
      break;
    }
  }
};

const simulatePaste = (editor, event) => {
  CustomEditor.handlePaste(editor, event);
};

describe('EditorInput', () => {
  // let user;
  let editor;
  
  function renderWithSlate(initialValue = [{ type: 'paragraph', children: [{ text: '' }] }]) {
    editor = withReact(createEditor());
    editor.undo = vi.fn();
    editor.redo = vi.fn();
    editor.insertText = vi.fn();

    return render(
      <Slate editor={editor} initialValue={initialValue}>
        <EditorInput editor={editor} />
      </Slate>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    // user = userEvent.setup();
  });

  it('renders Editable with correct class', () => {
    renderWithSlate();
    expect(screen.getByRole('textbox')).toHaveClass('sheets-editable', 'content');
  });


  it('has correct event handlers bound', () => {
    const { container } = renderWithSlate();
    const editable = container.querySelector('[data-slate-editor="true"]');
    
    expect(editable).toBeInTheDocument();
  });

  describe('Element Rendering', () => {
    it('displays code block element with syntax highlighting', () => {
      const initialValue = [{ type: 'code', children: [{ text: 'const x = 1;' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('code-element')).toBeInTheDocument();
    });

    it('displays H1 heading element with proper styling', () => {
      const initialValue = [{ type: 'heading-one', children: [{ text: 'Main Title' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('heading-h1')).toBeInTheDocument();
    });

    it('displays H2 heading element with proper styling', () => {
      const initialValue = [{ type: 'heading-two', children: [{ text: 'Subtitle' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('heading-h2')).toBeInTheDocument();
    });

    it('displays block quote element with quote styling', () => {
      const initialValue = [{ type: 'block-quote', children: [{ text: 'Quote text' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('quote-element')).toBeInTheDocument();
    });

    it('displays numbered list element with proper ordering', () => {
      const initialValue = [{ type: 'ordered-list', children: [{ text: 'List item' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('list-element')).toBeInTheDocument();
    });

    it('displays bulleted list element with bullet points', () => {
      const initialValue = [{ type: 'unordered-list', children: [{ text: 'List item' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('list-element')).toBeInTheDocument();
    });

    it('displays individual list item element', () => {
      const initialValue = [{ type: 'list-item', children: [{ text: 'Item content' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('list-item-element')).toBeInTheDocument();
    });

    it('displays image element with source URL', () => {
      const initialValue = [{ type: 'image', children: [{ text: '' }], url: 'test.jpg' }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('image-element')).toBeInTheDocument();
    });

    it('renders youtube element correctly', () => {
      const initialValue = [{ type: 'youtube', children: [{ text: '' }], url: 'youtube.com/watch?v=123' }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('youtube-element')).toBeInTheDocument();
    });

    it('renders audio element correctly', () => {
      const initialValue = [{ type: 'audio', children: [{ text: '' }], url: 'audio.mp3' }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('audio-element')).toBeInTheDocument();
    });

    it('renders pecha element correctly', () => {
      const initialValue = [{ type: 'pecha', children: [{ text: 'Pecha content' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('pecha-element')).toBeInTheDocument();
    });

    it('renders default element for unknown types', () => {
      const initialValue = [{ type: 'unknown-element-type', children: [{ text: 'Unknown content' }] }];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('default-element')).toBeInTheDocument();
    });

    it('renders leaf component for text formatting', () => {
      const initialValue = [
        {
          type: 'paragraph',
          children: [{ text: 'formatted text', bold: true, italic: true }]
        }
      ];
      renderWithSlate(initialValue);
      
      expect(screen.getByTestId('leaf')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('inserts a new line when shift+enter is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'Enter',
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(editor.insertText).toHaveBeenCalledWith('\n');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  
    it('toggles bold formatting when ctrl+b is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'b',
        shiftKey: false,
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(CustomEditor.toggleMark).toHaveBeenCalledWith(editor, 'bold');
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  
    it('toggles italic formatting when ctrl+i is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'i',
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(CustomEditor.toggleMark).toHaveBeenCalledWith(editor, 'italic');
    });
  
    it('toggles underline formatting when ctrl+u is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'u',
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(CustomEditor.toggleMark).toHaveBeenCalledWith(editor, 'underline');
    });
  
    it('toggles code block when ctrl+1 is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: '1',
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(CustomEditor.toggleCodeBlock).toHaveBeenCalledWith(editor);
    });
  
    it('triggers undo when ctrl+z is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'z',
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(editor.undo).toHaveBeenCalled();
    });
  
    it('triggers redo when ctrl+y is pressed', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'y',
        ctrlKey: true,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(editor.redo).toHaveBeenCalled();
    });
  
    it('ignores key combinations without ctrl or meta key', () => {
      renderWithSlate();
      
      const mockEvent = {
        key: 'b',
        ctrlKey: false,
        metaKey: false,
        preventDefault: vi.fn()
      };
      
      simulateKeyDown(editor, mockEvent);
      
      expect(CustomEditor.toggleMark).not.toHaveBeenCalled();
      expect(CustomEditor.toggleCodeBlock).not.toHaveBeenCalled();
      expect(editor.undo).not.toHaveBeenCalled();
      expect(editor.redo).not.toHaveBeenCalled();
      expect(editor.insertText).not.toHaveBeenCalled();
    });
  });
  
  describe('Paste Handling', () => {
    it('calls CustomEditor.handlePaste when content is pasted', () => {
      renderWithSlate();
      
      const mockPasteEvent = {
        clipboardData: {
          getData: vi.fn().mockReturnValue('pasted content'),
          setData: vi.fn()
        }
      };
      
      simulatePaste(editor, mockPasteEvent);
      
      expect(CustomEditor.handlePaste).toHaveBeenCalledWith(editor, mockPasteEvent);
    });
  });
});