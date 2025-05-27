import React from 'react'
import { FaBold ,FaItalic,FaUnderline,FaListOl,FaListUl} from 'react-icons/fa'
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { Button } from 'react-bootstrap'
import CustomEditor from '../../sheet-utils/CustomEditor'
import MarkButton from './MarkButton'
import BlockButton from './blockButton'
const Toolsbar = (prop) => {
  const {editor} = prop
  return (
    <div className="border">
      <MarkButton format="bold" > <FaBold /> </MarkButton>
      <MarkButton format="italic" > <FaItalic /> </MarkButton>
      <MarkButton format="underline" > <FaUnderline /> </MarkButton>
      <BlockButton format="heading-one" > <LuHeading1 /> </BlockButton>
      <BlockButton format="heading-two" > <LuHeading2 /> </BlockButton>
      <BlockButton format="ordered-list"><FaListOl /></BlockButton>
      <BlockButton format="unordered-list"><FaListUl /></BlockButton>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleLink(editor); }}>Link</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleImage(editor); }}>Image</Button>
      <Button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleCodeBlock(editor); }}>Code</Button>
      <Button onClick={(e) => { e.preventDefault(); console.log(editor.children) }}>Save</Button>
    </div>
  )
}

export default Toolsbar