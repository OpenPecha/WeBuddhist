import React from 'react'
import { FaBold ,FaItalic,FaUnderline,FaListOl,FaListUl,FaAlignLeft,FaAlignCenter,FaAlignRight,FaAlignJustify,FaQuoteLeft,FaCode,FaImage,FaSave} from 'react-icons/fa'
import { LuHeading1, LuHeading2 } from "react-icons/lu";
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
      <BlockButton format="left"> <FaAlignLeft /> </BlockButton>
      <BlockButton format="center"> <FaAlignCenter /> </BlockButton>
      <BlockButton format="right"> <FaAlignRight /> </BlockButton>
      <BlockButton format="justify"> <FaAlignJustify /> </BlockButton>
      <BlockButton format="block-quote"> <FaQuoteLeft /> </BlockButton>
      <button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleCodeBlock(editor); }}><FaCode /></button>
      <button onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleImage(editor); }}><FaImage /></button>
      <button onClick={(e) => { e.preventDefault(); console.log(editor.children) }}><FaSave /></button>
    </div>
  )
}

export default Toolsbar