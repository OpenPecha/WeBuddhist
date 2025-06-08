import { Editor, Transforms, Element, Path } from "slate";
import "../local-components/modals/image-upload-modal/ImageUpload.scss";
import { createPortal } from "react-dom";
import React from "react";
import { createRoot } from "react-dom/client";
import {
  isAlignElement,
  isAlignType,
  isListType,
  embedsRegex,
} from "./Constant";
import ImageUploadModal from "../local-components/modals/image-upload-modal/ImageUploadModal";
const CustomEditor = {
  handleEmbeds(editor, event) {
    const text = event.clipboardData.getData("text/plain");
    embedsRegex.some(({ regex, type, getSrc, idExtractor }) => {
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
        if (type === "audio" && getSrc) {
          const src = getSrc(match);
          Transforms.insertNodes(editor, {
            type: type,
            src: src,
            url: text,
            children: [{ text: "" }],
          });
          return true;
        }
        if (type === "image" && getSrc) {
          const src = getSrc(match);
          Transforms.insertNodes(editor, {
            type: type,
            src: src,
            url: text,
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
    if (this.handleEmbeds(editor, event)) {
      return;
    }
    const text = event.clipboardData.getData("text/plain");
    if (text) {
      event.preventDefault();
      Transforms.insertNodes(editor, {
        type: "paragraph",
        align: "left",
        children: [{ text: "" }],
      });
    }
  },

  isMarkActive(editor, type) {
    const marks = Editor.marks(editor);
    return marks ? marks[type] === true : false;
  },
  toggleMark(editor, type) {
    const isActive = CustomEditor.isMarkActive(editor, type);
    if (isActive) {
      Editor.removeMark(editor, type);
    } else {
      Editor.addMark(editor, type, true);
    }
  },
  toggleBlock(editor, format) {
    const isActive = CustomEditor.isBlockActive(
      editor,
      format,
      isAlignType(format) ? "align" : "type"
    );
    const isList = isListType(format);
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        isListType(n.type) &&
        !isAlignType(format),
      split: true,
    });
    let newProperties;
    if (isAlignType(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      };
    } else {
      newProperties = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
      };
    }
    Transforms.setNodes(editor, newProperties);
    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  },

  isBlockActive(editor, format, blockType = "type") {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => {
          if (!Editor.isEditor(n) && Element.isElement(n)) {
            if (blockType === "align" && isAlignElement(n)) {
              return n.align === format;
            }
            return n.type === format;
          }
          return false;
        },
      })
    );
    return !!match;
  },
  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "code",
    });

    return !!match;
  },
  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
    );
  },

  toggleImage(editor) {
    const modalRoot = document.createElement("div");
    document.body.appendChild(modalRoot);
    const root = createRoot(modalRoot);

    const handleClose = () => {
      root.unmount();
      document.body.removeChild(modalRoot);
    };

    const handleUpload = (url, alt) => {
      if (!url) return;
      const { selection } = editor;
      let replaced = false;
      if (selection) {
        const [currentNode, currentPath] = Editor.node(editor, selection, {
          depth: 1,
        });
        if (
          currentNode.type === "paragraph" &&
          Editor.isEmpty(editor, currentNode)
        ) {
          Transforms.setNodes(
            editor,
            {
              type: "image",
              src: url,
              alt: alt,
              children: [{ text: "" }],
            },
            { at: currentPath }
          );
          Transforms.insertNodes(
            editor,
            {
              type: "paragraph",
              align: "left",
              children: [{ text: "" }],
            },
            { at: Path.next(currentPath) }
          );
          replaced = true;
        }
      }
      if (!replaced) {
        Transforms.insertNodes(editor, {
          type: "image",
          src: url,
          alt: alt,
          children: [{ text: "" }],
        });
        Transforms.insertNodes(editor, {
          type: "paragraph",
          align: "left",
          children: [{ text: "" }],
        });
      }
      handleClose();
    };

    root.render(
      createPortal(
        React.createElement(ImageUploadModal, {
          onClose: handleClose,
          onUpload: handleUpload,
        }),
        modalRoot
      )
    );
  },
};

export default CustomEditor;
