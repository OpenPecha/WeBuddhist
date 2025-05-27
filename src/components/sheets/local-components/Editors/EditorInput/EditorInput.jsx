import React, { useCallback } from 'react'
import {Editable} from 'slate-react'
import YoutubeElement from '../../../local-components/Editors/Elements/YoutubeElement'
import CustomPecha from '../../../local-components/Editors/Elements/CustomPecha'
import DefaultElement from '../../../local-components/Editors/Elements/DefaultElement'
import CodeElement from '../../../local-components/Editors/Elements/CodeElement'
import ImageElement from '../../../local-components/Editors/Elements/ImageElement'
import Leaf from '../../../local-components/Editors/leaves/Leaf'
import CustomEditor from '../../../sheet-utils/CustomEditor'


const EditorInput = (prop) => {
    const { editor }=prop
    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
      }, [])

    const renderElement = useCallback(props => {
        switch (props.element.type) {
          case 'code':
            return <CodeElement {...props} />
          case 'image':
            return <ImageElement {...props} />
          case 'youtube':
            return <YoutubeElement {...props} />
          case 'pecha':
            return <CustomPecha {...props} />
          default:
            return <DefaultElement {...props} />
        }
      }, [])
  return (
    <Editable
    className="sheets-editable"
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

        case 'b': {
          event.preventDefault()
          CustomEditor.toggleBoldMark(editor)
          break
        }
      }
    }}
  />
  )
}

export default EditorInput