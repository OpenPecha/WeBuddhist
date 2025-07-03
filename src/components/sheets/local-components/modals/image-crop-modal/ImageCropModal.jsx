import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "./ImageCropModal.scss";
import PropTypes from "prop-types";
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
};

const ImageCropContent = ({ imageSrc, onBack, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  const handleZoomChange = (e) => {
    setZoom(Number(e.target.value));
  };

  const renderCropContainer = () => {
    return (
      <div className="crop-container">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          cropShape="rect"
          showGrid={true}
        />
      </div>
    );
  };

  const renderCropControls = () => {
    return (
      <div className="crop-controls">
        <div className="control-group">
          <label htmlFor="zoom-slider">
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            id="zoom-slider"
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="zoom-slider"
            onChange={handleZoomChange}
            className="slider"
          />
        </div>
      </div>
    );
  };

  const renderCropActions = () => {
    return (
      <div className="crop-actions">
        <button className="cancel-button" onClick={onBack}>
          Back
        </button>
        <button
          className="confirm-button"
          onClick={handleCropConfirm}
          disabled={!croppedAreaPixels}
        >
          Apply Crop
        </button>
      </div>
    );
  };

  return (
    <div className="crop-content">
      {renderCropContainer()}
      {renderCropControls()}
      {renderCropActions()}
    </div>
  );
};

export default ImageCropContent; 
ImageCropContent.propTypes = {
  imageSrc: PropTypes.string.isRequired, 
  onBack: PropTypes.func.isRequired, 
  onCropComplete: PropTypes.func.isRequired
}