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

vi.mock("react-dropzone", () => ({
  useDropzone: () => ({
    getRootProps: () => ({
      onClick: vi.fn(),
    }),
    getInputProps: () => ({
      onChange: vi.fn(),
      type: "file",
      accept: { "image/*": [] },
    }),
  }),
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

});