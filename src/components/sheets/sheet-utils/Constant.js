import { serialize } from "./serialize";

const LIST_TYPES = ["ordered-list", "unordered-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const extractSpotifyInfo = (url) => {
  const match = url.match(
    /spotify\.com\/(?:embed\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/
  );
  return match ? { type: match[1], id: match[2] } : null;
};

const isAlignType = (format) => {
  return TEXT_ALIGN_TYPES.includes(format);
};

const isAlignElement = (n) => {
  return n.align !== undefined;
};
const isListType = (format) => {
  return LIST_TYPES.includes(format);
};
const embedsRegex = [
  {
    regex: /https:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)(?:&.*)?/,
    type: "youtube",
  },
  {
    regex:
      /^https:\/\/pecha-frontend-12552055234-4f99e0e.onrender.com\/texts\/text-details\?text_id=([\w-]+)&contentId=([\w-]+)&versionId=&contentIndex=1&segment_id=([\w-]+)$/,
    type: "custompecha",
  },
  {
    regex:
      /https?:\/\/(?:www\.)?soundcloud\.com\/([a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+)/,
    type: "audio",
    getSrc: (match) =>
      `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${match[1]}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`,
    idExtractor: (match) => match[1],
  },
  {
    regex: /https?:\/\/open\.spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/,
    type: "audio",
    getSrc: (match) =>
      `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`,
    idExtractor: (match) => match[2],
  },
  {
    regex: /https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
    type: "image",
    getSrc: (match) => match[0],
  },
  {
    regex: /https?:\/\/encrypted-tbn\d+\.gstatic\.com\/images\?.*$/i,
    type: "image",
    getSrc: (match) => match[0],
  },
];

const removeFootnotes = (content) => {
  if (!content) return "";

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  const footnoteMarkers = tempDiv.querySelectorAll("sup.footnote-marker");
  const footnotes = tempDiv.querySelectorAll("i.footnote");

  footnoteMarkers.forEach((marker) => marker.remove());
  footnotes.forEach((footnote) => footnote.remove());

  return tempDiv.innerHTML;
};
export {
  isAlignElement,
  isAlignType,
  isListType,
  embedsRegex,
  removeFootnotes,
  extractSpotifyInfo,
};

export const createPayload = (value, title, is_published = false) => {
  const source = value.map((node, i) => {
    if (node.type === "image") {
      return {
        position: i,
        type: "image",
        content: node.alt,
      };
    }
    if (["audio", "video", "youtube"].includes(node.type)) {
      return {
        position: i,
        type: node.type == "youtube" ? "video" : node.type,
        content: node.type == "youtube" ? node.youtubeId : node.src,
      };
    }
    if (node.type === "pecha") {
      return {
        position: i,
        type: "source",
        content: node.src,
      };
    }
    return {
      position: i,
      type: "content",
      content: serialize(node),
    };
  });
  return {
    title,
    source,
    is_published,
  };
};

function htmlToSlate(domNode, marks = {}) {
  if (domNode.nodeType === 3) {
    if (!domNode.textContent) return null;
    return { text: domNode.textContent, ...marks };
  }
  if (domNode.nodeType !== 1) return null;

  let newMarks = { ...marks };
  const tag = domNode.nodeName.toLowerCase();
  if (tag === "strong" || tag === "b") newMarks.bold = true;
  if (tag === "em" || tag === "i") newMarks.italic = true;
  if (tag === "u") newMarks.underline = true;
  if (tag === "span" && domNode.style) {
    if (
      domNode.style.fontWeight === "bold" ||
      domNode.style.fontWeight === "700"
    )
      newMarks.bold = true;
    if (domNode.style.fontStyle === "italic") newMarks.italic = true;
    if (domNode.style.textDecoration.includes("underline"))
      newMarks.underline = true;
    if (domNode.style.color) newMarks.color = domNode.style.color;
  }
  let children = [];
  domNode.childNodes.forEach((child) => {
    const slateNode = htmlToSlate(child, newMarks);
    if (Array.isArray(slateNode)) {
      children.push(...slateNode);
    } else if (slateNode) {
      children.push(slateNode);
    }
  });
  return children;
}

export function convertSegmentsToSlate(segments) {
  if (segments.length === 0) {
    return [{ type: "paragraph", align: "left", children: [{ text: "" }] }];
  }
  const parser = typeof window !== "undefined" ? new window.DOMParser() : null;
  return segments.map((segment) => {
    const { type, content, key } = segment;
    switch (type) {
      case "content": {
        if (/<blockquote[\s>]/i.test(content)) {
          let quoteHtml = content;
          const match = content.match(
            /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i
          );
          if (match) {
            quoteHtml = match[1];
          }
          quoteHtml = quoteHtml.replace(/<br\s*\/?>/gi, "\n");
          let children = [{ text: quoteHtml }];
          if (parser) {
            const doc = parser.parseFromString(
              `<body>${quoteHtml}</body>`,
              "text/html"
            );
            const body = doc.body;
            children = [];
            body.childNodes.forEach((node) => {
              const slateNodes = htmlToSlate(node);
              if (Array.isArray(slateNodes)) {
                children.push(...slateNodes);
              } else if (slateNodes) {
                children.push(slateNodes);
              }
            });
            if (
              !children.length ||
              !children.some((n) => n.text !== undefined)
            ) {
              children = [{ text: "" }];
            }
          }
          return {
            type: "block-quote",
            align: "left",
            children,
          };
        } else if (/<ol[\s>]/i.test(content) || /<ul[\s>]/i.test(content)) {
          let listHtml = content;
          if (parser) {
            const doc = parser.parseFromString(
              `<body>${listHtml}</body>`,
              "text/html"
            );
            const body = doc.body;
            const listNode = body.querySelector("ol, ul");
            if (listNode) {
              const listType =
                listNode.nodeName.toLowerCase() === "ol"
                  ? "ordered-list"
                  : "unordered-list";
              const children = [];
              listNode.childNodes.forEach((li) => {
                if (li.nodeName === "LI") {
                  let liHtml = li.innerHTML.replace(/<br\s*\/?>/gi, "\n");
                  let liChildren = [];
                  const liDoc = parser.parseFromString(
                    `<body>${liHtml}</body>`,
                    "text/html"
                  );
                  liDoc.body.childNodes.forEach((node) => {
                    const slateNodes = htmlToSlate(node);
                    if (Array.isArray(slateNodes)) {
                      liChildren.push(...slateNodes);
                    } else if (slateNodes) {
                      liChildren.push(slateNodes);
                    }
                  });
                  if (!liChildren.length) liChildren = [{ text: "" }];
                  children.push({
                    type: "list-item",
                    children: liChildren,
                  });
                }
              });
              return {
                type: listType,
                align: "left",
                children,
              };
            }
          }
        } else if (parser && /<\/?[a-z][\s\S]*>/i.test(content)) {
          const doc = parser.parseFromString(
            `<body>${content}</body>`,
            "text/html"
          );
          const body = doc.body;
          let align = "left";
          let children = [];
          if (body.firstChild && body.firstChild.nodeName === "DIV") {
            const div = body.firstChild;
            align = div.style.textAlign || "left";
            children = htmlToSlate(div) || [];
          } else {
            body.childNodes.forEach((node) => {
              const slateNodes = htmlToSlate(node);
              if (Array.isArray(slateNodes)) {
                children.push(...slateNodes);
              } else if (slateNodes) {
                children.push(slateNodes);
              }
            });
          }
          if (!children.length || !children.some((n) => n.text !== undefined)) {
            children = [{ text: "" }];
          }
          return {
            type: "paragraph",
            align,
            children,
          };
        } else {
          return {
            type: "paragraph",
            align: "left",
            children: [{ text: content || "" }],
          };
        }
      }
      case "video":
        return {
          type: "youtube",
          youtubeId: content,
          children: [{ text: "" }],
        };
      case "image":
        return {
          type: "image",
          src: content,
          alt: key,
          children: [{ text: "" }],
        };
      case "audio":
        return {
          type: "audio",
          src: content,
          children: [{ text: "" }],
        };
      case "source":
        return {
          type: "pecha",
          src: segment.segment_id,
          children: [{ text: "" }],
        };
      default:
        return {
          type: "paragraph",
          align: "left",
          children: [{ text: content || "" }],
        };
    }
  });
}
