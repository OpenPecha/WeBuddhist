import React, { useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import "./TranslationSource.scss";
import { useTranslate } from "@tolgee/react";

const TranslationSource = ({ selectedOption, onOptionChange, onClose }) => {
  const panelRef = useRef(null);
  const {t}=useTranslate()
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
  }, [onClose]);
  
  const options = [
    { id: "source", label: "text.reader_option_menu.source" },
    { id: "translation", label: "text.reader_option_menu.translation" },
    { id: "sourceWithTranslation", label: "text.reader_option_menu.source_with_translation" },
  ];
  
  const handleOptionSelect = (optionId) => {
    onOptionChange(optionId);
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