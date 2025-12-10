import { useCallback } from "react";
import { Editable } from "slate-react";
import YoutubeElement from "../Elements/youtube-element/YoutubeElement.tsx";
import CustomPecha from "../Elements/custompecha-element/CustomPecha.tsx";
import PechaElement from "../Elements/pecha-element/PechaElement.tsx";
import DefaultElement from "../Elements/default-element/DefaultElement.tsx";
import CodeElement from "../Elements/code-element/CodeElement.tsx";
import ImageElement from "../Elements/image-element/ImageElement.tsx";
import AudioElement from "../Elements/audio-element/AudioElement.tsx";
import QuoteElement from "../Elements/quote-element/QuoteElement.tsx";
import Leaf from "../leaves/Leaf.tsx";
import { useCustomEditor } from "../../../sheet-utils/CustomEditor.ts";
import Heading from "../Elements/style-elements/Heading.tsx";
import List from "../Elements/style-elements/List.tsx";
import ListItem from "../Elements/style-elements/ListItem.tsx";

const EditorInput = ({ editor }: any) => {
  const customEditor = useCustomEditor();

  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />;
  }, []);

  const renderElement = useCallback((props: any) => {
    switch (props?.element?.type) {
      case "code":
        return <CodeElement {...props} />;
      case "heading-one":
        return <Heading as="h1" {...props} />;
      case "heading-two":
        return <Heading as="h2" {...props} />;
      case "block-quote":
        return <QuoteElement {...props} />;
      case "ordered-list":
        return <List {...props} />;
      case "unordered-list":
        return <List {...props} />;
      case "list-item":
        return <ListItem {...props} />;
      case "image":
        return <ImageElement {...props} />;
      case "youtube":
        return <YoutubeElement {...props} />;
      case "audio":
        return <AudioElement {...props} />;
      case "pecha":
        return <PechaElement {...props} />;
      case "custompecha":
        return <CustomPecha {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);
  return (
    <Editable
      autoFocus
      spellCheck
      disableDefaultStyles
      className="w-full max-w-full overflow-x-hidden wrap-break-word [ul]:list-disc [ol]:list-decimal [li]:list-item [li]:whitespace-pre-wrap"
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      onPaste={(event) => {
        customEditor.handlePaste(editor, event);
      }}
      onKeyDown={(event) => {
        if (event.shiftKey && event.key === "Enter") {
          event.preventDefault();
          editor.insertText("\n");
          return;
        }
        if (event.key === "Backspace") {
          if (customEditor.handleBackspaceAtListStart(editor, event)) {
            return;
          }
        }
        if (!(event.metaKey || event.ctrlKey)) {
          return;
        }

        switch (event.key) {
          case "1": {
            event.preventDefault();
            customEditor.toggleCodeBlock(editor);
            break;
          }
          case "i": {
            event.preventDefault();
            customEditor.toggleMark(editor, "italic");
            break;
          }
          case "b": {
            event.preventDefault();
            customEditor.toggleMark(editor, "bold");
            break;
          }
          case "u": {
            event.preventDefault();
            customEditor.toggleMark(editor, "underline");
            break;
          }
          case "z": {
            event.preventDefault();
            editor.undo();
            break;
          }
          case "y": {
            event.preventDefault();
            editor.redo();
            break;
          }
        }
      }}
    />
  );
};

export default EditorInput;
