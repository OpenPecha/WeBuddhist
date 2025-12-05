import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import {  FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import ImageCropContent from "../image-crop-modal/ImageCropModal";
import axiosInstance from "../../../../../config/axios-config";
import { useParams } from "react-router-dom";
import "./ImageUpload.scss";
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
const ImageUploadModal = ({ onClose, onUpload, isCameFromProfile = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedFile, setCroppedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const {id}=useParams();
  const sheetId=id || "";
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
      if (isCameFromProfile) {
        data = await uploadProfileImage(file);
        onUpload(data, file.name);
      } else {
        data = await UploadImageToS3(file, sheetId);
        if (data?.url) {
          onUpload(data, file.name);
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
       {isCameFromProfile ? <p>Upload Profile Image</p> : <p>Upload Image</p>}
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
              className={croppedFile ? "selected-file-image-cropped" : "selected-file-image"}
              alt="Selected" 
            />
          </div>
          <div className="selected-file-name">
            <span className="filename-text">{selectedFile.name}</span>
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
    const imageStatus = croppedFile ? 'Cropped ' : '';
    const buttonText = isUploading ? 'Uploading...' : `Upload ${imageStatus}Image`;
    return (
      <button
        className="upload-button"
        onClick={() => handleFile(displayFile)}
        disabled={isUploading}
      >
        {buttonText}
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
        isProfilePage={isCameFromProfile}
      />
    );
  };

  return (
    <div className="image-upload-overlay">
      <dialog
        className={`image-upload-modal ${isCropping ? 'cropping-mode' : ''}`}
        open
      >
        {renderModalHeader()}
        {renderUploadSection()}
        {renderImageCropSection()}
      </dialog>
    </div>
  );
};

export default ImageUploadModal;