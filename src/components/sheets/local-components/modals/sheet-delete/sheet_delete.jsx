import React from 'react';
import { createPortal } from 'react-dom';
import './sheet-delete.scss';
import { useTranslate } from '@tolgee/react';
import { FaTimes } from 'react-icons/fa';

export const SheetDeleteModal = ({ isOpen, onClose, onDelete, isLoading }) => {
  const {t}=useTranslate();
  if (!isOpen) return null;

  return createPortal(
    <div className="sheet-delete-modal-overlay">
      <div className="sheet-delete-modal-content">
        <button
          onClick={onClose}
          className="sheet-delete-close-button"
          disabled={isLoading}
        >
          <FaTimes />
        </button>
        <h2>{t('sheet.delete_header')}</h2>
        <p>
          {t('sheet.delete_warning_message')}
        </p>
        <div className="sheet-delete-button-group">
          <button
            onClick={onClose}
            className="sheet-delete-cancel-button"
            disabled={isLoading}
          >
            {t('sheet.delete_cancel')}
          </button>
          <button
            onClick={onDelete}
            className="sheet-delete-delete-button"
            disabled={isLoading}
          >
            {isLoading ? t('sheet.deleting.message') : t('sheet.delete_button')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};