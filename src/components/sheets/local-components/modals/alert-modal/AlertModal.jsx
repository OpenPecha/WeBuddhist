import React from 'react';
import './AlertModal.scss';
import pechaIcon from "../../../../../assets/icons/pecha_icon.png"
import { IoClose } from 'react-icons/io5';
import PropTypes from "prop-types";
const AlertModal = ({ type, message, onClose }) => {
  const isSuccess = type === 'success';

  return (
    <dialog className="alert-modal-overlay">
      <div className="alert-modal">  
        <div className="alert-modal-header">
          <img src={pechaIcon} alt="Pecha Icon" className="alert-modal-icon" />
          <span id="alert-modal-title" className="alert-modal-title">
            {isSuccess ? 'Success' : 'Error'}
          </span>
          <button className="close-button" onClick={onClose} >
            <IoClose />
          </button>
        </div>
        <div className="alert-modal-body">
          <p>{message}</p>
          {
            isSuccess && (
              <p className="alert-modal-timer">Redirecting soon...</p>
            )
          }
        </div>
      </div>
    </dialog>
  );
};

export default AlertModal;
AlertModal.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}