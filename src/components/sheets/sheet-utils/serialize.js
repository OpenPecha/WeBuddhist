// function taken from old pecha repo to serialize to html tags

const format_to_html_lookup = {
  bold: "strong",
  italic: "em",
  underline: "u",
};

const special_styles_to_care_about = [
  "color",
  "fontWeight",
  "fontStyle",
  "textDecoration",
];

export const serialize = (content) => {
  if (content.text) {
    const tagStringObj = Object.keys(content).reduce(
      (tagString, key) => {
        if (content[key] === true && format_to_html_lookup[key]) {
          const htmlTag = format_to_html_lookup[key];
          const preTag = tagString.preTags + `<${htmlTag}>`;
          const postTag = `</${htmlTag}>` + tagString.postTags;
          return { preTags: preTag, postTags: postTag };
        } else if (special_styles_to_care_about.includes(key)) {
          const preTag =
            tagString.preTags + `<span style="${key}:${content[key]}">`;
          const postTag = `</span>` + tagString.postTags;
          return {
            preTags: preTag.toLowerCase(),
            postTags: postTag.toLowerCase(),
          };
        }
        return tagString;
      },
      { preTags: "", postTags: "" }
    );

    return `${tagStringObj.preTags}${content.text.replace(/(\n)+/g, "<br>")}${
      tagStringObj.postTags
    }`;
  }

  // Handle element nodes
  if (content.type || content.align) {
    switch (content.type) {
      case "link": {
        const linkHTML = content.children.map(serialize).join("");
        return content.ref
          ? `<a href="${content.url}" class="refLink" data-ref="${content.ref}">${linkHTML}</a>`
          : `<a href="${content.url}">${linkHTML}</a>`;
      }
      case "paragraph": {
        const paragraphHTML = content.children.map(serialize).join("");
        if (content.align) {
          return `<div style='text-align: ${content.align}'>${paragraphHTML}</div>`;
        }
        return `<div>${paragraphHTML}</div>`;
      }
      case "list-item": {
        const liHtml = content.children.map(serialize).join("");
        return `<li>${liHtml}</li>`;
      }
      case "ordered-list": {
        const olHtml = content.children.map(serialize).join("");
        return `<ol>${olHtml}</ol>`;
      }
      case "unordered-list": {
        const ulHtml = content.children.map(serialize).join("");
        return `<ul>${ulHtml}</ul>`;
      }
      case "block-quote": {
        const quoteHtml = content.children.map(serialize).join("");
        return `<blockquote>${quoteHtml}</blockquote>`;
      }
      case "code": {
        const codeHtml = content.children.map(serialize).join("");
        return `<pre><code>${codeHtml}</code></pre>`;
      }
      case "image": {
        return `<img src="${content.src}" alt="${content.alt || ""}" />`;
      }
      case "pecha": {
        return `<div class="webuddhist-content" data-segment-id="${content.src}"></div>`;
      }
      default:
        break;
    }
    if (content.align) {
      const html = content.children
        ? content.children.map(serialize).join("")
        : "";
      return `<div style='text-align: ${content.align}'>${html}</div>`;
    }
  }

  const children = content.children ? content.children.map(serialize) : [];
  return children.join("");
};
