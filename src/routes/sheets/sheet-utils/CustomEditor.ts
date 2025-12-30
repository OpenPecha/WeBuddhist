import { Editor, Transforms, Element, Path, Range, Node } from "slate";
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

type CustomEditorInstance = Editor;
type CustomText = { text: string };
type CustomElement = {
  type: string;
  align?: string;
  url?: string;
  src?: string;
  segmentId?: string;
  youtubeId?: string;
  alt?: string;
  children: CustomNode[];
};
type CustomNode = CustomElement | CustomText;

type UploadedImage = { url: string; key: string };
type SegmentData = { segment_id?: string };
type TypedElement = Element & {
  type?: string;
  align?: string;
  [key: string]: unknown;
};

const fetchShortUrlContent = async (shortId: string) => {
  try {
    const response = await axios.get(
      `https://url-shortening-14682653622-b69c6fd.onrender.com/api/v1/shorten/${shortId}`,
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
    async handleEmbeds(
      editor: CustomEditorInstance,
      event: React.ClipboardEvent,
    ) {
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
          } as Node);
          Transforms.insertNodes(editor, {
            type: "paragraph",
            align: "left",
            children: [{ text: "" }],
          } as Node);
          return true;
        }
      }

      return embedsRegex.some(({ regex, type, getSrc }) => {
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
              } as Node);
              Transforms.insertNodes(editor, {
                type: "paragraph",
                align: "left",
                children: [{ text: "" }],
              } as Node);
              return true;
            }
            return false;
          }
          if (type === "youtube") {
            Transforms.insertNodes(editor, {
              type: type,
              youtubeId: match[1],
              children: [{ text: "" }],
            } as Node);
            Transforms.insertNodes(editor, {
              type: "paragraph",
              align: "left",
              children: [{ text: "" }],
            } as Node);
            return true;
          }
          if (type === "audio" && getSrc) {
            const src = getSrc(match as unknown as string);
            Transforms.insertNodes(editor, {
              type: type,
              src: src,
              url: text,
              children: [{ text: "" }],
            } as Node);
            Transforms.insertNodes(editor, {
              type: "paragraph",
              align: "left",
              children: [{ text: "" }],
            } as Node);
            return true;
          }
          if (type === "image" && getSrc) {
            const src = getSrc(match as unknown as string);
            Transforms.insertNodes(editor, {
              type: type,
              src: src,
              url: text,
              children: [{ text: "" }],
            } as Node);
            Transforms.insertNodes(editor, {
              type: "paragraph",
              align: "left",
              children: [{ text: "" }],
            } as Node);
            return true;
          }
          return false;
        }
        return false;
      });
    },
    async handlePaste(
      editor: CustomEditorInstance,
      event: React.ClipboardEvent,
    ) {
      const handled = await this.handleEmbeds(editor, event);
      if (handled) {
        return;
      }
      const text = event.clipboardData.getData("text/plain");
      if (text) {
        event.preventDefault();
        Transforms.insertNodes(editor, {
          type: "paragraph",
          align: "left",
          children: [{ text }],
        } as Node);
      }
    },

    handleBackspaceAtListStart(
      editor: CustomEditorInstance,
      event: React.KeyboardEvent,
    ) {
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) return false;

      const [listItemEntry] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          (n as TypedElement).type === "list-item",
      });
      if (!listItemEntry) return false;

      const [listItemNode, listItemPath] = listItemEntry as [Element, Path];

      if (!Editor.isStart(editor, selection.anchor, listItemPath)) return false;

      if (Editor.isEmpty(editor, listItemNode)) {
        event.preventDefault();
        Transforms.setNodes(
          editor,
          { type: "paragraph", align: "left" } as unknown as Partial<Node>,
          { at: listItemPath, match: (n) => Element.isElement(n) },
        );
        Transforms.unwrapNodes(editor, {
          match: (n) => {
            if (Editor.isEditor(n) || !Element.isElement(n)) return false;
            const elementType = (n as TypedElement).type;
            return elementType ? isListType(elementType) : false;
          },
          split: true,
        });
        return true;
      }

      return false;
    },

    isMarkActive(editor: CustomEditorInstance, type: string) {
      const marks = Editor.marks(editor);
      return marks ? Boolean((marks as Record<string, unknown>)[type]) : false;
    },
    toggleMark(editor: CustomEditorInstance, type: string) {
      const isActive = this.isMarkActive(editor, type);
      if (isActive) {
        Editor.removeMark(editor, type);
      } else {
        Editor.addMark(editor, type, true);
      }
    },
    toggleBlock(editor: CustomEditorInstance, format: string) {
      const isActive = this.isBlockActive(
        editor,
        format,
        isAlignType(format) ? "align" : "type",
      );
      const isList = isListType(format);
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          (() => {
            const elementType = (n as TypedElement).type;
            return elementType ? isListType(elementType) : false;
          })() &&
          !isAlignType(format),
        split: true,
      });
      let newProperties: Partial<TypedElement> & Record<string, unknown>;
      if (isAlignType(format)) {
        newProperties = {
          align: isActive ? undefined : format,
        };
      } else {
        newProperties = {
          type: isActive ? "paragraph" : isList ? "list-item" : format,
        };
      }
      Transforms.setNodes(editor, newProperties as unknown as Partial<Node>, {
        match: (n) => Element.isElement(n),
      });
      if (!isActive && isList) {
        const block = {
          type: format,
          children: [{ text: "" }],
        } as unknown as TypedElement;
        Transforms.wrapNodes(editor, block as any, {
          match: (n) => Element.isElement(n),
        });
      }
    },

    isBlockActive(
      editor: CustomEditorInstance,
      format: string,
      blockType: "align" | "type" = "type",
    ) {
      const { selection } = editor;
      if (!selection) return false;
      const [match] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) => {
            if (!Editor.isEditor(n) && Element.isElement(n)) {
              if (blockType === "align" && isAlignElement(n as any)) {
                return (n as any).align === format;
              }
              return (n as TypedElement).type === format;
            }
            return false;
          },
        }),
      );
      return !!match;
    },
    isCodeBlockActive(editor: CustomEditorInstance) {
      const [match] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          (n as TypedElement).type === "code",
      });

      return !!match;
    },
    toggleCodeBlock(editor: CustomEditorInstance) {
      const isActive = this.isCodeBlockActive(editor);
      Transforms.setNodes(
        editor,
        { type: isActive ? null : "code" } as unknown as Partial<Node>,
        { match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) },
      );
    },

    toggleImage(editor: CustomEditorInstance) {
      const modalRoot = document.createElement("div");
      document.body.appendChild(modalRoot);
      const root = createRoot(modalRoot);

      const handleClose = () => {
        root.unmount();
        document.body.removeChild(modalRoot);
      };

      const handleUpload = (data: UploadedImage | null) => {
        if (!data) return;
        const { selection } = editor;
        let replaced = false;
        if (selection) {
          const [currentNode, currentPath] = Editor.node(editor, selection, {
            depth: 1,
          }) as [Node, Path];
          if (!Element.isElement(currentNode)) {
            return;
          }
          const elementNode = currentNode as TypedElement;
          if (
            elementNode.type === "paragraph" &&
            Editor.isEmpty(editor, currentNode)
          ) {
            Transforms.setNodes(
              editor,
              {
                type: "image",
                src: data.url,
                alt: data.key,
                children: [{ text: "" }],
              } as unknown as Partial<Node>,
              { at: currentPath, match: (n) => Element.isElement(n) },
            );
            Transforms.insertNodes(
              editor,
              {
                type: "paragraph",
                align: "left",
                children: [{ text: "" }],
              } as Node,
              { at: Path.next(currentPath) },
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
          } as Node);
          Transforms.insertNodes(editor, {
            type: "paragraph",
            align: "left",
            children: [{ text: "" }],
          } as Node);
        }
        handleClose();
      };

      root.render(
        createPortal(
          React.createElement(ImageUploadModal, {
            open: true,
            onOpenChange: (isOpen: boolean) => {
              if (!isOpen) handleClose();
            },
            onUpload: handleUpload,
          }),
          modalRoot,
        ),
      );
    },

    toggleSheetSegment(editor: CustomEditorInstance) {
      const modalRoot = document.createElement("div");
      document.body.appendChild(modalRoot);
      const root = createRoot(modalRoot);
      const handleClose = () => {
        root.unmount();
        document.body.removeChild(modalRoot);
      };

      const handleSegment = (segmentData: SegmentData) => {
        if (!segmentData?.segment_id) return;

        const { selection } = editor;
        let replaced = false;

        if (selection) {
          const [currentNode, currentPath] = Editor.node(editor, selection, {
            depth: 1,
          }) as [Node, Path];
          if (!Element.isElement(currentNode)) {
            return;
          }
          const elementNode = currentNode as TypedElement;

          if (
            elementNode.type === "paragraph" &&
            Editor.isEmpty(editor, currentNode)
          ) {
            Transforms.setNodes(
              editor,
              {
                type: "pecha",
                src: segmentData.segment_id,
                children: [{ text: "" }],
              } as unknown as Partial<Node>,
              { at: currentPath, match: (n) => Element.isElement(n) },
            );
            Transforms.insertNodes(
              editor,
              {
                type: "paragraph",
                align: "left",
                children: [{ text: "" }],
              } as Node,
              { at: Path.next(currentPath) },
            );
            replaced = true;
          }
        }

        if (!replaced) {
          Transforms.insertNodes(editor, {
            type: "pecha",
            src: segmentData.segment_id,
            children: [{ text: "" }],
          } as Node);
          Transforms.insertNodes(editor, {
            type: "paragraph",
            align: "left",
            children: [{ text: "" }],
          } as Node);
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
            }),
          ),
          modalRoot,
        ),
      );
    },
  };
};
