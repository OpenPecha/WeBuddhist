import React, {useEffect, useRef} from "react";
import {Form} from "react-bootstrap";
import "./TranslationSource.scss";
import {useTranslate} from "@tolgee/react";
import {SOURCE_TRANSLATION_OPTIONS_MAPPER} from "../../../../utils/constants.js";
import { usePanelContext } from "../../../../context/PanelContext.jsx";
import PropTypes from "prop-types";

const TranslationSource = ({selectedOption, onOptionChange, onClose, hasTranslation = false}) => {
  const { closeResourcesPanel } = usePanelContext();
  const panelRef = useRef(null);
  const {t} = useTranslate()
  const options = [
    {id: SOURCE_TRANSLATION_OPTIONS_MAPPER.source, label: "text.reader_option_menu.source", disabled: false},
    {id: SOURCE_TRANSLATION_OPTIONS_MAPPER.translation, label: "text.reader_option_menu.translation", disabled: !hasTranslation},
    {id: SOURCE_TRANSLATION_OPTIONS_MAPPER.source_translation, label: "text.reader_option_menu.source_with_translation", disabled: !hasTranslation},
  ];

  useEffect(() => {
    closeResourcesPanel();
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeResourcesPanel]);

  const handleOptionSelect = (optionId) => {
    const option = options.find(opt => opt.id === optionId);
    if (option && !option.disabled) {
      onOptionChange(optionId);
      onClose();
    }
  };
  
  return (
    <div 
      className="translation-source-panel" 
      ref={panelRef}
    >
      <div className="options-container ">
        {options.map((option) => (
          <div key={option.id}>
            <Form.Check
              type="radio"
              id={option.id}
              name="viewOption"
              label={t(`${option.label}`)}
              checked={selectedOption === option.id}
              onChange={() => handleOptionSelect(option.id)}
              className={`option-item navbaritems ${option.disabled ? 'disabled-option' : ''}`}
              disabled={option.disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationSource;
TranslationSource.propTypes = {
  selectedOption: PropTypes.string.isRequired, 
  onOptionChange: PropTypes.func.isRequired, 
  onClose: PropTypes.func.isRequired, 
  hasTranslation: PropTypes.bool.isRequired
}