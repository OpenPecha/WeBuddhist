import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serialize, convertToHtml, preparePayload, getCurrentContent } from './serialize';

describe('serialize', () => {
  describe('text nodes', () => {
    it('should handle plain text', () => {
      const node = { text: 'Hello World' };
      expect(serialize(node)).toBe('Hello World');
    });

    it('should handle newlines in text', () => {
      const node = { text: 'Hello\nWorld' };
      expect(serialize(node)).toBe('Hello<br>World');
    });

    it('should apply text formatting', () => {
      const node = { text: 'bold and italic', bold: true, italic: true };
      expect(serialize(node)).toBe('<em><strong>bold and italic</strong></em>');
    });

    it('should apply inline styles', () => {
      const node = { 
        text: 'colored text', 
        color: 'red',
        backgroundColor: 'blue'
      };
      expect(serialize(node)).toBe('<span style="color: red; background-color: blue">colored text</span>');
    });
  });

  describe('element nodes', () => {
    it('should handle paragraphs', () => {
      const node = {
        type: 'paragraph',
        children: [{ text: 'Hello World' }]
      };
      expect(serialize(node)).toBe('<p>Hello World</p>');
    });

    it('should handle headings', () => {
      const node = {
        type: 'heading-one',
        children: [{ text: 'Main Title' }]
      };
      expect(serialize(node)).toBe('<h1>Main Title</h1>');
    });

    it('should handle links', () => {
      const node = {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'Example' }]
      };
      expect(serialize(node)).toBe('<a href="https://example.com">Example</a>');
    });

    it('should handle images', () => {
      const node = {
        type: 'image',
        url: 'image.jpg',
        alt: 'An image'
      };
      expect(serialize(node)).toBe('<img src="image.jpg" alt="An image" />');
    });

    it('should handle lists', () => {
      const node = {
        type: 'unordered-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'Item 1' }]
          },
          {
            type: 'list-item',
            children: [{ text: 'Item 2' }]
          }
        ]
      };
      expect(serialize(node)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });
  });
});

describe('convertToHtml', () => {
  it('should convert Slate content to HTML', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ text: 'Hello World' }]
      }
    ];
    const result = convertToHtml(content);
    expect(result).toBe('<p>Hello World</p>');
  });
});

describe('preparePayload', () => {
  it('should prepare payload with content and metadata', () => {
    const content = [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }]
      }
    ];
    const metadata = { title: 'Test Title' };
    const result = preparePayload(content, metadata);
    
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('title', 'Test Title');
    expect(result.content).toContain('Test content');
  });
});

describe('getCurrentContent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
  });

  it('should return empty array when no content in localStorage', () => {
    Storage.prototype.getItem.mockReturnValue(null);
    expect(getCurrentContent()).toEqual([]);
  });

  it('should parse and return content from localStorage', () => {
    const testContent = [{ type: 'paragraph', children: [{ text: 'Test' }] }];
    Storage.prototype.getItem.mockReturnValue(JSON.stringify(testContent));
    expect(getCurrentContent()).toEqual(testContent);
  });
});
