import React, {useState} from "react"
import "./ViewSelector.scss"
import {useTranslate} from "@tolgee/react";
import {MdClose} from "react-icons/md";

export const VIEW_MODES = {
  SOURCE: "SOURCE",
  TRANSLATIONS: "TRANSLATIONS",
  SOURCE_AND_TRANSLATIONS: "SOURCE_AND_TRANSLATIONS"
};

const options = [
  {id: "1", label: "text.reader_option_menu.source", value: VIEW_MODES.SOURCE},
  {id: "2", label: "text.reader_option_menu.translation", value: VIEW_MODES.TRANSLATIONS},
  {id: "3", label: "text.reader_option_menu.source_with_translation", value: VIEW_MODES.SOURCE_AND_TRANSLATIONS}
]
const ViewSelector = (props) => {
  const {setShowViewSelector, viewMode, setViewMode} = props;
  const {t} = useTranslate();

  // ----------------------------- renderers ----------------------------
  const renderCloseIcon = () => {
    return <button className="view-selector-close-icon" onClick={() => setShowViewSelector(false)}>
      <MdClose size={18} style={{cursor: 'pointer'}}/>
    </button>
  }

  const renderViewModeOptions = () => {
    return options.map((option) => (
      <label key={option.id} className="radio-option subcontent">
        <input type="radio" name="view-mode" value={option.value} checked={viewMode === option.value}
          onChange={(e) => setViewMode(e.target.value)}/>
        <span>{t(option.label)}</span>
      </label>
    ))
  }
  return (
    <div className="view-selector-options-container">
      {renderCloseIcon()}
      {renderViewModeOptions()}
    </div>
  );
};

export default React.memo(ViewSelector);
