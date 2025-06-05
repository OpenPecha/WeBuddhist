import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import "./ImageUpload.scss";
import {  FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
const ImageUploadModal = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCropping,setIsCropping] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
  });

  const handleFile = (file) => {
    if (!file) return;
    onUpload(file);
  };

  return (
    <div
      className="image-upload-overlay"
      onClick={onClose}
      tabIndex={0}
      aria-label="Close image upload modal"
      role="dialog"
    >
      <div
        className="image-upload-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
        aria-modal="true"
        role="document"
      >
        <p>Upload Image</p>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close"
        >
          <IoClose />
        </button>

        {/* Show upload area when not cropping */}
        {!isCropping && (
          <>
            <div {...getRootProps()} className="upload-area">
              <FaRegImages />
              <input {...getInputProps()} />
              <p>
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : "Drag and drop an image here, or click to select"}
              </p>
            </div>
            {selectedFile && (
              <>
                <div className="selected-file-container-wrapper">
                <div className="selected-file-info">
                    <div className="selected-file-container">
                    <img src={URL.createObjectURL(selectedFile)} className="selected-file-image" alt="Selected" />
                    </div>
                    <p>{selectedFile.name}</p>
                  </div>
                  <div className="selected-file-actions">
                    <FaCropSimple onClick={() => setIsCropping(prev => !prev)} />
                    <MdDeleteOutline 
                      size={20} 
                      className="delete-icon" 
                      onClick={() => setSelectedFile(null)} 
                    />
                  </div>
                </div>
                <button
                  className="upload-button"
                  onClick={() => handleFile(selectedFile)}
                  aria-label="Upload selected image"
                >
                  Upload
                </button>
              </>
            )}
          </>
        )}

        {isCropping && (
          <div className="cropping-overlay">
            <div className="cropping-content">
              <h2>Crop Image</h2>
              <button onClick={() => setIsCropping(prev => !prev)}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadModal; 