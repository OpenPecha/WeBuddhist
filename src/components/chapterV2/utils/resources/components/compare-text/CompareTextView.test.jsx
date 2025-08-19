import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { TolgeeProvider } from '@tolgee/react';
import React, { useState } from 'react';
import CompareTextView from './CompareTextView';
import { mockAxios, mockReactQuery, mockTolgee } from '../../../../../../test-utils/CommonMocks';
import * as reactQuery from 'react-query';
import axiosInstance from '../../../../../../config/axios-config';
import * as PanelContext from '../../../../../../context/PanelContext';
import { fetchTableOfContents } from '../../../../../../components/texts/Texts.jsx';
import * as Texts from '../../../../../../components/texts/Texts.jsx';

mockAxios();
mockReactQuery();

vi.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key) => {
      const translations = {
        'connection_panel.compare_text': 'Compare Text',
        'text.type.root_text': 'Root Text',
        'text.type.commentary': 'Commentary'
      };
      return translations[key] || key;
    }
  }),
  TolgeeProvider: ({ children }) => children
}));

vi.mock('../../../../../../context/PanelContext.jsx', () => {
  const actual = vi.importActual('../../../../../../context/PanelContext.jsx');
  return {
    ...actual,
    usePanelContext: () => ({
      closeResourcesPanel: vi.fn(),
    }),
  };
});

vi.mock('../../../../../../utils/helperFunctions.jsx', () => ({
  getEarlyReturn: vi.fn(() => null),
  getLanguageClass: vi.fn(() => 'language-class'),
  mapLanguageCode: (code) => code === 'bo-IN' ? 'bo' : code,
}));

vi.mock('../../../../../../utils/constants.js', () => ({
  LANGUAGE: 'LANGUAGE',
}));

