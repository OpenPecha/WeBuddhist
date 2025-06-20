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
      const node = { text: 'formatted text', bold: true, italic: true, underline: true };
      expect(serialize(node)).toBe('<strong><em><u>formatted text</u></em></strong>');
    });

    it('should apply inline styles', () => {
      const node = { 
        text: 'styled text', 
        color: 'red',
        backgroundColor: 'blue',
        textAlign: 'center'
      };
      const result = serialize(node);
      expect(result).toContain('style="color:red;"');
      expect(result).toContain('style="backgroundColor:blue;"');
      expect(result).toContain('style="textAlign:center;"');
      expect(result).toContain('>styled text<');
    });
  });

  describe('element nodes', () => {
    it('should handle paragraphs with alignment', () => {
      const node = {
        type: 'paragraph',
        align: 'center',
        children: [{ text: 'Centered text' }]
      };
      expect(serialize(node)).toBe('<p style="text-align: center">Centered text</p>');
    });

    it('should handle headings of all levels', () => {
      const h1 = { type: 'heading-one', children: [{ text: 'H1' }] };
      const h2 = { type: 'heading-two', children: [{ text: 'H2' }] };
      const h3 = { type: 'heading-three', children: [{ text: 'H3' }] };
      
      expect(serialize(h1)).toBe('<h1>H1</h1>');
      expect(serialize(h2)).toBe('<h2>H2</h2>');
      expect(serialize(h3)).toBe('<h3>H3</h3>');
    });

    it('should handle links with and without refs', () => {
      const basicLink = {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'Example' }]
      };
      const refLink = {
        type: 'link',
        url: 'https://example.com',
        ref: 'ref1',
        children: [{ text: 'Reference' }]
      };
      
      expect(serialize(basicLink)).toBe('<a href="https://example.com">Example</a>');
      expect(serialize(refLink)).toContain('class="refLink"');
      expect(serialize(refLink)).toContain('data-ref="ref1"');
    });

    it('should handle images with alt text', () => {
      const node = {
        type: 'image',
        url: 'image.jpg',
        alt: 'An image'
      };
      expect(serialize(node)).toBe('<img src="image.jpg" alt="An image" />');
    });

    it('should handle ordered and unordered lists', () => {
      const ulNode = {
        type: 'unordered-list',
        children: [
          { type: 'list-item', children: [{ text: 'Item 1' }] },
          { type: 'list-item', children: [{ text: 'Item 2' }] }
        ]
      };
      const olNode = {
        type: 'ordered-list',
        children: [
          { type: 'list-item', children: [{ text: 'First' }] },
          { type: 'list-item', children: [{ text: 'Second' }] }
        ]
      };
      
      expect(serialize(ulNode)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
      expect(serialize(olNode)).toBe('<ol><li>First</li><li>Second</li></ol>');
    });

    it('should handle tables', () => {
      const tableNode = {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'A1' }] },
              { type: 'table-cell', children: [{ text: 'B1' }] }
            ]
          },
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'A2' }] },
              { type: 'table-cell', children: [{ text: 'B2' }] }
            ]
          }
        ]
      };
      
      const result = serialize(tableNode);
      expect(result).toContain('<table>');
      expect(result).toContain('</table>');
      expect(result).toContain('<tr>');
      expect(result).toContain('<td>');
      expect(result).toContain('A1');
      expect(result).toContain('B2');
    });

    it('should handle horizontal lines', () => {
      const node = { type: 'horizontal-line' };
      expect(serialize(node)).toBe('<hr>');
    });

    it('should handle pecha content', () => {
      const node = {
        type: 'pecha',
        segmentId: 'seg123',
        children: [{ text: 'Pecha content' }]
      };
      expect(serialize(node)).toContain('class="pecha-content"');
      expect(serialize(node)).toContain('data-segment-id="seg123"');
    });
  });

  it('should handle nested structures', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'This is ' },
        { text: 'bold', bold: true },
        { text: ' and ' },
        { text: 'italic', italic: true },
        { text: ' text.' }
      ]
    };
    expect(serialize(node)).toBe('<p>This is <strong>bold</strong> and <em>italic</em> text.</p>');
  });
});

describe('convertToHtml', () => {
  it('should handle empty content', () => {
    expect(convertToHtml([])).toBe('');
    expect(convertToHtml(null)).toBe('');
    expect(convertToHtml(undefined)).toBe('');
  });

  it('should convert multiple nodes to HTML', () => {
    const content = [
      { type: 'heading-one', children: [{ text: 'Title' }] },
      { type: 'paragraph', children: [{ text: 'Content' }] }
    ];
    const result = convertToHtml(content);
    expect(result).toBe('<h1>Title</h1><p>Content</p>');
  });
});

describe('preparePayload', () => {
  it('should prepare payload with default values', () => {
    const content = [{ type: 'paragraph', children: [{ text: 'Test' }] }];
    const result = preparePayload(content);
    
    expect(result).toMatchObject({
      content: [{
        html: expect.any(String),
        type: 'html',
        node: { $numberInt: '1' }
      }],
      metadata: {
        title: 'Untitled',
        isPublic: false,
        language: 'bo',
        createdAt: expect.any(String)
      }
    });
  });

  it('should include provided metadata', () => {
    const content = [{ type: 'paragraph', children: [{ text: 'Test' }] }];
    const metadata = {
      title: 'Custom Title',
      isPublic: true,
      language: 'en'
    };
    const result = preparePayload(content, metadata);
    
    expect(result.metadata).toMatchObject({
      title: 'Custom Title',
      isPublic: true,
      language: 'en'
    });
  });
});

describe('getCurrentContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn();
  });

  it('should return null when no content in localStorage', () => {
    Storage.prototype.getItem.mockReturnValue(null);
    expect(getCurrentContent()).toBeNull();
  });

  it('should return null for invalid JSON', () => {
    Storage.prototype.getItem.mockReturnValue('invalid-json');
    expect(getCurrentContent()).toBeNull();
  });

  it('should parse and return content from localStorage', () => {
    const testContent = [{ type: 'paragraph', children: [{ text: 'Test' }] }];
    Storage.prototype.getItem.mockReturnValue(JSON.stringify(testContent));
    expect(getCurrentContent()).toEqual(testContent);
  });
});
