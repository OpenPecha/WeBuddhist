import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ImageCropContent from "./ImageCropModal";
import "@testing-library/jest-dom";

// Mock react-easy-crop
vi.mock("react-easy-crop", () => ({
  __esModule: true,
  default: ({ image, crop, zoom, onCropChange, onCropComplete, onZoomChange }) => (
    <div data-testid="cropper-mock">
      <button onClick={() => onCropChange({ x: 10, y: 20 })}>Set Crop</button>
      <button onClick={() => onZoomChange(2)}>Set Zoom</button>
      <button onClick={() => onCropComplete(null, { x: 1, y: 2, width: 100, height: 100 })}>Complete Crop</button>
      <span>Image: {image}</span>
      <span>Zoom: {zoom}</span>
      <span>Crop: {JSON.stringify(crop)}</span>
    </div>
  ),
}));

describe("ImageCropContent", () => {
  const imageSrc = "test-image-url";
  const onBack = vi.fn();
  const onCropComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup(props = {}) {
    return render(
      <ImageCropContent
        imageSrc={imageSrc}
        onBack={onBack}
        onCropComplete={onCropComplete}
        {...props}
      />
    );
  }

  test("renders cropper and controls", () => {
    setup();
    expect(screen.getByTestId("cropper-mock")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply Crop/i })).toBeInTheDocument();
  });

  test("calls onBack when back button is clicked", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalled();
  });

  test("updates zoom when slider is changed", () => {
    setup();
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: 2 } });
    expect(slider.value).toBe("2");
  });


  test("disables Apply Crop button if no crop area", () => {
    setup();
    const applyBtn = screen.getByRole("button", { name: /Apply Crop/i });
    expect(applyBtn).toBeDisabled();
  });
});
