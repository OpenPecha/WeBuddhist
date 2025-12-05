import { createPortal } from 'react-dom';
import './SheetDelete.scss';
import { useTranslate } from '@tolgee/react';
import { FaTimes } from 'react-icons/fa';
import logo from '../../../../../assets/icons/pecha_icon.png';

export const SheetDeleteModal = ({ isOpen, onClose, onDelete, isLoading }) => {
  const { t } = useTranslate();
  if (!isOpen) return null;

  return createPortal(
    <div className="sheet-delete-modal-overlay">
      <div className="sheet-delete-modal-content">
        <div className="sheet-delete-header">
          <img src={logo} alt="Logo" className="sheet-delete-logo" />
          <h2 className="sheet-delete-title">{t('sheet.delete_header')}</h2>
          <button
            onClick={onClose}
            className="sheet-delete-close-button"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <p>{t('sheet.delete_warning_message')}</p>

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