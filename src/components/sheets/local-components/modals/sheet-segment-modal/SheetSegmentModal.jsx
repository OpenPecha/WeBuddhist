import React from 'react';
import { IoClose } from "react-icons/io5";
import "./SheetSegmentModal.scss";

const SheetSegmentModal = ({ onClose, onSegment }) => {
  const renderModalHeader = () => {
    return (
      <>
        <p>Sheet Segment</p>
        <button
          className="close-button"
          onClick={onClose}
        >
          <IoClose />
        </button>
      </>
    );
  };

  const renderSegmentContent = () => {
    return (
      <div className="segment-content">
        <p>dummy</p>
      </div>
    );
  };

  return (
    <div className="sheet-segment-overlay" onClick={onClose}>
      <div
        className="sheet-segment-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModalHeader()}
        {renderSegmentContent()}
      </div>
    </div>
  );
};

export default SheetSegmentModal;