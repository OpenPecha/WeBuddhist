import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import "./ImageUpload.scss";
import {  FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import ImageCropContent from "../image-crop-modal/ImageCropModal";

const ImageUploadModal = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedFile, setCroppedFile] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setCroppedFile(null);
      }
    },
  });

  const handleFile = (file) => {
    if (!file) return;
    onUpload(file);
  };

  const handleCropComplete = (croppedImageBlob) => {
    if (croppedImageBlob) {
      const croppedFile = new File([croppedImageBlob], selectedFile.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      setCroppedFile(croppedFile);
    }
    setIsCropping(false);
  };

  const displayFile = croppedFile || selectedFile;
  const imageToDisplay = displayFile ? URL.createObjectURL(displayFile) : null;

  return (
    <div
      className="image-upload-overlay"
      onClick={onClose}
    >
      <div
        className={`image-upload-modal ${isCropping ? 'cropping-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
       
       { !isCropping && (
        <> 
        <p>Upload Image</p>
        <button
          className="close-button"
          onClick={onClose}
        >
          <IoClose />
        </button>
        </>
       )
       }
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
                      <img 
                        src={imageToDisplay} 
                        className="selected-file-image" 
                        alt="Selected" 
                      />
                    </div>
                    <div className="selected-file-name">
                      <span>{selectedFile.name}</span>
                      {croppedFile && (
                        <span className="cropped-indicator">Cropped</span>
                      )}
                    </div>
                     
                  </div>
                  <div className="selected-file-actions">
                    <FaCropSimple 
                      onClick={() => setIsCropping(true)}
                      className="crop-icon"
                    />
                    <MdDeleteOutline 
                      size={20} 
                      className="delete-icon" 
                      onClick={() =>( setSelectedFile(null), setCroppedFile(null))}
                    />
                  </div>
                </div>
                <button
                  className="upload-button"
                  onClick={() => handleFile(displayFile)}
                >
                  Upload {croppedFile ? 'Cropped ' : ''}Image
                </button>
              </>
            )}
          </>
        )}

        {isCropping && selectedFile && (
          <ImageCropContent
            imageSrc={URL.createObjectURL(selectedFile)}
            onBack={() => setIsCropping(false)}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ImageUploadModal; 