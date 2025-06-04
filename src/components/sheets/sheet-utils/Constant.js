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
    type: "pecha",
  },
];

export {
  LIST_TYPES,
  TEXT_ALIGN_TYPES,
  isAlignElement,
  isAlignType,
  isListType,
  embedsRegex,
};
