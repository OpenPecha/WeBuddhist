import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import IndividualTextSearch, { fetchTextSearchResults } from './IndividualTextSearch';
import axiosInstance from '../../../../../../config/axios-config';

vi.mock('use-debounce', () => ({
  useDebounce: vi.fn((value) => [value, vi.fn()])
}));

vi.mock('../../../../../../context/PanelContext', () => ({
  usePanelContext: vi.fn(() => ({
    closeResourcesPanel: vi.fn(),
    openResourcesPanel: vi.fn(),
    isResourcesPanelOpen: true,
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@tolgee/react', () => ({
  useTranslate: vi.fn(() => ({
    t: vi.fn((key, fallback) => fallback || key)
  })),
}));

vi.mock('react-query', () => ({
  useQuery: vi.fn(),
}));

vi.mock('../../../../../../config/axios-config', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

describe('fetchTextSearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call axios with correct parameters', async () => {
    const mockQuery = 'test query';
    const mockTextId = 'text123';
    const mockSkip = 10;
    const mockPagination = { limit: 10 };
    const mockResponse = { data: { search: { text: mockQuery }, sources: [] } };
    
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await fetchTextSearchResults(mockQuery, mockTextId, mockSkip, mockPagination);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `api/v1/search?query=${mockQuery}&search_type=SOURCE&text_id=${mockTextId}`,
      {
        params: {
          limit: mockPagination.limit,
          skip: mockSkip
        }
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle API errors correctly', async () => {
    const mockError = new Error('API Error');
    axiosInstance.get.mockRejectedValueOnce(mockError);

    await expect(
      fetchTextSearchResults('query', 'textId', 0, { limit: 10 })
    ).rejects.toThrow('API Error');
  });

  it('should handle empty parameters gracefully', async () => {
    const mockResponse = { data: { search: { text: '' }, sources: [] } };
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await fetchTextSearchResults('', '', 0, { limit: 10 });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `api/v1/search?query=&search_type=SOURCE&text_id=`,
      {
        params: {
          limit: 10,
          skip: 0
        }
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('should process the expected API response format correctly', async () => {
    const mockQuery = 'buddha';
    const mockTextId = 'text123';
    const mockSegmentMatches = [
      { 
        segment_id: 'seg1', 
        content: 'This is about the <em>buddha</em> dharma.'
      },
      { 
        segment_id: 'seg2', 
        content: 'The <em>buddha</em> taught compassion.'
      }
    ];
    
    const mockResponse = { 
      data: { 
        search: { 
          text: mockQuery 
        }, 
        sources: [
          {
            text: {
              id: mockTextId,
              title: 'Buddhist Text',
              language: 'en'
            },
            segment_match: mockSegmentMatches
          }
        ] 
      } 
    };
    
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await fetchTextSearchResults(mockQuery, mockTextId, 0, { limit: 10 });

    expect(result).toEqual(mockResponse.data);
    expect(result.search.text).toBe(mockQuery);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].segment_match).toEqual(mockSegmentMatches);
    expect(result.sources[0].text.id).toBe(mockTextId);
  });

  it('should handle pagination with more than 10 results', async () => {
    const mockQuery = 'dharma';
    const mockTextId = 'text123';
    
    const mockSegmentMatches = Array.from({ length: 11 }, (_, i) => ({
      segment_id: `seg${i + 1}`,
      content: `Content ${i + 1} with <em>dharma</em> reference.`
    }));
    
    const mockResponse = { 
      data: { 
        search: { 
          text: mockQuery 
        }, 
        sources: [
          {
            text: {
              id: mockTextId,
              title: 'Buddhist Text',
              language: 'en'
            },
            segment_match: mockSegmentMatches
          }
        ] 
      } 
    };
    
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const pagination = { limit: 10 };
    const skip = 0;
    const result = await fetchTextSearchResults(mockQuery, mockTextId, skip, pagination);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `api/v1/search?query=${mockQuery}&search_type=SOURCE&text_id=${mockTextId}`,
      {
        params: {
          limit: pagination.limit,
          skip: skip
        }
      }
    );
    expect(result.sources[0].segment_match.length).toBe(11);
    
    const totalSegments = result.sources[0].segment_match.length;
    const totalPages = Math.ceil(totalSegments / pagination.limit);
    expect(totalPages).toBe(2);
  });

  it('should handle case when no textId is provided in either props or URL search params', async () => {
    const mockQuery = 'test query';
    const mockSkip = 10;
    const mockPagination = { limit: 10 };
    const mockResponse = { data: { search: { text: mockQuery }, sources: [] } };
    
    axiosInstance.get.mockResolvedValueOnce(mockResponse);

    const result = await fetchTextSearchResults(mockQuery, undefined, mockSkip, mockPagination);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `api/v1/search?query=${mockQuery}&search_type=SOURCE&text_id=undefined`,
      {
        params: {
          limit: mockPagination.limit,
          skip: mockSkip
        }
      }
    );
    expect(result).toEqual(mockResponse.data);
  });
});

describe('IndividualTextSearch Component', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    useNavigate.mockReturnValue(mockNavigate);
    
    useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });
  });

  it('should use textId from URL search params when not provided as prop', () => {

    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123FromURL');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    render(<IndividualTextSearch onClose={vi.fn()} />);
    
    expect(useSearchParams).toHaveBeenCalled();
    
    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['textSearch', expect.anything(), 'text123FromURL']),
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('should prioritize textId prop over URL search params', () => {
    
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123FromURL');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    const propTextId = 'text123FromProp';
    
    render(<IndividualTextSearch onClose={vi.fn()} textId={propTextId} />);
    
    expect(useSearchParams).toHaveBeenCalled();
    
    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['textSearch', expect.anything(), propTextId]),
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('should handle case when no textId is provided in props or URL', () => {
    const mockSearchParams = new URLSearchParams();
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    render(<IndividualTextSearch onClose={vi.fn()} />);
    
    expect(useSearchParams).toHaveBeenCalled();
    
    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['textSearch', expect.anything(), null]),
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('should trigger search when form is submitted with valid query', () => {
    
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    const mockOnClose = vi.fn();
    const mockHandleSegmentNavigate = vi.fn();
    
    const { getByPlaceholderText } = render(
      <IndividualTextSearch 
        onClose={mockOnClose} 
        handleSegmentNavigate={mockHandleSegmentNavigate} 
      />
    );
    
    const searchInput = getByPlaceholderText('connection_panel.search_in_this_text');
    
    fireEvent.change(searchInput, { target: { value: 'buddha' } });
    
    fireEvent.submit(searchInput.closest('form'));
    
    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(['textSearch', 'buddha', 'text123']),
      expect.any(Function),
      expect.objectContaining({
        refetchOnWindowFocus: false,
        retry: 1
      })
    );
  });

  it('should not trigger search when form is submitted with empty query', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    const mockOnClose = vi.fn();
    
    const { getByPlaceholderText } = render(
      <IndividualTextSearch onClose={mockOnClose} />
    );
    
    const searchInput = getByPlaceholderText('connection_panel.search_in_this_text');
    
    fireEvent.submit(searchInput.closest('form'));
    
    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.objectContaining({
        enabled: false
      })
    );
  });

  it('should reset pagination to page 1 when submitting a new search', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    let capturedQueryKeys = [];
    
    useQuery.mockImplementation((queryKey, queryFn, options) => {
      capturedQueryKeys.push(queryKey);
      
      return {
        data: {
          search: { text: queryKey[1] || '' },
          sources: [{
            text: { id: queryKey[2], language: 'en', title: 'Test Text' },
            segment_match: Array(11).fill().map((_, i) => ({
              segment_id: `seg${i}`,
              content: `Content with <em>${queryKey[1] || ''}</em>`
            }))
          }]
        },
        isLoading: false,
        error: null
      };
    });
    
    const { getByPlaceholderText } = render(
      <IndividualTextSearch onClose={vi.fn()} />
    );
    
    const searchInput = getByPlaceholderText('connection_panel.search_in_this_text');
    
    fireEvent.change(searchInput, { target: { value: 'buddha' } });
    fireEvent.submit(searchInput.closest('form'));
    
    const firstSearchPagination = capturedQueryKeys[capturedQueryKeys.length - 1][4];
    expect(firstSearchPagination).toEqual(expect.objectContaining({ currentPage: 1 }));
    
    fireEvent.change(searchInput, { target: { value: 'dharma' } });
    fireEvent.submit(searchInput.closest('form'));
    
    const secondSearchPagination = capturedQueryKeys[capturedQueryKeys.length - 1][4];
    expect(secondSearchPagination).toEqual(expect.objectContaining({ currentPage: 1 }));
  });

  it('should update search input field correctly when typing', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    const { getByPlaceholderText } = render(
      <IndividualTextSearch onClose={vi.fn()} />
    );
    
    const searchInput = getByPlaceholderText('connection_panel.search_in_this_text');
    
    expect(searchInput.value).toBe('');
    
    fireEvent.change(searchInput, { target: { value: 'b' } });
    expect(searchInput.value).toBe('b');
    
    fireEvent.change(searchInput, { target: { value: 'bu' } });
    expect(searchInput.value).toBe('bu');
    
    fireEvent.change(searchInput, { target: { value: 'buddha' } });
    expect(searchInput.value).toBe('buddha');
    
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput.value).toBe('');
  });

  it('should autofocus the search input field on component mount', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('text_id', 'text123');
    useSearchParams.mockReturnValue([mockSearchParams, vi.fn()]);
    
    const { getByPlaceholderText } = render(
      <IndividualTextSearch onClose={vi.fn()} />
    );
    
    const searchInput = getByPlaceholderText('connection_panel.search_in_this_text');
    
    expect(searchInput).toBeInTheDocument();
    expect(searchInput.tagName.toLowerCase()).toBe('input');
    expect(searchInput.type).toBe('text');
    
    expect(searchInput).toHaveAttribute('placeholder', 'connection_panel.search_in_this_text');
    
    expect(searchInput).toHaveClass('search-input');
  });
});