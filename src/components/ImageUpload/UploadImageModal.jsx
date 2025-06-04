import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiUpload } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import './UploadImageModal.scss';

const UploadImageModal = ({ isOpen, onClose, onUpload }) => {
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      onUpload?.(acceptedFiles);
      onClose();
    }
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="image-upload-modal-backdrop">
      <div className="image-upload-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div {...getRootProps()} className="upload-area">
          <input {...getInputProps()} />
          <FiUpload />
          <p>Drag and drop images here, or click to select files</p>
        </div>
        
        <button className="upload-button" onClick={open}>
          Upload
        </button>
      </div>
    </div>,
    document.body
  );
};

// just for demo, can remove this after integration
const TestDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => setIsModalOpen(true)}>
        Test Upload
      </button>
      
      <UploadImageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={(files) => {
          console.log('Files uploaded:', files);
        }}
      />
    </div>
  );
};

export default UploadImageModal;
export { TestDemo };