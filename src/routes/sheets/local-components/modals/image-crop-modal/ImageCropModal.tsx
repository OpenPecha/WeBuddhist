import { useState, useCallback } from "react";
import type { ChangeEvent } from "react";
import Cropper, { type Area } from "react-easy-crop";

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: Area | null) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx || !pixelCrop) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image as CanvasImageSource,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
};

const ImageCropContent = ({
  imageSrc,
  onBack,
  onCropComplete,
  isProfilePage = false,
}: any) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels) {
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImageBlob as Blob | null);
    } catch (e) {
      console.error("Error cropping image:", e);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  const handleZoomChange = (e: ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  };

  const renderCropContainer = () => {
    return (
      <div className="relative flex-1 bg-gray-100 rounded mx-6">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          cropShape={isProfilePage ? "round" : "rect"}
          showGrid={true}
        />
      </div>
    );
  };

  const renderCropControls = () => {
    return (
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="mb-4 last:mb-0">
          <label
            htmlFor="zoom-slider"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
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
            className="w-full h-2 rounded-full bg-gray-300 opacity-70 hover:opacity-100 appearance-none cursor-pointer transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A9080E] accent-[#A9080E]"
          />
        </div>
      </div>
    );
  };

  const renderCropActions = () => {
    return (
      <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-600 bg-white transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="px-6 py-2 border rounded text-sm text-white bg-[#A9080E] border-[#A9080E] transition hover:bg-[#8a060a] hover:border-[#8a060a] disabled:bg-gray-300 disabled:border-gray-300 disabled:text-white disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A9080E]"
          onClick={handleCropConfirm}
          disabled={!croppedAreaPixels}
        >
          Apply Crop
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pt-4">
      {renderCropContainer()}
      {renderCropControls()}
      {renderCropActions()}
    </div>
  );
};

export default ImageCropContent;
