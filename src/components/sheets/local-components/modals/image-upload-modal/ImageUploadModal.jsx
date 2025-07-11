import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import {  FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import ImageCropContent from "../image-crop-modal/ImageCropModal";
import axiosInstance from "../../../../../config/axios-config";
import { useParams, useLocation } from "react-router-dom";
import "./ImageUpload.scss";
import PropTypes from "prop-types";
export const UploadImageToS3= async(file,sheetId)=>{
  const formData= new FormData();
  formData.append("file", file);
  const {data}= await axiosInstance.post(`/api/v1/sheets/upload`,formData,
    {
      params:{
        ...(sheetId && {sheet_id:sheetId})
      }
    }
  );
  return data;
}

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post("api/v1/users/upload", formData);
  return data;
}
const ImageUploadModal = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedFile, setCroppedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const {id}=useParams();
  const location = useLocation();
  const sheetId=id || "";
  const isProfilePage = location.pathname === '/profile';
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setCroppedFile(null);
      }
    },
  });

  const handleFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      let data;
      if (isProfilePage) {
        data = await uploadProfileImage(file);
        onUpload(data, file.name);
      } else {
        data = await UploadImageToS3(file, sheetId);
        if (data && data.url) {
          onUpload(data.url, file.name);
        }
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
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

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setCroppedFile(null);
  };

  const displayFile = croppedFile || selectedFile;
  const imageToDisplay = displayFile ? URL.createObjectURL(displayFile) : null;

  const renderModalHeader = () => {
    if (isCropping) return null;

    return (
      <>
       {isProfilePage ? <p>Upload Profile Image</p> : <p>Upload Image</p>}
        <button
          className="close-button"
          onClick={onClose}
        >
          <IoClose />
        </button>
      </>
    );
  };

  const renderUploadArea = () => {
    return (
      <div {...getRootProps()} className="upload-area">
        <FaRegImages />
        <input {...getInputProps()} />
        <p>
          {selectedFile
            ? `Selected: ${selectedFile.name}`
            : "Drag and drop an image here, or click to select"}
        </p>
      </div>
    );
  };

  const renderSelectedFileInfo = () => {
    if (!selectedFile) return null;

    return (
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
            onClick={handleDeleteFile}
          />
        </div>
      </div>
    );
  };

  const renderUploadButton = () => {
    if (!selectedFile) return null;

    return (
      <button
        className="upload-button"
        onClick={() => handleFile(displayFile)}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : `Upload ${croppedFile ? 'Cropped ' : ''}Image`}
      </button>
    );
  };

  const renderUploadSection = () => {
    if (isCropping) return null;

    return (
      <>
        {renderUploadArea()}
        {renderSelectedFileInfo()}
        {renderUploadButton()}
      </>
    );
  };

  const renderImageCropSection = () => {
    if (!isCropping || !selectedFile) return null;

    return (
      <ImageCropContent
        imageSrc={URL.createObjectURL(selectedFile)}
        onBack={() => setIsCropping(false)}
        onCropComplete={handleCropComplete}
        isProfilePage={isProfilePage}
      />
    );
  };

  return (
    <div className="image-upload-overlay" onClick={onClose}>
      <div
        className={`image-upload-modal ${isCropping ? 'cropping-mode' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {renderModalHeader()}
        {renderUploadSection()}
        {renderImageCropSection()}
      </div>
    </div>
  );
};

export default ImageUploadModal;
ImageUploadModal.propTypes={
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
}; 