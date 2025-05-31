import React, { useState } from 'react'
import { createEditor } from 'slate'
import { Slate, withReact } from 'slate-react'
import withEmbeds from '../../sheet-utils/withEmbeds'
import EditorInput from './EditorInput/EditorInput'
import Toolsbar from '../Toolbar/Toolsbar'
import { withHistory } from 'slate-history'
const Editor = (prop) => {
    const [editor] = useState(() => withHistory(withEmbeds(withReact(createEditor()))))
    const { initialValue, children } = prop
  return (
      <Slate 
            editor={editor} 
            initialValue={initialValue}
            onChange={value => {
              const isAstChange = editor.operations.some(
                op => 'set_selection' !== op.type
              )
              if (isAstChange) {
                const content = JSON.stringify(value)
                localStorage.setItem('sheets-content', content)
              }
            }}>
            
            {
                React.Children.map(children, child => React.cloneElement(child, { editor }))
            }
      </Slate>
  )
}

Editor.Input = EditorInput
Editor.Toolbar = Toolsbar
export default Editor