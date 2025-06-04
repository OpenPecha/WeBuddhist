import React from "react";
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import "./ImageUpload.scss";
import { FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
const ImageUploadModal = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = React.useState(null);

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
        <div {...getRootProps()} className="upload-area">
            <FaRegImages/>
          <input {...getInputProps()} />
          <p>
            {selectedFile
              ? `Selected: ${selectedFile.name}`
              : "Drag and drop an image here, or click to select"}
          </p>
        </div>
        {
            selectedFile && (
                <>
                <div className="selected-file-container-wrapper">
                <div className="selected-file-info">
                    <div className="selected-file-container">
                    <img src={URL.createObjectURL(selectedFile)} className="selected-file-image" alt="Selected" />
                    </div>
                    <p> {selectedFile.name}</p>
                </div>
                <FaCropSimple/>
                </div>
                 <button
                 className="upload-button"
                 onClick={() => handleFile(selectedFile)}
                 aria-label="Upload selected image"
               >
                 Upload
               </button>
               </>
            )
        }
      </div>
    </div>
  );
};

export default ImageUploadModal; 