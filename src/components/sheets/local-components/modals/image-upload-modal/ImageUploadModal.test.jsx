import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ImageUploadModal, { UploadImageToS3 } from "./ImageUploadModal";
import "@testing-library/jest-dom";

vi.mock("./ImageUploadModal", async () => {
  const actual = await vi.importActual("./ImageUploadModal");
  return {
    ...actual,
    UploadImageToS3: vi.fn()
  };
});
let mockOnDrop;
vi.mock("react-dropzone", () => ({
  useDropzone: ({ onDrop }) => {
    mockOnDrop = onDrop; 
    return {
      getRootProps: () => ({
        onClick: vi.fn(),
      }),
      getInputProps: () => ({
        onChange: vi.fn(),
        type: "file",
        accept: { "image/*": [] },
      }),
    };
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "sheet123" }),
  };
});

vi.mock("../image-crop-modal/ImageCropModal", () => ({
  __esModule: true,
  default: ({ onBack, onCropComplete }) => (
    <div data-testid="crop-modal">
      <button onClick={() => onCropComplete(new Blob(["cropped"], { type: "image/jpeg" }))}>Apply Crop</button>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock("../../../../../config/axios-config", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { url: "http://test.com/image.jpg" } })
  }
}));

describe("ImageUploadModal", () => {
  const onClose = vi.fn();
  const onUpload = vi.fn();
  const mockFile = new File(["dummy"], "test.png", { type: "image/png" });
  const mockUrl = "http://test.com/image.jpg";

  beforeEach(() => {
    vi.clearAllMocks();
    UploadImageToS3.mockResolvedValue({ url: mockUrl });

    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    delete global.URL.createObjectURL;
    delete global.URL.revokeObjectURL;
  });

  const setup = () => {
    const utils = render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    return {
      ...utils,
      uploadFile: async () => {
        const input = screen.getByRole("button").parentElement.querySelector('input[type="file"]');
        Object.defineProperty(input, "files", {
          value: [mockFile],
          configurable: true,
        });
        fireEvent.change(input);
        return mockFile;
      },
    };
  };

  test("renders modal and close button", () => {
    setup();
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
  });

  test("calls onClose when overlay or close button is clicked", () => {
    setup();
    fireEvent.click(screen.getByText("Upload Image").closest(".image-upload-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test("shows upload area and drag text", () => {
    setup();
    expect(screen.getByText(/Drag and drop an image/i)).toBeInTheDocument();
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
    const { container } = render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const deleteButton = container.querySelector('.delete-icon');
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Drag and drop an image here/i)).toBeInTheDocument();
    });
    
    expect(screen.queryByRole("button", { name: "Upload Image" })).not.toBeInTheDocument();
  });

  test("opens crop modal when crop button clicked", async () => {
    const { container } = render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const cropButton = container.querySelector('.crop-icon');
    expect(cropButton).toBeInTheDocument();
    
    fireEvent.click(cropButton);
    
    await waitFor(() => {
      expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
    });
  });

  test("updates image and shows cropped indicator after crop completion", async () => {
    const { container } = render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const cropButton = container.querySelector('.crop-icon');
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
    const { container } = render(<ImageUploadModal onClose={onClose} onUpload={onUpload} />);
    
    if (mockOnDrop) {
      mockOnDrop([mockFile]);
    }
    
    await waitFor(() => {
      expect(screen.getByText(`Selected: ${mockFile.name}`)).toBeInTheDocument();
    });
    
    const cropButton = container.querySelector('.crop-icon');
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

    expect(screen.getByRole("button", { name: "Uploading..." })).toBeInTheDocument();
  });
});
