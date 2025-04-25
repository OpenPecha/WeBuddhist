import React, {useEffect, useRef} from "react";
import {Form} from "react-bootstrap";
import "./TranslationSource.scss";
import {useTranslate} from "@tolgee/react";
import {sourceTranslationOptionsMapper} from "../../../../utils/Constants.js";

const TranslationSource = ({selectedOption, onOptionChange, onClose}) => {
  const panelRef = useRef(null);
  const {t} = useTranslate()
  const options = [
    {id: sourceTranslationOptionsMapper.source, label: "text.reader_option_menu.source"},
    {id: sourceTranslationOptionsMapper.translation, label: "text.reader_option_menu.translation"},
    {id: sourceTranslationOptionsMapper.source_translation, label: "text.reader_option_menu.source_with_translation"},
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (optionId) => {
    if (optionId === sourceTranslationOptionsMapper.translation) {
      onOptionChange(optionId, "59769286-2787-4181-953d-9149cdeef959");
    } else {
      onOptionChange(optionId);
    }
    onClose();
  };
  
  return (
    <div 
      className="translation-source-panel" 
      ref={panelRef}
    >
      <div className="options-container">
        {options.map((option) => (
          <div key={option.id}>
            <Form.Check
              type="radio"
              id={option.id}
              name="viewOption"
              label={t(`${option.label}`)}
              checked={selectedOption === option.id}
              onChange={() => handleOptionSelect(option.id)}
              className="option-item navbaritems"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationSource;