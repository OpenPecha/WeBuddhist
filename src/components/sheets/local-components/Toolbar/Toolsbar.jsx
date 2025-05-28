import React from 'react'
import { FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaQuoteLeft, FaCode, FaImage, FaSave } from 'react-icons/fa'
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import CustomEditor from '../../sheet-utils/CustomEditor'
import MarkButton from './MarkButton'
import BlockButton from './blockButton'
import './Toolsbar.scss'
const Toolsbar = (prop) => {
  const {editor} = prop
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <MarkButton format="bold" className="toolbar-button"> <FaBold /> </MarkButton>
        <MarkButton format="italic" className="toolbar-button"> <FaItalic /> </MarkButton>
        <MarkButton format="underline" className="toolbar-button"> <FaUnderline /> </MarkButton>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <BlockButton format="heading-one" className="toolbar-button"> <LuHeading1 /> </BlockButton>
        <BlockButton format="heading-two" className="toolbar-button"> <LuHeading2 /> </BlockButton>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <BlockButton format="ordered-list" className="toolbar-button"><FaListOl /></BlockButton>
        <BlockButton format="unordered-list" className="toolbar-button"><FaListUl /></BlockButton>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <BlockButton format="left" className="toolbar-button"> <FaAlignLeft /> </BlockButton>
        <BlockButton format="center" className="toolbar-button"> <FaAlignCenter /> </BlockButton>
        <BlockButton format="right" className="toolbar-button"> <FaAlignRight /> </BlockButton>
        <BlockButton format="justify" className="toolbar-button"> <FaAlignJustify /> </BlockButton>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <BlockButton format="block-quote" className="toolbar-button"> <FaQuoteLeft /> </BlockButton>
        <button className="toolbar-button" onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleCodeBlock(editor); }}><FaCode /></button>
        <button className="toolbar-button" onMouseDown={(e) => { e.preventDefault(); CustomEditor.toggleImage(editor); }}><FaImage /></button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <button className="toolbar-button save-button" onClick={(e) => { e.preventDefault(); console.log(editor.children) }}><FaSave /></button>
      </div>
    </div>
  )
}

export default Toolsbar