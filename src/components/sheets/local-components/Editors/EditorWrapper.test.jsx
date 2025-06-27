import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router,useParams, useNavigate  } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import Editor, { createSheet, updateSheet } from './EditorWrapper';
import axiosInstance from '../../../../config/axios-config';
import { useDebounce } from 'use-debounce';
import { createPayload } from '../../sheet-utils/Constant';

vi.mock('../../../../config/axios-config', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock('use-debounce', () => ({
  useDebounce: vi.fn(),
}));

vi.mock('slate', () => ({
  createEditor: vi.fn(() => ({
    operations: [],
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  })),
}));

vi.mock('slate-react', () => ({
  Slate: ({ children, initialValue }) => (
    <div data-testid="slate-editor" data-initial-value={JSON.stringify(initialValue)}>
      {children}
    </div>
  ),
  withReact: vi.fn((editor) => editor),
}));

vi.mock('slate-history', () => ({
  withHistory: vi.fn((editor) => editor),
}));

vi.mock('../../sheet-utils/withEmbeds', () => ({
  default: vi.fn((editor) => editor),
}));

vi.mock('./EditorInput/EditorInput', () => ({
  default: () => <div data-testid="editor-input">Editor Input</div>,
}));

vi.mock('../Toolbar/Toolsbar', () => ({
  default: ({title, sheetId }) => (
    <div data-testid="toolbar">
      Toolbar - Title: {title}, SheetId: {sheetId}
    </div>
  ),
}));

vi.mock('../../sheet-utils/Constant', () => ({
  createPayload: vi.fn((content, title) => ({ content, title, payload: 'mocked' })),
}));


describe('Editor Component', () => {
  const mockNavigate = vi.fn();
  let mockSetItem, mockGetItem, mockRemoveItem;

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    
    mockSetItem = vi.fn();
    mockGetItem = vi.fn();
    mockRemoveItem = vi.fn();
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: mockSetItem,
        getItem: mockGetItem,
        removeItem: mockRemoveItem,
      },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/sheets/new',
      },
      writable: true,
    });

    useDebounce.mockImplementation((value) => [value]);
    createPayload.mockImplementation((content, title) => ({ content, title }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    initialValue: [{ type: 'paragraph', children: [{ text: 'Initial content' }] }],
    title: 'Test Sheet Title',
    children: <div data-testid="child-component">Child Component</div>,
  };

  const renderEditor = (props = {}) => {
    return render(
      <Router>
        <Editor {...defaultProps} {...props} />
      </Router>
    );
  };

  describe('Component Rendering', () => {
    test('renders Editor with initial setup', () => {
      useParams.mockReturnValue({ id: 'new' });
      
      renderEditor();
      
      expect(screen.getByTestId('slate-editor')).toBeInTheDocument();
      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    test('renders with existing sheet ID', () => {
      useParams.mockReturnValue({ id: '123' });
      
      renderEditor();
      
      expect(screen.getByText('Toolbar - Title: Test Sheet Title, SheetId: 123')).toBeInTheDocument();
    });

    test('renders with new sheet (no ID)', () => {
      useParams.mockReturnValue({ id: 'new' });
      
      renderEditor();
      
      expect(screen.getByText('Toolbar - Title: Test Sheet Title, SheetId:')).toBeInTheDocument();
    });

    test('passes initialValue to Slate component', () => {
      useParams.mockReturnValue({ id: 'new' });
      
      renderEditor();
      
      const slateEditor = screen.getByTestId('slate-editor');
      expect(slateEditor).toHaveAttribute(
        'data-initial-value',
        JSON.stringify(defaultProps.initialValue)
      );
    });
  });

  describe('Sheet Creation and Updates', () => {
    test('creates new sheet when no sheetId exists', async () => {
      useParams.mockReturnValue({ id: 'new' });
      mockGetItem.mockReturnValue('mock-token');
      axiosInstance.post.mockResolvedValue({
        data: { sheet_id: 'new-sheet-123' }
      });

      const newContent = [{ type: 'paragraph', children: [{ text: 'New content' }] }];
      useDebounce.mockImplementation((value) => [newContent]);

      renderEditor();

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          '/api/v1/sheets',
          { content: newContent, title: 'Test Sheet Title' },
          {
            headers: {
              Authorization: 'Bearer mock-token'
            }
          }
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/sheets/new-sheet-123', { replace: true });
    });

    test('updates existing sheet when sheetId exists', async () => {
      useParams.mockReturnValue({ id: '456' });
      mockGetItem.mockReturnValue('mock-token');
      axiosInstance.put.mockResolvedValue({ data: { success: true } });

      const updatedContent = [{ type: 'paragraph', children: [{ text: 'Updated content' }] }];
      useDebounce.mockImplementation((value) => [updatedContent]);

      renderEditor();

      await waitFor(() => {
        expect(axiosInstance.put).toHaveBeenCalledWith(
          '/api/v1/sheets/456',
          { content: updatedContent, title: 'Test Sheet Title' },
          {
            headers: {
              Authorization: 'Bearer mock-token'
            }
          }
        );
      });

      expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    test('does not save when content has not changed', async () => {
      useParams.mockReturnValue({ id: 'new' });
      useDebounce.mockImplementation(() => [defaultProps.initialValue]);
      renderEditor();

      await waitFor(() => {
        expect(axiosInstance.post).not.toHaveBeenCalled();
        expect(axiosInstance.put).not.toHaveBeenCalled();
      });
    });

    test('does not save immediately after sheet creation', async () => {
      useParams.mockReturnValue({ id: 'new' });
      mockGetItem.mockReturnValue('mock-token');
      axiosInstance.post.mockResolvedValue({
        data: { sheet_id: 'new-sheet-123' }
      });

      const newContent = [{ type: 'paragraph', children: [{ text: 'New content' }] }];
      
      let callCount = 0;
      useDebounce.mockImplementation(() => {
        callCount++;
        return [newContent];
      });

      renderEditor();

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(axiosInstance.put).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles sheet creation error gracefully', async () => {
      useParams.mockReturnValue({ id: 'new' });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      axiosInstance.post.mockRejectedValue(new Error('Creation failed'));

      const newContent = [{ type: 'paragraph', children: [{ text: 'New content' }] }];
      useDebounce.mockImplementation(() => [newContent]);

      renderEditor();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error saving sheet:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('handles sheet update error gracefully', async () => {
      useParams.mockReturnValue({ id: '789' });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      axiosInstance.put.mockRejectedValue(new Error('Update failed'));

      const updatedContent = [{ type: 'paragraph', children: [{ text: 'Updated content' }] }];
      useDebounce.mockImplementation(() => [updatedContent]);

      renderEditor();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error saving sheet:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Navigation Handling', () => {
    test('navigates correctly when creating new sheet', async () => {
      useParams.mockReturnValue({ id: 'new' });
      window.location.pathname = '/sheets/new';
      
      mockGetItem.mockReturnValue('mock-token');
      axiosInstance.post.mockResolvedValue({
        data: { sheet_id: 'created-sheet-456' }
      });

      const newContent = [{ type: 'paragraph', children: [{ text: 'New content' }] }];
      useDebounce.mockImplementation(() => [newContent]);

      renderEditor();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sheets/created-sheet-456', { replace: true });
      });
    });

    test('handles navigation with different URL patterns', async () => {
      useParams.mockReturnValue({ id: 'new' });
      window.location.pathname = '/editor/new';
      
      mockGetItem.mockReturnValue('mock-token');
      axiosInstance.post.mockResolvedValue({
        data: { sheet_id: 'new-id-789' }
      });

      const newContent = [{ type: 'paragraph', children: [{ text: 'Content' }] }];
      useDebounce.mockImplementation(() => [newContent]);

      renderEditor();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/editor/new-id-789', { replace: true });
      });
    });
  });

  describe('Debounce Integration', () => {
    test('uses debounced value for saving', async () => {
      useParams.mockReturnValue({ id: 'test-id' });
      mockGetItem.mockReturnValue('token');
      
      const debouncedValue = [{ type: 'paragraph', children: [{ text: 'Debounced' }] }];
      
      useDebounce.mockReturnValue([debouncedValue]);
      axiosInstance.put.mockResolvedValue({ data: { success: true } });

      renderEditor();

      await waitFor(() => {
        expect(axiosInstance.put).toHaveBeenCalledWith(
          '/api/v1/sheets/test-id',
          expect.objectContaining({
            content: debouncedValue
          }),
          expect.any(Object)
        );
      });
    });

    test('does not save when debounced value is null/undefined', async () => {
      useParams.mockReturnValue({ id: 'test-id' });
      
      useDebounce.mockReturnValue([null]);

      renderEditor();

      await waitFor(() => {
        expect(axiosInstance.post).not.toHaveBeenCalled();
        expect(axiosInstance.put).not.toHaveBeenCalled();
      });
    });
  });

  describe('Prop Variations', () => {
    test('works with different title prop', () => {
      useParams.mockReturnValue({ id: 'new' });
      
      renderEditor({ title: 'Custom Title' });
      
      expect(screen.getByText('Toolbar - Title: Custom Title, SheetId:')).toBeInTheDocument();
    });

    test('works with different initialValue prop', () => {
      useParams.mockReturnValue({ id: 'new' });
      const customInitialValue = [{ type: 'heading', children: [{ text: 'Custom Heading' }] }];
      
      renderEditor({ initialValue: customInitialValue });
      
      const slateEditor = screen.getByTestId('slate-editor');
      expect(slateEditor).toHaveAttribute(
        'data-initial-value',
        JSON.stringify(customInitialValue)
      );
    });

    test('works with multiple children', () => {
      useParams.mockReturnValue({ id: 'new' });
      
      renderEditor({
        children: [
          <div key="1" data-testid="child-1">Child 1</div>,
          <div key="2" data-testid="child-2">Child 2</div>,
        ]
      });
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Static Properties', () => {
    test('has Input static property', () => {
      expect(Editor.Input).toBeDefined();
    });

    test('has Toolbar static property', () => {
      expect(Editor.Toolbar).toBeDefined();
    });
  });
});

describe('Standalone Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
      },
      writable: true,
    });
  });

  describe('createSheet function', () => {
    test('creates sheet with correct payload and headers', async () => {
      window.sessionStorage.getItem.mockReturnValue('test-access-token');
      axiosInstance.post.mockResolvedValue({ data: { sheet_id: '123' } });

      const payload = { title: 'Test', content: [] };
      const result = await createSheet(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/sheets',
        payload,
        {
          headers: {
            Authorization: 'Bearer test-access-token'
          }
        }
      );
      expect(result).toEqual({ sheet_id: '123' });
    });

    test('handles missing access token', async () => {
      window.sessionStorage.getItem.mockReturnValue(null);
      axiosInstance.post.mockResolvedValue({ data: { sheet_id: '123' } });

      const payload = { title: 'Test', content: [] };
      await createSheet(payload);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/sheets',
        payload,
        {
          headers: {
            Authorization: 'Bearer null'
          }
        }
      );
    });
  });

  describe('updateSheet function', () => {
    test('updates sheet with correct parameters', async () => {
      window.sessionStorage.getItem.mockReturnValue('test-token');
      axiosInstance.put.mockResolvedValue({ data: { success: true } });

      const payload = { title: 'Updated', content: [] };
      const result = await updateSheet('456', payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/api/v1/sheets/456',
        payload,
        {
          headers: {
            Authorization: 'Bearer test-token'
          }
        }
      );
      expect(result).toEqual({ success: true });
    });

    test('works with different sheet IDs', async () => {
      window.sessionStorage.getItem.mockReturnValue('token');
      axiosInstance.put.mockResolvedValue({ data: {} });

      const payload = { title: 'Test' };
      await updateSheet('different-id', payload);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/api/v1/sheets/different-id',
        payload,
        expect.any(Object)
      );
    });
  });
});