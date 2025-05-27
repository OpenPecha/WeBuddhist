import { Editor, Transforms, Element } from "slate";
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
const CustomEditor = {
  handleEmbeds(editor, event) {
    const text = event.clipboardData.getData("text/plain");
    embedsRegex.some(({ regex, type }) => {
      const match = text.match(regex);
      if (match) {
        event.preventDefault();
        if (type === "pecha") {
          const pechaSegment = match[3];
          const pechaImageURL = `https://pecha-frontend-12552055234-4f99e0e.onrender.com/api/v1/share/image?segment_id=${pechaSegment}&language=bo`;
          if (pechaSegment) {
            Transforms.insertNodes(editor, {
              type: type,
              url: text,
              segmentId: pechaSegment,
              children: [{ text: "" }],
              src: pechaImageURL,
            });
            return true;
          }
          return false;
        }
        if (type === "youtube") {
          Transforms.insertNodes(editor, {
            type: type,
            youtubeId: match[1],
            children: [{ text: "" }],
          });
          return true;
        }
        return false;
      }
      return false;
    });
  },
  handlePaste(editor, event) {
    CustomEditor.handleEmbeds(editor, event);
  },
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
};

export default CustomEditor;
