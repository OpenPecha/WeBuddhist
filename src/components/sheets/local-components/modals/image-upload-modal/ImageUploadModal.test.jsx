import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ImageUploadModal from "./ImageUploadModal";
import * as uploadFunctions from "./ImageUploadModal";
import "@testing-library/jest-dom";

// Mock axios config first
vi.mock("../../../../../config/axios-config", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { url: "http://test.com/image.jpg" } })
  }
}));

let mockOnDrop;
let mockGetRootProps;
let mockGetInputProps;

vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }) => {
    mockOnDrop = onDrop;
    mockGetRootProps = vi.fn(() => ({
      className: "upload-area",
      onClick: vi.fn(),
    }));
    mockGetInputProps = vi.fn(() => ({
      type: "file",
      accept: { "image/*": [] },
    }));
    return {
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
    };
  },
}));

const mockUseParams = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
  useLocation: () => mockUseLocation(),
}));

vi.mock("../image-crop-modal/ImageCropModal", () => ({
  __esModule: true,
  default: ({ onBack, onCropComplete }) => (
    <div data-testid="crop-modal">
      <button onClick={() => onCropComplete(new Blob(["cropped"], { type: "image/jpeg" }))}>Apply Crop</button>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Mock react-icons
vi.mock("react-icons/io5", () => ({
  IoClose: () => <span data-testid="close-icon">×</span>
}));

vi.mock("react-icons/fa", () => ({
  FaRegImages: () => <span data-testid="image-icon">📷</span>
}));

vi.mock("react-icons/fa6", () => ({
  FaCropSimple: ({ onClick }) => <span data-testid="crop-icon" onClick={onClick}>✂️</span>
}));

vi.mock("react-icons/md", () => ({
  MdDeleteOutline: ({ onClick }) => <span data-testid="delete-icon" onClick={onClick}>🗑️</span>
}));

describe("ImageUploadModal", () => {
  const onClose = vi.fn();
  const onUpload = vi.fn();
  const mockFile = new File(["dummy"], "test.png", { type: "image/png" });
  const mockUrl = "http://test.com/image.jpg";

  // Mock the upload functions using vi.spyOn after import
  let mockUploadImageToS3;
  let mockUploadProfileImage;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockUseParams.mockReturnValue({ id: "sheet123" });
    mockUseLocation.mockReturnValue({ pathname: "/sheets/sheet123" });

    // Mock the upload functions using vi.spyOn on the imported module
    mockUploadImageToS3 = vi.spyOn(uploadFunctions, 'UploadImageToS3').mockResolvedValue({ url: mockUrl });
    mockUploadProfileImage = vi.spyOn(uploadFunctions, 'uploadProfileImage').mockResolvedValue({ url: mockUrl });

    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete global.URL.createObjectURL;
    delete global.URL.revokeObjectURL;
  });

  test("renders modal and close button", () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
  });

  test("calls onClose when overlay or close button is clicked", () => {
    const { container } = render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    // Click overlay
    const overlay = container.querySelector(".image-upload-overlay");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click close button
    const closeButton = container.querySelector(".close-button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test("shows upload area and drag text", () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    expect(screen.getByText(/Drag and drop an image here/i)).toBeInTheDocument();
  });

  test("displays selected file information and upload button after file drop", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);

    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    expect(screen.getByRole("button", { name: "Upload Image" })).toBeInTheDocument();
    expect(screen.getByAltText("Selected")).toBeInTheDocument();
    expect(screen.getByText(mockFile.name)).toBeInTheDocument();
  });

  test("removes selected file when delete button clicked", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId("delete-icon");
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Drag and drop an image here/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByRole("button", { name: "Upload Image" })).not.toBeInTheDocument();
  });

  test("opens crop modal when crop button clicked", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const cropButton = screen.getByTestId("crop-icon");
    expect(cropButton).toBeInTheDocument();
    fireEvent.click(cropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
    });
  });

  test("updates image and shows cropped indicator after crop completion", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const cropButton = screen.getByTestId("crop-icon");
    fireEvent.click(cropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
    });
    
    const applyCropButton = screen.getByText("Apply Crop");
    fireEvent.click(applyCropButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId("crop-modal")).not.toBeInTheDocument();
    }); 
    
    await waitFor(() => {
      expect(screen.getByText("Cropped")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Upload Cropped Image")).toBeInTheDocument();
  });
  
  test("handles empty file drop gracefully", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
      
    if (mockOnDrop) {
      mockOnDrop([]);
    }
    
    expect(screen.getByText(/Drag and drop an image here/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Upload Image" })).not.toBeInTheDocument();
  });

  test("returns to file selection when crop back button clicked", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const cropButton = screen.getByTestId("crop-icon");
    fireEvent.click(cropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
    });
    
    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId("crop-modal")).not.toBeInTheDocument();
    });
    
    expect(screen.getByRole("button", { name: "Upload Image" })).toBeInTheDocument();
    expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
  });

  test("displays loading state when upload button clicked", async () => {
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Upload Image" })).toBeInTheDocument();
    });
    
    const uploadButton = screen.getByRole("button", { name: "Upload Image" });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Uploading..." })).toBeInTheDocument();
    });
  });

  test("renders profile page upload modal correctly", () => {
    mockUseLocation.mockReturnValue({ pathname: "/profile" });
    
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} isCameFromProfile={true} />);
    expect(screen.getByText("Upload Profile Image")).toBeInTheDocument();
  });
  
  test("handles upload error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUploadImageToS3.mockRejectedValue(new Error('Upload failed'));
    
    render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Upload Image" })).toBeInTheDocument();
    });
    
    const uploadButton = screen.getByRole("button", { name: "Upload Image" });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Upload failed', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

});