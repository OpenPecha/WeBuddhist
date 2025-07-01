//imported from old pecha
const ELEMENT_TAGS = {
  DIV: (el) => ({
    type: "paragraph",
    align: el.style.textAlign || undefined,
  }),
  OL: () => ({ type: "ordered-list" }),
  UL: () => ({ type: "unordered-list" }),
  LI: () => ({ type: "list-item" }),
  BLOCKQUOTE: () => ({ type: "block-quote" }),
  PRE: () => ({ type: "code" }),
  IMG: (el) => ({
    type: "image",
    src: el.getAttribute("src"),
    alt: el.getAttribute("alt") || "",
  }),
};

const TEXT_TAGS = {
  STRONG: () => ({ bold: true }),
  B: () => ({ bold: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  U: () => ({ underline: true }),
  SPAN: (el) => {
    const style = el.getAttribute("style") || "";
    const attrs = {};
    style.split(";").forEach((rule) => {
      const [key, value] = rule.split(":").map((s) => s?.trim());
      if (!key || !value) return;
      if (key === "color") attrs.color = value;
      if (key === "font-weight" && value === "bold") attrs.bold = true;
      if (key === "font-style" && value === "italic") attrs.italic = true;
      if (key === "text-decoration" && value === "underline")
        attrs.underline = true;
    });
    return attrs;
  },
};

export function deserialize(el) {
  if (el.nodeType === 3) {
    // Text node
    return { text: el.textContent };
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return { text: "\n" };
  }

  const nodeName = el.nodeName;
  let children = Array.from(el.childNodes)
    .map(deserialize)
    .flat()
    .filter(Boolean);

  // If no children, insert empty text node
  if (children.length === 0) children = [{ text: "" }];

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    // Ensure children is always an array of objects with text
    return {
      ...attrs,
      children: children.map((child) =>
        typeof child === "string" ? { text: child } : child
      ),
    };
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    // Merge marks into all children, flatten arrays
    return children.flat().map((child) => ({ ...child, ...attrs }));
  }

  // Fallback: treat as paragraph
  return {
    type: "paragraph",
    children: children.map((child) =>
      typeof child === "string" ? { text: child } : child
    ),
  };
}

export function deserializeSheetSegments(segments) {
  const parser = typeof window !== "undefined" ? new window.DOMParser() : null;
  const nodes = [];
  for (const segment of segments) {
    let content = segment.content;
    if (!content) continue;
    let slateNodes = [];
    if (parser && /<\/?[a-z][\s\S]*>/i.test(content)) {
      const doc = parser.parseFromString(
        `<body>${content}</body>`,
        "text/html"
      );
      const body = doc.body;
      for (const child of Array.from(body.childNodes)) {
        const des = deserialize(child);
        if (Array.isArray(des)) {
          slateNodes.push(...des);
        } else if (des) {
          slateNodes.push(des);
        }
      }
    } else {
      // Plain text: wrap in paragraph
      slateNodes.push({ type: "paragraph", children: [{ text: content }] });
    }
    // Filter out any invalid nodes, ensure all are valid Slate blocks
    slateNodes = slateNodes
      .map((node) => {
        if (!node || typeof node !== "object") return null;
        if (!node.children || !Array.isArray(node.children)) {
          // If node is a text node, wrap in paragraph
          if (node.text !== undefined) {
            return { type: "paragraph", children: [node] };
          }
          return null;
        }
        return node;
      })
      .filter(Boolean);
    nodes.push(...slateNodes);
  }
  return nodes.length
    ? nodes
    : [{ type: "paragraph", children: [{ text: "" }] }];
}
