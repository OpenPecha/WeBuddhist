const format_to_html_lookup = {
  bold: "strong",
  italic: "em",
  underline: "u",
  code: "code"
};

const special_styles_to_care_about = [
  "color",
  "fontWeight",
  "fontStyle",
  "textDecoration",
  "textAlign",
  "backgroundColor"
];

/**
 * Serializes Slate node to HTML string
 * @param {Object} node - Slate node to serialize
 * @returns {string} HTML string
 */
export const serialize = (node) => {
  if (node.text) {
    const { preTags, postTags } = Object.keys(node).reduce(
      (acc, key) => {
        if (node[key] === true && format_to_html_lookup[key]) {
          const tag = format_to_html_lookup[key];
          return {
            preTags: `${acc.preTags}<${tag}>`,
            postTags: `</${tag}>${acc.postTags}`
          };
        } else if (special_styles_to_care_about.includes(key)) {
          return {
            preTags: `${acc.preTags}<span style="${key}:${node[key]};">`,
            postTags: `</span>${acc.postTags}`
          };
        }
        return acc;
      },
      { preTags: "", postTags: "" }
    );

    return `${preTags}${node.text.replace(/(\n)+/g, '<br>')}${postTags}`;
  }

  if (!node.type) {
    return node.children ? node.children.map(serialize).join('') : '';
  }

  const children = node.children ? node.children.map(serialize).join('') : '';
  const style = [];

  if (node.align) {
    style.push(`text-align: ${node.align}`);
  }

  const styleAttr = style.length > 0 ? ` style="${style.join('; ')}"` : '';

  switch (node.type) {
    case 'paragraph':
      return `<p${styleAttr}>${children}</p>`;
    case 'heading-one':
      return `<h1${styleAttr}>${children}</h1>`;
    case 'heading-two':
      return `<h2${styleAttr}>${children}</h2>`;
    case 'heading-three':
      return `<h3${styleAttr}>${children}</h3>`;
    case 'block-quote':
      return `<blockquote${styleAttr}>${children}</blockquote>`;
    case 'code':
      return `<pre><code>${children}</code></pre>`;
    case 'link':
      return node.ref
        ? `<a href="${node.url}" class="refLink" data-ref="${node.ref}">${children}</a>`
        : `<a href="${node.url}">${children}</a>`;
    case 'image':
      return node.src || node.url || '';
    case 'youtube':
      return `https://www.youtube.com/embed/${node.youtubeId}?rel=0&showinfo=0`;
    case 'audio':
      return node.url || '';
    case 'ordered-list':
    case 'numbered-list':
      return `<ol${styleAttr}>${children}</ol>`;
    case 'unordered-list':
    case 'bulleted-list':
      return `<ul${styleAttr}>${children}</ul>`;
    case 'list-item':
      return `<li${styleAttr}>${children}</li>`;
    case 'pecha':
      return node.src || '';
    case 'table':
      return `<table><tbody>${children}</tbody></table>`;
    case 'table-row':
      return `<tr>${children}</tr>`;
    case 'table-cell':
      return `<td>${children}</td>`;
    case 'horizontal-line':
      return '<hr>';
    default:
      return `<div${styleAttr}>${children}</div>`;
  }
};

/**
 * Converts Slate content to HTML payload
 * @param {Array} content - Slate JSON content
 * @returns {string} HTML string
 */
export const convertToHtml = (content) => {
  if (!content || !Array.isArray(content)) {
    console.error('Invalid content format. Expected an array of nodes.');
    return '';
  }
  return content.map(node => serialize(node)).join('');
};

/**
 * Prepares content for API submission
 * @param {Array} content - Slate JSON content
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Formatted payload
 */
export const preparePayload = (content, metadata = {}) => ({
  content: [{
    html: convertToHtml(content),
    type: 'html',
    node: { $numberInt: '1' }
  }],
  metadata: {
    title: metadata.title || 'Untitled',
    isPublic: metadata.isPublic || false,
    language: metadata.language || 'bo',
    createdAt: new Date().toISOString()
  }
});

export const getCurrentContent = () => {
  try {
    const content = localStorage.getItem('sheets-content');
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error parsing content from localStorage:', error);
    return null;
  }
};