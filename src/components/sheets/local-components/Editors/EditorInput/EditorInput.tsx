import React, { useCallback } from 'react'
import {Editable} from 'slate-react'
import YoutubeElement from '../../../local-components/Editors/Elements/youtube-element/YoutubeElement'
import CustomPecha from '../../../local-components/Editors/Elements/custompecha-element/CustomPecha'
import PechaElement from '../../../local-components/Editors/Elements/pecha-element/PechaElement'
import DefaultElement from '../../../local-components/Editors/Elements/default-element/DefaultElement'
import CodeElement from '../../../local-components/Editors/Elements/code-element/CodeElement'
import ImageElement from '../../../local-components/Editors/Elements/image-element/ImageElement'
import AudioElement from '../../../local-components/Editors/Elements/audio-element/AudioElement'
import QuoteElement from '../../../local-components/Editors/Elements/quote-element/QuoteElement'
import Leaf from '../../../local-components/Editors/leaves/Leaf'
import { useCustomEditor } from '../../../sheet-utils/CustomEditor'
import Heading from '../Elements/style-elements/Heading'
import List from '../Elements/style-elements/List'
import ListItem from '../Elements/style-elements/ListItem'
import './EditorInput.scss'
import PropTypes from "prop-types";
const EditorInput = (prop) => {
    const { editor } = prop
    const customEditor = useCustomEditor();
    
    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
      }, [])

    const renderElement = useCallback(props => {
        switch (props?.element?.type) { // NOSONAR
          case 'code':
            return <CodeElement {...props} />
          case 'heading-one':
            return <Heading as="h1" {...props}  />
          case 'heading-two':
            return <Heading as="h2" {...props}/>
          case 'block-quote':
            return <QuoteElement {...props} />
          case 'ordered-list':
            return <List {...props} />
          case 'unordered-list':
            return <List {...props} />
          case 'list-item':
            return <ListItem {...props} />
          case 'image':
            return <ImageElement {...props} />
          case 'youtube':
            return <YoutubeElement {...props} />
          case 'audio':
            return <AudioElement {...props} />
          case 'pecha':
            return <PechaElement {...props} />
          case 'custompecha':
            return <CustomPecha {...props} />
          default:
            return <DefaultElement {...props} />
        }
      }, [])
  return (
    <Editable
      autoFocus
      spellCheck
      disableDefaultStyles
      className="sheets-editable content"
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      onPaste={event => {
        customEditor.handlePaste(editor, event)
      }}
      onKeyDown={event => {
        if (event.shiftKey && event.key === 'Enter') {
          event.preventDefault()
          editor.insertText('\n')
          return
        }
        if (event.key === 'Backspace') {
          if (customEditor.handleBackspaceAtListStart(editor, event)) {
            return
          }
        }
        if (!(event.metaKey || event.ctrlKey)) {
          return
        }

        switch (event.key) {
          case '1': {
            event.preventDefault()
            customEditor.toggleCodeBlock(editor)
            break
          }
          case 'i': {
            event.preventDefault()
            customEditor.toggleMark(editor, "italic")
            break
          }
          case 'b': {
            event.preventDefault()
            customEditor.toggleMark(editor, "bold")
            break
          }
          case 'u': {
            event.preventDefault()
            customEditor.toggleMark(editor, "underline")
            break
          }
          case "z": {
            event.preventDefault()
            editor.undo()
            break
          }
          case "y": {
            event.preventDefault()
            editor.redo()
            break
          }
        }
      }}
    />
  )
}

export default EditorInput
EditorInput.propTypes = {
  editor: PropTypes.object
}