import React from 'react';
import { createPortal } from 'react-dom';
import './sheet-delete.scss';

export const SheetDeleteModal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="sheet-delete-modal-overlay">
      <div className="sheet-delete-modal-content">
        <button
          onClick={onClose}
          className="sheet-delete-close-button"
        >
          ×
        </button>
        <h2>Delete sheet</h2>
        <p>
          Deletion is not reversible, and the sheet will be completely deleted. If you do not
          want to delete, you can unlist the sheet.
        </p>
        <div className="sheet-delete-button-group">
          <button
            onClick={onClose}
            className="sheet-delete-cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="sheet-delete-delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};