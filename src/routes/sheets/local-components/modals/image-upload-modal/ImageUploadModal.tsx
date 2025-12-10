import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { useParams } from "react-router-dom";
import ImageCropContent from "../image-crop-modal/ImageCropModal";
import axiosInstance from "@/config/axios-config.ts";

export const UploadImageToS3 = async (file: File, sheetId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post(`/api/v1/sheets/upload`, formData, {
    params: {
      ...(sheetId && { sheet_id: sheetId }),
    },
  });
  return data;
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post("api/v1/users/upload", formData);
  return data;
};

const ImageUploadModal = ({
  onClose,
  onUpload,
  isCameFromProfile = false,
}: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams<{ id?: string }>();
  const sheetId = id ?? "";

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0];
      if (!file) return;
      setSelectedFile(file);
      setCroppedFile(null);
    },
  });

  const handleFile = async (file: File | null) => {
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
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    if (!selectedFile) return;
    if (croppedImageBlob) {
      const cropped = new File([croppedImageBlob], selectedFile.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
      setCroppedFile(cropped);
    }
    setIsCropping(false);
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setCroppedFile(null);
  };

  const displayFile = croppedFile ?? selectedFile;
  const imagePreviewUrl = displayFile ? URL.createObjectURL(displayFile) : "";

  const renderModalHeader = () => {
    if (isCropping) return null;

    return (
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-medium text-gray-800">
          {isCameFromProfile ? "Upload Profile Image" : "Upload Image"}
        </p>
        <button
          type="button"
          className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          onClick={onClose}
          aria-label="Close upload modal"
        >
          <IoClose />
        </button>
      </div>
    );
  };

  const renderUploadArea = () => {
    const rootProps = getRootProps({
      className:
        "mt-4 flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-gray-300 px-4 py-8 text-center transition hover:border-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
    });

    return (
      <div {...rootProps} aria-label="Upload image area" tabIndex={0}>
        <FaRegImages className="text-2xl text-gray-500" />
        <input {...getInputProps()} />
        <p className="truncate text-sm text-gray-600">
          {selectedFile
            ? `Selected: ${selectedFile.name}`
            : "Drag and drop an image here, or click to select"}
        </p>
      </div>
    );
  };

  const renderSelectedFileInfo = () => {
    if (!selectedFile) return null;

    const imageClassName = croppedFile
      ? "h-12 w-12 rounded-full object-cover"
      : "h-12 w-12 rounded object-cover";

    return (
      <div className="mt-4 flex items-center justify-between gap-4 rounded border border-gray-200 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded">
            <img
              src={imagePreviewUrl}
              className={imageClassName}
              alt="Selected"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm text-gray-800">
              {selectedFile.name}
            </span>
            {croppedFile && (
              <span className="mt-1 inline-flex w-fit items-center rounded border border-red-700 px-1.5 py-0.5 text-[12px] font-normal text-red-700">
                Cropped
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 text-lg text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            onClick={() => setIsCropping(true)}
            aria-label="Crop image"
            tabIndex={0}
          >
            <FaCropSimple />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded border border-gray-200 text-lg text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            onClick={handleDeleteFile}
            aria-label="Remove selected image"
            tabIndex={0}
          >
            <MdDeleteOutline />
          </button>
        </div>
      </div>
    );
  };

  const renderUploadButton = () => {
    if (!selectedFile) return null;
    const imageStatus = croppedFile ? "Cropped " : "";
    const buttonText = isUploading
      ? "Uploading..."
      : `Upload ${imageStatus}Image`;

    return (
      <button
        type="button"
        className="mt-4 flex h-[42px] w-full items-center justify-center rounded bg-red-700 px-3 text-sm font-medium text-gray-50 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
        onClick={() => handleFile(displayFile)}
        disabled={isUploading}
        aria-busy={isUploading}
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

  const modalClasses = `relative h-[400px] w-[90%] max-w-[500px] rounded-lg border-0 bg-white ${
    isCropping ? "flex flex-col p-0" : "p-8"
  }`;

  return (
    <div className="fixed inset-0 z-2001 flex items-center justify-center bg-black/50">
      <dialog className={modalClasses} open>
        {renderModalHeader()}
        {renderUploadSection()}
        {renderImageCropSection()}
      </dialog>
    </div>
  );
};

export default ImageUploadModal;
