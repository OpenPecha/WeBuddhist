import { Editor, Transforms, Element, Path, Range } from "slate";
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
import SheetSegmentModal from "../local-components/modals/sheet-segment-modal/SheetSegmentModal";
import { QueryClientProvider, useQueryClient } from "react-query";
import axios from "axios";

const fetchShortUrlContent = async (shortId) => {
  try {
    const response = await axios.get(
      `https://url-shortening-14682653622-b69c6fd.onrender.com/api/v1/shorten/${shortId}`
    );
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, "text/html");
    const segmentIdMatch = doc
      .querySelector('meta[property="og:url"]')
      ?.getAttribute("content")
      ?.match(/segment_id=([^&]+)/);
    return segmentIdMatch ? segmentIdMatch[1] : null;
  } catch (error) {
    console.error("Error fetching short URL content:", error);
    return null;
  }
};
export const useCustomEditor = () => {
  const queryClient = useQueryClient();

  return {
    async handleEmbeds(editor, event) {
      const text = event.clipboardData.getData("text/plain");

      const shortUrlMatch = text.match(/\/shorten\/([a-zA-Z0-9]+)$/);
      if (shortUrlMatch) {
        event.preventDefault();
        const shortId = shortUrlMatch[1];
        const segmentId = await fetchShortUrlContent(shortId);

        if (segmentId) {
          if (editor.selection) {
            Transforms.delete(editor);
          }

          Transforms.insertNodes(editor, {
            type: "pecha",
            src: segmentId,
            children: [{ text: "" }],
          });
          Transforms.insertNodes(editor, {
            type: "paragraph",
            align: "left",
            children: [{ text: "" }],
          });
          return true;
        }
      }

      return embedsRegex.some(({ regex, type, getSrc, idExtractor }) => {
        const match = text.match(regex);
        if (match) {
          event.preventDefault();

          if (editor.selection) {
            Transforms.delete(editor);
          }

          if (type === "custompecha") {
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
              Transforms.insertNodes(editor, {
                type: "paragraph",
                align: "left",
                children: [{ text: "" }],
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
            Transforms.insertNodes(editor, {
              type: "paragraph",
              align: "left",
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
            Transforms.insertNodes(editor, {
              type: "paragraph",
              align: "left",
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
            Transforms.insertNodes(editor, {
              type: "paragraph",
              align: "left",
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
          children: [{ text }],
        });
      }
    },

    handleBackspaceAtListStart(editor, event) {
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) return false;

      const [listItemEntry] = Editor.nodes(editor, {
        match: (n) => Element.isElement(n) && n.type === "list-item",
      });
      if (!listItemEntry) return false;

      const [listItemNode, listItemPath] = listItemEntry;

      if (!Editor.isStart(editor, selection.anchor, listItemPath)) return false;

      if (Editor.isEmpty(editor, listItemNode)) {
        event.preventDefault();
        Transforms.setNodes(
          editor,
          { type: "paragraph", align: "left" },
          { at: listItemPath }
        );
        Transforms.unwrapNodes(editor, {
          match: (n) => Element.isElement(n) && isListType(n.type),
          split: true,
        });
        return true;
      }

      return false;
    },

    isMarkActive(editor, type) {
      const marks = Editor.marks(editor);
      return marks ? marks[type] === true : false;
    },
    toggleMark(editor, type) {
      const isActive = this.isMarkActive(editor, type);
      if (isActive) {
        Editor.removeMark(editor, type);
      } else {
        Editor.addMark(editor, type, true);
      }
    },
    toggleBlock(editor, format) {
      const isActive = this.isBlockActive(
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
      const isActive = this.isCodeBlockActive(editor);
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

      const handleUpload = (data, alt) => {
        if (!data) return;
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
                src: data.url,
                alt: data.key,
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
            src: data.url,
            alt: data.key,
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

    toggleSheetSegment(editor) {
      const modalRoot = document.createElement("div");
      document.body.appendChild(modalRoot);
      const root = createRoot(modalRoot);
      const handleClose = () => {
        root.unmount();
        document.body.removeChild(modalRoot);
      };

      const handleSegment = (segmentData) => {
        if (!segmentData?.segment_id) return;

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
                type: "pecha",
                src: segmentData.segment_id,
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
            type: "pecha",
            src: segmentData.segment_id,
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
          React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(SheetSegmentModal, {
              onClose: handleClose,
              onSegment: handleSegment,
            })
          ),
          modalRoot
        )
      );
    },
  };
};
