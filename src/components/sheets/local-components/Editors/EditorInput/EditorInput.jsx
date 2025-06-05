import React, { useCallback } from 'react'
import {Editable} from 'slate-react'
import YoutubeElement from '../../../local-components/Editors/Elements/YoutubeElement'
import CustomPecha from '../../../local-components/Editors/Elements/CustomPecha'
import DefaultElement from '../../../local-components/Editors/Elements/DefaultElement'
import CodeElement from '../../../local-components/Editors/Elements/CodeElement'
import ImageElement from '../../../local-components/Editors/Elements/ImageElement'
import AudioElement from '../../../local-components/Editors/Elements/AudioElement'
import QuoteElement from '../../../local-components/Editors/Elements/QuoteElement'
import Leaf from '../../../local-components/Editors/leaves/Leaf'
import CustomEditor from '../../../sheet-utils/CustomEditor'
import Heading from '../Elements/Heading'
import List from '../Elements/List'
import ListItem from '../Elements/ListItem'


const EditorInput = (prop) => {
    const { editor }=prop
    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
      }, [])

    const renderElement = useCallback(props => {
        switch (props.element.type) {
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
      CustomEditor.handlePaste(editor,event)
    }}
    onKeyDown={event => {
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault()
        editor.insertText('\n')
        return
      }
      if (!(event.metaKey || event.ctrlKey)) {
        return
      }

      switch (event.key) {
        case '1': {
          event.preventDefault()
          CustomEditor.toggleCodeBlock(editor)
          break
        }
        case 'i': {
          event.preventDefault()
          CustomEditor.toggleMark(editor, "italic")
          break
        }
        case 'b': {
          event.preventDefault()
          CustomEditor.toggleMark(editor, "bold")
          break
        }
        case 'u': {
          event.preventDefault()
          CustomEditor.toggleMark(editor, "underline")
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