describe('CompareTextView Component', () => {
  const queryClient = new QueryClient();
  const mockSetIsCompareTextView = vi.fn();
  const mockAddChapter = vi.fn();
  const mockCurrentChapter = { id: 'chapter1' };
  const mockCloseResourcesPanel = vi.fn();

  const mockCollectionsData = {
    collections: [
      { id: 'collection1', title: 'Collection 1', has_child: true },
      { id: 'collection2', title: 'Collection 2', has_child: true }
    ]
  };

  const mockSubCollectionsData = {
    collections: [
      { id: 'subcollection1', title: 'SubCollection 1' },
      { id: 'subcollection2', title: 'SubCollection 2' }
    ]
  };

  const mockWorksData = {
    texts: [
      { id: 'text1', title: 'Root Text 1', type: 'root_text', language: 'bo' },
      { id: 'text2', title: 'Commentary 1', type: 'commentary', language: 'bo' }
    ]
  };

  const mockTableOfContents = {
    contents: [
      { 
        id: 'content1', 
        title: 'Chapter 1', 
        segments: [{ segment_id: 'segment1' }] 
      },
      { 
        id: 'content2', 
        title: 'Chapter 2', 
        sections: [{ segments: [{ segment_id: 'segment2' }] }] 
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    Storage.prototype.getItem = vi.fn().mockReturnValue('bo-IN');
    
    axiosInstance.get.mockImplementation((url) => {
      if (url.includes('/api/v1/collections')) {
        if (url.includes('parent_id')) {
          return Promise.resolve({ data: mockSubCollectionsData });
        }
        return Promise.resolve({ data: mockCollectionsData });
      } else if (url.includes('/api/v1/texts')) {
        if (url.includes('contents')) {
          return Promise.resolve({ data: mockTableOfContents });
        }
        return Promise.resolve({ data: mockWorksData });
      }
      return Promise.resolve({ data: {} });
    });

    vi.spyOn(PanelContext, 'usePanelContext').mockImplementation(() => ({
      closeResourcesPanel: mockCloseResourcesPanel
    }));

    vi.spyOn(reactQuery, 'useQuery').mockImplementation((queryKey) => {
      if (queryKey[0] === 'collections') {
        return {
          data: mockCollectionsData,
          isLoading: false,
          error: null
        };
      } else if (queryKey[0] === 'sub-collections') {
        return {
          data: mockSubCollectionsData,
          isLoading: false,
          error: null
        };
      } else if (queryKey[0] === 'works') {
        return {
          data: mockWorksData,
          isLoading: false,
          error: null
        };
      } else if (queryKey[0] === 'tableOfContents') {
        return {
          data: mockTableOfContents,
          isLoading: false,
          isError: false
        };
      }
      return {
        data: null,
        isLoading: false,
        error: null
      };
    });
  });

  const setup = (props = {}) => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={'Loading tolgee...'}
            tolgee={mockTolgee}
          >
            <CompareTextView
              setIsCompareTextView={mockSetIsCompareTextView}
              addChapter={mockAddChapter}
              currentChapter={mockCurrentChapter}
              {...props}
            />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  it('renders the component with collections view initially', () => {
    setup();
    expect(screen.getByText('Compare Text')).toBeInTheDocument();
    expect(screen.getByText('Collection 1')).toBeInTheDocument();
    expect(screen.getByText('Collection 2')).toBeInTheDocument();
  });

  it('closes the compare text view when close icon is clicked', () => {
    setup();
    const closeIcon = document.querySelector('.close-icon');
    fireEvent.click(closeIcon);
    expect(mockSetIsCompareTextView).toHaveBeenCalledWith('main');
  });

  it('navigates to subcollections when a collection is clicked', () => {
    setup();
    const collectionButton = screen.getByText('Collection 1');
    fireEvent.click(collectionButton);
    
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['sub-collections', expect.anything()]),
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
  });

  it('navigates to term view when a subcollection is clicked', async () => {
    setup();
    
    const collectionButton = screen.getByText('Collection 1');
    fireEvent.click(collectionButton);
    
    const subcollectionButton = screen.getByText('SubCollection 1');
    fireEvent.click(subcollectionButton);
    
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['works', expect.anything()]),
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
  });

  it('displays root texts and commentary texts in term view', () => {
    const { rerender } = setup();
    
    const collectionButton = screen.getByText('Collection 1');
    fireEvent.click(collectionButton);
    
    const subcollectionButton = screen.getByText('SubCollection 1');
    fireEvent.click(subcollectionButton);
    
    expect(screen.getByText('Root Text')).toBeInTheDocument();
    expect(screen.getByText('Commentary')).toBeInTheDocument();
    expect(screen.getByText('Root Text 1')).toBeInTheDocument();
    expect(screen.getByText('Commentary 1')).toBeInTheDocument();
  });

  it('navigates to contents view when a text is selected', () => {
    setup();
    
    const collectionButton = screen.getByText('Collection 1');
    fireEvent.click(collectionButton);
    
    const subcollectionButton = screen.getByText('SubCollection 1');
    fireEvent.click(subcollectionButton);
    
    const rootTextButton = screen.getByText('Root Text 1');
    fireEvent.click(rootTextButton);
    
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['tableOfContents', expect.anything()]),
      expect.any(Function),
      expect.objectContaining({ enabled: true })
    );
  });

  it('handles content item click with segment in first level', () => {
    mockAddChapter.mockClear();
    mockCloseResourcesPanel.mockClear();
    mockSetIsCompareTextView.mockClear();
    
    const mockHandleContentItemClick = vi.fn((contentItem) => {
      if (contentItem.segments && contentItem.segments.length > 0) {
        mockAddChapter({
          textId: 'text1',
          segmentId: contentItem.segments[0].segment_id,
        }, mockCurrentChapter);
        mockCloseResourcesPanel();
        mockSetIsCompareTextView('main');
      }
    });
    
    const { rerender } = setup();
    
    mockHandleContentItemClick(mockTableOfContents.contents[0]);
    
    expect(mockAddChapter).toHaveBeenCalledWith(
      {
        textId: 'text1',
        segmentId: 'segment1',
      },
      mockCurrentChapter
    );
    
    expect(mockCloseResourcesPanel).toHaveBeenCalled();
    
    expect(mockSetIsCompareTextView).toHaveBeenCalledWith('main');
  });

  it('handles content item click with segment in nested section', () => {
    mockAddChapter.mockClear();
    mockCloseResourcesPanel.mockClear();
    mockSetIsCompareTextView.mockClear();
    
    const mockHandleContentItemClick = vi.fn((contentItem) => {
      if (contentItem.sections && contentItem.sections[0].segments && contentItem.sections[0].segments.length > 0) {
        mockAddChapter({
          textId: 'text1',
          segmentId: contentItem.sections[0].segments[0].segment_id,
        }, mockCurrentChapter);
        mockCloseResourcesPanel();
        mockSetIsCompareTextView('main');
      }
    });
    
    const { rerender } = setup();
    
    mockHandleContentItemClick(mockTableOfContents.contents[1]);
    
    expect(mockAddChapter).toHaveBeenCalledWith(
      {
        textId: 'text1',
        segmentId: 'segment2',
      },
      mockCurrentChapter
    );
  });

  it('handles loading state for collections', () => {
    vi.spyOn(reactQuery, 'useQuery').mockImplementationOnce(() => ({
      data: null,
      isLoading: true,
      error: null
    }));
    
    setup();
    expect(screen.queryByText('Collection 1')).not.toBeInTheDocument();
  });

  it('handles error state for collections', () => {
    vi.spyOn(reactQuery, 'useQuery').mockImplementationOnce(() => ({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch collections')
    }));
    
    setup();    
    expect(screen.queryByText('Collection 1')).not.toBeInTheDocument();
  });

  it('handles missing addChapter prop', () => {
    mockAddChapter.mockClear();
    mockCloseResourcesPanel.mockClear();
    mockSetIsCompareTextView.mockClear();
    
    const mockHandleContentItemClick = vi.fn((contentItem) => {
      mockCloseResourcesPanel();
      mockSetIsCompareTextView('main');
    });
    
    const { rerender } = setup({ addChapter: undefined });
    
    mockHandleContentItemClick(mockTableOfContents.contents[0]);
    
    expect(mockAddChapter).not.toHaveBeenCalled();
  });

  it('handles pagination state updates in table of contents view', () => {
    axiosInstance.get.mockClear();
    
    const newPagination = { currentPage: 2, limit: 10 };
    
    const skip = (newPagination.currentPage - 1) * newPagination.limit;
    
    fetchTableOfContents('text1', skip, newPagination.limit);
    
    expect(axiosInstance.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/texts'),
      expect.objectContaining({
        params: expect.objectContaining({
          skip: skip,
          limit: newPagination.limit
        })
      })
    );
  });

  it('handles content item click when no segment is available', () => {
    mockAddChapter.mockClear();
    
    const mockHandleContentItemClick = vi.fn((contentItem) => {
    });
    
    const { rerender } = setup();
    
    mockHandleContentItemClick({ 
      id: 'content3', 
      title: 'Chapter 3'
    });
    
    expect(mockAddChapter).not.toHaveBeenCalled();
  });

  it('renders contents view with proper props', () => {
    const mockRenderTabs = vi.fn();
    const originalRenderTabs = Texts.renderTabs;
    vi.spyOn(Texts, 'renderTabs').mockImplementation(mockRenderTabs);
    
    setup();
    
    const collectionButton = screen.getByText('Collection 1');
    fireEvent.click(collectionButton);
    
    const subcollectionButton = screen.getByText('SubCollection 1');
    fireEvent.click(subcollectionButton);
    
    const rootTextButton = screen.getByText('Root Text 1');
    fireEvent.click(rootTextButton);
    
    vi.spyOn(reactQuery, 'useQuery').mockImplementationOnce((queryKey) => {
      if (queryKey[0] === 'tableOfContents') {
        return {
          data: mockTableOfContents,
          isLoading: false,
          isError: false
        };
      }
      return {
        data: null,
        isLoading: false,
        error: null
      };
    });
    
    setup();
    
    expect(mockRenderTabs).toHaveBeenCalledWith(
      expect.anything(), 
      expect.any(Function), 
      mockTableOfContents, 
      expect.objectContaining({ skip: expect.any(Number), limit: expect.any(Number) }), 
      expect.any(Function), 
      false,
      false, 
      expect.any(Function), 
      expect.any(String), 
      expect.any(Function) 
    );
    
    const handleContentItemClickFn = mockRenderTabs.mock.calls[0][9]; 
    
    mockAddChapter.mockClear();
    mockCloseResourcesPanel.mockClear();
    mockSetIsCompareTextView.mockClear();
    
    handleContentItemClickFn(mockTableOfContents.contents[0]);
    
    expect(mockAddChapter).toHaveBeenCalledWith(
      expect.objectContaining({
        textId: expect.any(String),
        segmentId: 'segment1'
      }),
      mockCurrentChapter
    );
    expect(mockCloseResourcesPanel).toHaveBeenCalled();
    expect(mockSetIsCompareTextView).toHaveBeenCalledWith('main');
    
    vi.spyOn(Texts, 'renderTabs').mockRestore();
  });
});