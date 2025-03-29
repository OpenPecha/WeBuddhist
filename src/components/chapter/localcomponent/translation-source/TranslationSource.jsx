import React, { useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import "./TranslationSource.scss";

const TranslationSource = ({ selectedOption, onOptionChange, onClose }) => {
  const panelRef = useRef(null);
  
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
    { id: "source", label: "Source" },
    { id: "translation", label: "Translation" },
    { id: "sourceWithTranslation", label: "Source with Translation" },
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
              label={option.label}
              checked={selectedOption === option.id}
              onChange={() => handleOptionSelect(option.id)}
              className="option-item"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationSource;