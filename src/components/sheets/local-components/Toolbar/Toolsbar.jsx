import React, { useState } from 'react'
import { FaBold, FaItalic, FaUnderline, FaListOl, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaQuoteLeft, FaCode, FaImage } from 'react-icons/fa'
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { useCustomEditor } from '../../sheet-utils/CustomEditor'
import MarkButton from './MarkButton'
import BlockButton from './blockButton'
import './Toolsbar.scss'
import pechaIcon from "../../../../assets/icons/pecha_icon.png"
import { useTranslate } from '@tolgee/react';
import { createPayload } from '../../sheet-utils/Constant';
import { updateSheet } from '../Editors/EditorWrapper';
import AlertModal from '../modals/alert-modal/AlertModal';
import { useNavigate } from 'react-router-dom';

const Toolsbar = (prop) => {
  const {editor, value, title, sheetId, saveStatus} = prop
  const customEditor = useCustomEditor();
  const {t} = useTranslate();
  const navigate = useNavigate();

  const [alert, setAlert] = useState({ open: false, type: 'success', message: '' });

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      const payload = createPayload(value, title || sessionStorage.getItem("sheet-title"), true);
      await updateSheet(sheetId, payload);
      setAlert({ open: true, type: 'success', message: t('Sheet published successfully!') });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setAlert({ open: true, type: 'error', message: t('Failed to publish sheet.',error)});
    }
  };

  const getSaveStatusIndicator = () => {
    let statusClass = 'save-status-indicator--idle';
    if (saveStatus === 'saving') {
      statusClass = 'save-status-indicator--saving';
    } else if (saveStatus === 'saved') {
      statusClass = 'save-status-indicator--saved';
    }
    return (
      <span
        className={`save-status-indicator ${statusClass}`}
      />
    );
  };

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
          disabled={!sheetId}
          className={`publish-button listtitle ${!sheetId ? "disabled-button" : ""}`}
          onClick={handlePublish}
        >
          {t("publish")}
        </button>
        {getSaveStatusIndicator()}
      </div>
    );
  };

  return (
    <>
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
      {alert.open && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={handleCloseAlert}
        />
      )}
    </>
  )
}

export default Toolsbar