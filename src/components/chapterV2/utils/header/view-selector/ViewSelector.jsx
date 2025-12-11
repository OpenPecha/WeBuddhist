import React, { useRef, useEffect } from "react"
import "./ViewSelector.scss"
import {useTranslate} from "@tolgee/react";
import {MdClose} from "react-icons/md";
import { ImParagraphJustify } from "react-icons/im"; 
import { LuAlignJustify } from "react-icons/lu";
import PropTypes from "prop-types";

export const VIEW_MODES = {
  SOURCE: "SOURCE",
  TRANSLATIONS: "TRANSLATIONS",
  SOURCE_AND_TRANSLATIONS: "SOURCE_AND_TRANSLATIONS"
};

export const LAYOUT_MODES = {
  SEGMENTED: "SEGMENTED",
  PROSE: "PROSE"
};

const options = [
  {id: "1", label: "text.reader_option_menu.source", value: VIEW_MODES.SOURCE},
  {id: "2", label: "text.reader_option_menu.translation", value: VIEW_MODES.TRANSLATIONS},
  {id: "3", label: "text.reader_option_menu.source_with_translation", value: VIEW_MODES.SOURCE_AND_TRANSLATIONS}
]

const layoutOptions = [
  {id: "layout-1", icon: <ImParagraphJustify />, value: LAYOUT_MODES.PROSE},      
  {id: "layout-2", icon: <LuAlignJustify />, value: LAYOUT_MODES.SEGMENTED}      
]

const ViewSelector = (props) => {
  const {setShowViewSelector, viewMode, setViewMode, versionSelected, layoutMode, setLayoutMode} = props;
  const {t} = useTranslate();
  const viewSelectorRef = useRef(null);

  // Handle click outside to close the view selector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewSelectorRef.current && !viewSelectorRef.current.contains(event.target)) {
        setShowViewSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowViewSelector]);

  // ----------------------------- renderers ----------------------------
  const renderCloseIcon = () => {
    return <button className="view-selector-close-icon" onClick={() => setShowViewSelector(false)}>
      <MdClose size={18} style={{cursor: 'pointer'}}/>
    </button>
  }

  const renderViewModeOptions = () => {
    if (!versionSelected) return null;
    return options.map((option) => (
      <label key={option.id} className="radio-option subcontent">
        <input type="radio" name="view-mode" value={option.value} checked={viewMode === option.value} onChange={(e) => setViewMode(e.target.value)}/>
        <span>{t(option.label)}</span>
      </label>
    ))
  }

  const renderLayoutModeOptions = () => {
    return (
      <div className="layout-icons-container">
        <span className="layout-label subcontent">{t("text.reader_option_menu.layout")}</span>  
        <div className="icons-group">
          {layoutOptions.map((option) => (
            <label key={option.id} className="icon-option">
              <input 
                type="radio" 
                name="layout-mode" 
                value={option.value} 
                checked={layoutMode === option.value} 
                onChange={(e) => setLayoutMode(e.target.value)}
              />
              <div className="layout-icon">
                {option.icon}  
              </div>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="view-selector-options-container" ref={viewSelectorRef}>
      {/* {renderViewModeOptions()} */}
      <div className={`layout-mode-options ${!versionSelected ? 'no-view-modes' : ''}`}>
        {renderLayoutModeOptions()}
      </div>
    </div>
  );
};

export default React.memo(ViewSelector);

ViewSelector.propTypes = {
  setShowViewSelector: PropTypes.func.isRequired,
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
  versionSelected: PropTypes.bool,
  layoutMode: PropTypes.string.isRequired,
  setLayoutMode: PropTypes.func.isRequired,
};