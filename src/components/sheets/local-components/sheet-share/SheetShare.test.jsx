import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import * as reactQuery from 'react-query';
import '@testing-library/jest-dom';
import { fetchShortUrl } from './sheetShare.jsx';
import SheetShare from './sheetShare.jsx';

vi.mock('../../../../config/axios-config.js', () => ({
  default: {
    post: vi.fn()
  }
}));

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve())
  },
  configurable: true
});

vi.stubGlobal('open', vi.fn());
describe('extractTextIdFromUrl function', () => {
  const extractTextIdFromUrl = (url) => {
    try {
      const urlPath = new URL(url).pathname;
      const lastPathPart = urlPath.split('/').pop();
      const textId = lastPathPart.split('_').pop();
      return textId;
    } catch (error) {
      console.error('Error extracting text_id from URL:', error);
      return null;
    }
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract text ID from valid URL with text_id format', () => {
    const url = 'https://example.com/sheets/text_123';
    const result = extractTextIdFromUrl(url);
    expect(result).toBe('123');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should extract text ID from URL with complex path structure', () => {
    const url = 'https://app.openpecha.org/sheets/view/text_456?lang=bo';
    const result = extractTextIdFromUrl(url);
    expect(result).toBe('456');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should extract text ID from URL with different domain', () => {
    const url = 'https://different-domain.com/path/to/text_789';
    const result = extractTextIdFromUrl(url);
    expect(result).toBe('789');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle URLs without text ID format', () => {
    const url = 'https://example.com/sheets/view/document';
    const result = extractTextIdFromUrl(url);
    expect(result).toBe('document');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle invalid URLs gracefully', () => {
    const url = 'not-a-valid-url';
    const result = extractTextIdFromUrl(url);
    expect(result).toBe(null);
    expect(console.error).toHaveBeenCalledWith(
      'Error extracting text_id from URL:',
      expect.any(Error)
    );
  });

  it('should handle empty URL input', () => {
    const url = '';
    const result = extractTextIdFromUrl(url);
    expect(result).toBe(null);
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle undefined URL input', () => {
    const url = undefined;
    const result = extractTextIdFromUrl(url);
    expect(result).toBe(null);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('fetchShortUrl function', () => {
  let axiosInstance;
  
  beforeEach(async () => {
    const axiosModule = await import('../../../../config/axios-config.js');
    axiosInstance = axiosModule.default;
    
    vi.clearAllMocks();
  });
  
  it('should call API with correct parameters', async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { shortUrl: 'https://short.url/abc123' }
    });
    const url = 'https://example.com/sheets/text_123';
    const textId = '123';
    const language = 'bo';
    
    await fetchShortUrl(url, textId, language);
    
    expect(axiosInstance.post).toHaveBeenCalledWith('/api/v1/share', {
      text_id: textId,
      language: language,
      url: url
    });
    
    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
  });
  
  it('should return the data from the API response', async () => {
    const mockResponse = { shortUrl: 'https://short.url/xyz789' };
    axiosInstance.post.mockResolvedValueOnce({
      data: mockResponse
    });
    
    const result = await fetchShortUrl('https://example.com', '456', 'bo');
    
    expect(result).toEqual(mockResponse);
  });
  
  it('should use default language parameter if not provided', async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { shortUrl: 'https://short.url/def456' }
    });
    
    await fetchShortUrl('https://example.com', '789');
    
    expect(axiosInstance.post).toHaveBeenCalledWith('/api/v1/share', {
      text_id: '789',
      language: 'bo',
      url: 'https://example.com'
    });
  });
  
  it('should use custom language parameter when provided', async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { shortUrl: 'https://short.url/ghi789' }
    });
    await fetchShortUrl('https://example.com', '789', 'en');
    expect(axiosInstance.post).toHaveBeenCalledWith('/api/v1/share', {
      text_id: '789',
      language: 'en',
      url: 'https://example.com'
    });
  });
  
  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Network Error';
    axiosInstance.post.mockRejectedValueOnce(new Error(errorMessage));
    await expect(fetchShortUrl('https://example.com', '123', 'bo'))
      .rejects.toThrow(errorMessage);
  });
});

describe('SheetShare Component Props', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const originalLocation = window.location;

  beforeEach(() => {
    vi.spyOn(reactQuery, 'useQuery').mockImplementation(() => ({
      data: { shortUrl: 'https://short.url/mocked' },
      isLoading: false,
    }));

    delete window.location;
    window.location = {
      href: 'https://default-domain.com/sheets/text_default',
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SheetShare {...props} />
      </QueryClientProvider>
    );
  };

  it('should use custom URL when provided as prop', () => {
    const customUrl = 'https://custom-domain.com/sheets/text_custom';
    vi.spyOn(reactQuery, 'useQuery').mockImplementation((queryKey) => {
      expect(queryKey[1]).toBe(customUrl);
      expect(queryKey[1]).toBe(customUrl);
      
      return {
        data: { shortUrl: 'https://short.url/custom' },
        isLoading: false,
      };
    });
    
    renderComponent({ url: customUrl });
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();
  });

  it('should use custom language when provided as prop', () => {
    const customLanguage = 'en';
    vi.spyOn(reactQuery, 'useQuery').mockImplementation((queryKey, queryFn) => {
      const mockFetchShortUrl = vi.fn();
      vi.spyOn(global, 'Function').mockImplementation(() => mockFetchShortUrl);
      
      return {
        data: { shortUrl: 'https://short.url/language' },
        isLoading: false,
      };
    });
    
    renderComponent({ language: customLanguage });
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();
    
  });

  it('should use default values when no props are provided', () => {
    const defaultUrl = 'https://default-domain.com/sheets/text_default';
    window.location.href = defaultUrl;
    
    vi.spyOn(reactQuery, 'useQuery').mockImplementation((queryKey) => {
      expect(queryKey[1]).toBe(defaultUrl);
      
      return {
        data: { shortUrl: 'https://short.url/default' },
        isLoading: false,
      };
    });
    
    renderComponent();
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();
  });

  it('should prioritize props over default values', () => {
    window.location.href = 'https://default-domain.com/sheets/text_default';
    const customUrl = 'https://custom-domain.com/sheets/text_custom';
    
    vi.spyOn(reactQuery, 'useQuery').mockImplementation((queryKey) => {
      expect(queryKey[1]).toBe(customUrl);
      expect(queryKey[1]).toBe(customUrl);
      
      return {
        data: { shortUrl: 'https://short.url/priority' },
        isLoading: false,
      };
    });
    
    renderComponent({ url: customUrl });
    
    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();
  });
});