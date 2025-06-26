import { serialize } from "./serialize";

const LIST_TYPES = ["ordered-list", "unordered-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
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
};

export const createPayload = (value, title, is_published = false) => {
  const source = value.map((node, i) => {
    if (["image", "audio", "video"].includes(node.type)) {
      return {
        position: i,
        type: node.type,
        content: node.src,
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
