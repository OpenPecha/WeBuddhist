import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FaRegImages } from "react-icons/fa";
import { FaCropSimple } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data?: any, fileName?: string) => void;
  isCameFromProfile?: boolean;
}

const ImageUploadModal = ({
  open,
  onOpenChange,
  onUpload,
  isCameFromProfile = false,
}: ImageUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { id } = useParams<{ id?: string }>();
  const sheetId = id ?? "";

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setCroppedFile(null);
      setIsCropping(false);
      setIsUploading(false);
    }
  }, [open]);

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

  const renderUploadArea = () => {
    const rootProps = getRootProps({
      className:
        "mt-2 flex cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-gray-300 px-4 py-6 text-center transition hover:border-gray-500 focus:outline-none focus:ring-0 overflow-hidden",
    });

    return (
      <div {...rootProps} aria-label="Upload image area" tabIndex={0}>
        <FaRegImages className="text-2xl text-gray-500" />
        <input {...getInputProps()} />
        <p className="w-full truncate px-2 text-sm text-gray-600">
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
      <div className="mt-3 flex items-center justify-between gap-2 sm:gap-4 rounded border border-gray-200 p-3 sm:p-4 overflow-hidden">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded">
            <img
              src={imagePreviewUrl}
              className={imageClassName}
              alt="Selected"
            />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm text-gray-800">
              {selectedFile.name}
            </p>
            {croppedFile && (
              <span className="mt-1 inline-flex w-fit items-center rounded border border-red-700 px-1.5 py-0.5 text-[12px] font-normal text-red-700">
                Cropped
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-sm text-gray-600 transition hover:bg-gray-100 focus:outline-none"
            onClick={() => setIsCropping(true)}
            aria-label="Crop image"
          >
            <FaCropSimple />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded text-lg text-gray-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none"
            onClick={handleDeleteFile}
            aria-label="Remove selected image"
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
        className="mt-3 flex h-[42px] w-full items-center justify-center rounded bg-red-700 px-3 text-sm font-medium text-gray-50 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`w-[90%] max-w-[500px] overflow-hidden [&>button]:focus:outline-none [&>button]:focus:ring-0 [&>button]:focus-visible:outline-none [&>button]:focus-visible:ring-0 ${
          isCropping
            ? "h-[400px] flex flex-col p-0 [&>button]:hidden"
            : "p-6 pb-8 sm:p-6 sm:pb-8"
        }`}
      >
        {!isCropping && (
          <DialogHeader>
            <DialogTitle>
              {isCameFromProfile ? "Upload Profile Image" : "Upload Image"}
            </DialogTitle>
          </DialogHeader>
        )}
        {renderUploadSection()}
        {renderImageCropSection()}
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
