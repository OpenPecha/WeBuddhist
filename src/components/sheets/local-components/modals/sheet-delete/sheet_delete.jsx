import React from 'react';
import { createPortal } from 'react-dom';

export const SheetDeleteModal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          onClick={onClose}
          className="close-button"
        >
          ×
        </button>
        <h2>Delete story</h2>
        <p>
          Deletion is not reversible, and the story will be completely deleted. If you do not
          want to delete, you can unlist the story.
        </p>
        <div className="button-group">
          <button
            onClick={onClose}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};