import React, { useCallback, useState } from 'react'
import { createEditor ,Editor, Transforms, Element} from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]


const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  )
}
const Sheets = () => {
  const [editor] = useState(() => withReact(createEditor()))
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])
  return (
    <Slate editor={editor} initialValue={initialValue}>
     <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          if (!(isMac ? event.metaKey : event.ctrlKey)) {
            return
          }

          switch (event.key) {
            case '1': {
              //for making like code block
              event.preventDefault()
              const [match] = Editor.nodes(editor, {
                match: n => n.type === 'code',
              })
              Transforms.setNodes(
                editor,
                { type: match ? null : 'code' },
                {
                  match: n => Element.isElement(n) && Editor.isBlock(editor, n),
                }
              )
              break
            }

            case 'b': {
              event.preventDefault()
              const isActive = Editor.marks(editor)?.bold === true;
              if (isActive) {
                Editor.removeMark(editor, 'bold');
              } else {
                Editor.addMark(editor, 'bold', true);
              }
              break
            }
          }
        }}
      />
    </Slate>
  )
}

export default Sheets

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}