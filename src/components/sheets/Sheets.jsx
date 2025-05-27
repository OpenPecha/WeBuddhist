import React, { useCallback, useState, useMemo } from 'react'
import { createEditor, Editor, Transforms, Element } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import './Sheets.scss'
import { Button } from 'react-bootstrap'

const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor)
    return marks ? marks.bold === true : false
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    })

    return !!match
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor)
    if (isActive) {
      Editor.removeMark(editor, 'bold')
    } else {
      Editor.addMark(editor, 'bold', true)
    }
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor)
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
    )
  },
}

const defaultValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
  {
    type:'image',
    children: [{ text: '' }],
    src: 'https://images.unsplash.com/photo-1745613184657-3c8dcd5f079a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Placeholder'
  }
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
  
  const initialValue = useMemo(
    () =>
      JSON.parse(localStorage.getItem('sheets-content')) || defaultValue,
    []
  )
  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, [])
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      case 'image':
        return <ImageElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])
  return (
    <div className="sheets-wrapper border">
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
          <div className="border">
            <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleBoldMark(editor); }}>Bold</Button>
            <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleCodeBlock(editor); }}>Code</Button>
            <Button onClick={(e) => { e.preventDefault(); console.log(editor.children) }}>Save</Button>
          </div>
       <Editable
        className="sheets-editable"
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (event.shiftKey && event.key === 'Enter') {
            event.preventDefault()
            Editor.insertText(editor, '\n')
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
      </Slate>
    </div>
  )
}

export default Sheets

const CodeElement = props => {
  return (
    <pre {...props.attributes} className='codestyle'>
      <code>{props.children}</code>
    </pre>
  )
}

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>
}
const ImageElement = props => {
  return (
    <div {...props.attributes}>
      <div contentEditable={false}>
        <img 
          className="sheet-image"
          src={props.element.src} 
          alt={props.element.alt}
        />
      </div>
      {props.children}
    </div>
  )
}