import React from 'react'
import { Button } from 'react-bootstrap'
import CustomEditor from '../../sheet-utils/CustomEditor'
const Toolsbar = (prop) => {
  const {editor} = prop
  return (
    <div className="border">
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleMark(editor, "bold"); }}>Bold</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleMark(editor,"italic"); }}>Italic</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleUnderlineMark(editor); }}>Underline</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleLink(editor); }}>Link</Button>
      <Button onMouseDown={(e) => {e.preventDefault(); CustomEditor.toggleNumberList(editor); }}>Number List</Button>
      <Button onMouseDown={(e) => {e.preventDefault(); CustomEditor.toggleBulletList(editor); }}>Bullet List</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleBlock(editor, "heading-one"); }}>H1</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleBlock(editor, "heading-two"); }}>H2</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleImage(editor); }}>Image</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleCodeBlock(editor); }}>Code</Button>
      <Button onClick={(e) => { e.preventDefault(); console.log(editor.children) }}>Save</Button>
    </div>
  )
}

export default Toolsbar