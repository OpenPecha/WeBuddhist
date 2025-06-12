import React from 'react'
import { FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaQuoteLeft, FaCode, FaImage, FaSave } from 'react-icons/fa'
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { useCustomEditor } from '../../sheet-utils/CustomEditor'
import MarkButton from './MarkButton'
import BlockButton from './blockButton'
import './Toolsbar.scss'
import pechaIcon from "../../../../assets/icons/pecha_icon.png"
import { serialize } from '../../sheet-utils/serialize';
import { useTranslate } from '@tolgee/react';

const Toolsbar = (prop) => {
  const {editor} = prop
  const customEditor = useCustomEditor();
  const {t} = useTranslate();
  const renderMarkButtons = () => {
    return (
      <div className="toolbar-group">
        <MarkButton format="bold" className="toolbar-button"> <FaBold /> </MarkButton>
        <MarkButton format="italic" className="toolbar-button"> <FaItalic /> </MarkButton>
        <MarkButton format="underline" className="toolbar-button"> <FaUnderline /> </MarkButton>
      </div>
    );
  };

  const renderPechaIconSection = () => {
    return (
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onMouseDown={(e) => {
            e.preventDefault();
            customEditor.toggleSheetSegment(editor);
          }}
        >
          <img src={pechaIcon} style={{width: "20px", height: "20px" }} alt="source" />
        </button>
      </div>
    );
  };

  const renderHeadingButtons = () => {
    return (
      <div className="toolbar-group">
        <BlockButton format="heading-one" className="toolbar-button"> <LuHeading1 /> </BlockButton>
        <BlockButton format="heading-two" className="toolbar-button"> <LuHeading2 /> </BlockButton>
      </div>
    );
  };

  const renderListButtons = () => {
    return (
      <div className="toolbar-group">
        <BlockButton format="ordered-list" className="toolbar-button"><FaListOl /></BlockButton>
        <BlockButton format="unordered-list" className="toolbar-button"><FaListUl /></BlockButton>
      </div>
    );
  };

  const renderAlignmentButtons = () => {
    return (
      <div className="toolbar-group">
        <BlockButton format="left" className="toolbar-button"> <FaAlignLeft /> </BlockButton>
        <BlockButton format="center" className="toolbar-button"> <FaAlignCenter /> </BlockButton>
        <BlockButton format="right" className="toolbar-button"> <FaAlignRight /> </BlockButton>
        <BlockButton format="justify" className="toolbar-button"> <FaAlignJustify /> </BlockButton>
      </div>
    );
  };

  const renderUtilityButtons = () => {
    return (
      <div className="toolbar-group">
        <BlockButton format="block-quote" className="toolbar-button"> <FaQuoteLeft /> </BlockButton>
        <button className="toolbar-button" onMouseDown={(e) => { e.preventDefault(); customEditor.toggleCodeBlock(editor); }}><FaCode /></button>
        <button className="toolbar-button" onMouseDown={(e) => { e.preventDefault(); customEditor.toggleImage(editor); }}><FaImage /></button>
      </div>
    );
  };

  const renderActionButtons = () => {
    return (
      <div className="toolbar-group">
        <button
          className="publish-button listtitle"
          onClick={(e) => {
            e.preventDefault();
            const serializedNodes = editor.children.map((node, index) => ({
              text: serialize(node),
              node: index + 1,
            }));
            console.log(serializedNodes);
          }}
        >
          {t("publish")}
        </button>
      </div>
    );
  };

  return (
    <div className="toolbar">
      {renderMarkButtons()}
      
      <div className="toolbar-divider"/>
      {renderPechaIconSection()}
      
      <div className="toolbar-divider"/>
      {renderListButtons()}
      
      <div className="toolbar-divider"/>
      {renderAlignmentButtons()}
      
      <div className="toolbar-divider"/>
      {renderUtilityButtons()}
      
      <div className="toolbar-divider"/>
      {renderActionButtons()}
    </div>
  )
}

export default Toolsbar