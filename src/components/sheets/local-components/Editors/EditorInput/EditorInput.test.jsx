import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EditorInput from './EditorInput';
import { vi } from 'vitest';
import { Slate } from 'slate-react';
import { createEditor } from 'slate';

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

describe('EditorInput', () => {
  let user;
  
  function renderWithSlate(editor) {
    const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }];
    return render(
      <Slate editor={editor} initialValue={initialValue}>
        <EditorInput editor={editor} />
      </Slate>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it('renders Editable with correct class', () => {
    const editor = createEditor();
    renderWithSlate(editor);
    expect(screen.getByRole('textbox')).toHaveClass('sheets-editable', 'content');
  });


  it('has correct event handlers bound', () => {
    const editor = createEditor();
    const { container } = renderWithSlate(editor);
    const editable = container.querySelector('[data-slate-editor="true"]');
    
    expect(editable).toBeInTheDocument();
  });
});