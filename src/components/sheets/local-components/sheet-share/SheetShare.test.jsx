import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

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
  });

  it('should handle undefined URL input', () => {   
    const url = undefined;
    
    const result = extractTextIdFromUrl(url);
    expect(result).toBe(null);
    
    expect(console.error).toHaveBeenCalled();
  });
});