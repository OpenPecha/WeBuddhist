import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TolgeeProvider } from '@tolgee/react';
import CompareText from './CompareText.js';

vi.mock('@tolgee/react', async () => {
  const actual = await vi.importActual('@tolgee/react');
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock('../../../collections/Collections', () => ({
  default: ({ setRendererInfo, showDescription }) => (
    <div data-testid="collections-component">
      <div>Collections View</div>
      <div>Show Description: {showDescription ? 'true' : 'false'}</div>
      <button onClick={() => {
        setRendererInfo(prev => ({
          ...prev,
          requiredId: 'collection-123',
          renderer: 'sub-collections'
        }));
      }}>
        Navigate to SubCollections
      </button>
    </div>
  )
}));

vi.mock('../../../sub-collections/SubCollections', () => ({
  default: ({ from, setRendererInfo, parent_id }) => (
    <div data-testid="sub-collections-component">
      <div>SubCollections View</div>
      <div>From: {from}</div>
      <div>Parent ID: {parent_id}</div>
      <button onClick={() => {
        setRendererInfo(prev => ({
          ...prev,
          requiredId: 'subcollection-456',
          renderer: 'works'
        }));
      }}>
        Navigate to Works
      </button>
      <button onClick={() => setRendererInfo(prev => ({ ...prev, renderer: 'collections' }))}>
        Back to Collections
      </button>
    </div>
  )
}));

vi.mock('../../../works/Works', () => ({
  default: ({ requiredInfo, setRendererInfo, collection_id }) => (
    <div data-testid="works-component">
      <div>Works View</div>
      <div>From: {requiredInfo.from}</div>
      <div>Collection ID: {collection_id}</div>
      <button onClick={() => {
        setRendererInfo(prev => ({
          ...prev,
          requiredId: 'work-789',
          renderer: 'texts'
        }));
      }}>
        Navigate to Texts
      </button>
      <button onClick={() => setRendererInfo(prev => ({ ...prev, renderer: 'sub-collections' }))}>
        Back to SubCollections
      </button>
    </div>
  )
}));

vi.mock('../../../texts/Texts', () => ({
  default: ({ requiredInfo, setRendererInfo, collection_id, addChapter, currentChapter }) => (
    <div data-testid="texts-component">
      <div>Texts View</div>
      <div>From: {requiredInfo.from}</div>
      <div>Collection ID: {collection_id}</div>
      <div>Has addChapter: {addChapter ? 'true' : 'false'}</div>
      <div>Current Chapter: {currentChapter || 'none'}</div>
      <button onClick={() => setRendererInfo(prev => ({ ...prev, renderer: 'works' }))}>
        Back to Works
      </button>
      {addChapter && (
        <button onClick={() => addChapter({ textId: 'test-text-id', segmentId: 'test-segment-id' }, currentChapter)}>
          Add Chapter
        </button>
      )}
    </div>
  )
}));

const mockTolgee = {
  isLoaded: () => true,
  getLanguage: () => 'en',
  changeLanguage: vi.fn(),
  t: (key) => key,
};

describe('CompareText Component', () => {
  let queryClient;
  let mockSetIsCompareTextView;
  let mockAddChapter;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    mockSetIsCompareTextView = vi.fn();
    mockAddChapter = vi.fn();
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      setIsCompareTextView: mockSetIsCompareTextView,
      addChapter: mockAddChapter,
      currentChapter: 1,
      ...props
    };

    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback="Loading..." tolgee={mockTolgee}>
            <CompareText {...defaultProps} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  describe('Component Rendering', () => {
    it('renders the component with header and close button', () => {
      renderComponent();
      
      expect(screen.getByText('connection_panel.compare_text')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders collections view by default', () => {
      renderComponent();
      
      expect(screen.getByTestId('collections-component')).toBeInTheDocument();
      expect(screen.getByText('Collections View')).toBeInTheDocument();
      expect(screen.getByText('Show Description: false')).toBeInTheDocument();
    });

    it('renders with correct container classes', () => {
      const { container } = renderComponent();
      
      expect(container.querySelector('.compare-text-container')).toBeInTheDocument();
      expect(container.querySelector('.compare-text-content')).toBeInTheDocument();
      expect(container.querySelector('.headerthing')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('calls setIsCompareTextView with "main" when close button is clicked', () => {
      const { container } = renderComponent();
      
      const closeButton = container.querySelector('.close-icon');
      fireEvent.click(closeButton);
      
      expect(mockSetIsCompareTextView).toHaveBeenCalledWith('main');
    });
  });

  describe('Navigation Flow', () => {
    it('navigates from collections to sub-collections', () => {
      renderComponent();
      
      expect(screen.getByTestId('collections-component')).toBeInTheDocument();
      
      const navButton = screen.getByText('Navigate to SubCollections');
      fireEvent.click(navButton);
      
      expect(screen.getByTestId('sub-collections-component')).toBeInTheDocument();
      expect(screen.getByText('SubCollections View')).toBeInTheDocument();
      expect(screen.getByText('Parent ID: collection-123')).toBeInTheDocument();
    });

    it('navigates from sub-collections to works', () => {
      renderComponent();
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      
      fireEvent.click(screen.getByText('Navigate to Works'));
      
      expect(screen.getByTestId('works-component')).toBeInTheDocument();
      expect(screen.getByText('Works View')).toBeInTheDocument();
      expect(screen.getByText('Collection ID: subcollection-456')).toBeInTheDocument();
    });

    it('navigates from works to texts', () => {
      renderComponent();
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      fireEvent.click(screen.getByText('Navigate to Works'));
      fireEvent.click(screen.getByText('Navigate to Texts'));
      
      expect(screen.getByTestId('texts-component')).toBeInTheDocument();
      expect(screen.getByText('Texts View')).toBeInTheDocument();
      expect(screen.getByText('Collection ID: work-789')).toBeInTheDocument();
    });

    it('supports backward navigation', () => {
      renderComponent();
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      fireEvent.click(screen.getByText('Navigate to Works'));
      
      fireEvent.click(screen.getByText('Back to SubCollections'));
      
      expect(screen.getByTestId('sub-collections-component')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Back to Collections'));
      
      expect(screen.getByTestId('collections-component')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('passes addChapter and currentChapter props to Texts component', () => {
      renderComponent({ currentChapter: 2 });
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      fireEvent.click(screen.getByText('Navigate to Works'));
      fireEvent.click(screen.getByText('Navigate to Texts'));
      
      expect(screen.getByText('Has addChapter: true')).toBeInTheDocument();
      expect(screen.getByText('Current Chapter: 2')).toBeInTheDocument();
    });

    it('handles missing addChapter prop gracefully', () => {
      renderComponent({ addChapter: undefined });
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      fireEvent.click(screen.getByText('Navigate to Works'));
      fireEvent.click(screen.getByText('Navigate to Texts'));
      
      expect(screen.getByText('Has addChapter: false')).toBeInTheDocument();
      expect(screen.queryByText('Add Chapter')).not.toBeInTheDocument();
    });

    it('handles missing currentChapter prop gracefully', () => {
      renderComponent({ currentChapter: undefined });
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      fireEvent.click(screen.getByText('Navigate to Works'));
      fireEvent.click(screen.getByText('Navigate to Texts'));
      
      expect(screen.getByText('Current Chapter: none')).toBeInTheDocument();
    });

    it('calls addChapter when button is clicked in texts view', () => {
      renderComponent();
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      fireEvent.click(screen.getByText('Navigate to Works'));
      fireEvent.click(screen.getByText('Navigate to Texts'));
      
      fireEvent.click(screen.getByText('Add Chapter'));
      
      expect(mockAddChapter).toHaveBeenCalledWith(
        { textId: 'test-text-id', segmentId: 'test-segment-id' },
        1
      );
    });
  });

  describe('Component Integration', () => {
    it('passes compare-text flag to downstream components', () => {
      renderComponent();
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      expect(screen.getByText('From: compare-text')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Navigate to Works'));
      expect(screen.getByText('From: compare-text')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Navigate to Texts'));
      expect(screen.getByText('From: compare-text')).toBeInTheDocument();
    });

    it('maintains state consistency during navigation', () => {
      renderComponent();
      
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      expect(screen.getByText('Parent ID: collection-123')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Navigate to Works'));
      expect(screen.getByText('Collection ID: subcollection-456')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Navigate to Texts'));
      expect(screen.getByText('Collection ID: work-789')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles renderer state that does not match any case', () => {
      const { container } = renderComponent();
      
      expect(container.querySelector('.compare-text-container')).toBeInTheDocument();
    });

    it('renders without optional props', () => {
      render(
        <Router>
          <QueryClientProvider client={queryClient}>
            <TolgeeProvider fallback="Loading..." tolgee={mockTolgee}>
              <CompareText setIsCompareTextView={mockSetIsCompareTextView} />
            </TolgeeProvider>
          </QueryClientProvider>
        </Router>
      );
      
      expect(screen.getByText('connection_panel.compare_text')).toBeInTheDocument();
      expect(screen.getByTestId('collections-component')).toBeInTheDocument();
    });
  });

    it('calls handleNavigate when back clicked on collections view', () => {
      const mockHandleNavigate = vi.fn();
      const { container } = renderComponent({ handleNavigate: mockHandleNavigate });
      const backBtn = container.querySelector('.back-icon');
      fireEvent.click(backBtn);
      expect(mockHandleNavigate).toHaveBeenCalledTimes(1);
    });

    it('returns to previous renderer when back clicked after navigating forward', () => {
      const mockHandleNavigate = vi.fn();
      const { container } = renderComponent({ handleNavigate: mockHandleNavigate });
      fireEvent.click(screen.getByText('Navigate to SubCollections'));
      expect(screen.getByTestId('sub-collections-component')).toBeInTheDocument();
      const backBtn = container.querySelector('.back-icon');
      fireEvent.click(backBtn);
      expect(screen.getByTestId('collections-component')).toBeInTheDocument();
      expect(mockHandleNavigate).not.toHaveBeenCalled();
    });
  });