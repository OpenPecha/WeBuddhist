import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomPecha from "./CustomPecha";

describe("CustomPecha Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "custom-webuddhist" },
    children: null,
    element: {
      src: "https://example.com/image.jpg",
      url: "https://example.com/link",
      segmentId: "segment-123"
    }
  };

  const setup = (props = {}) => {
    return render(<CustomPecha {...defaultProps} {...props} />);
  };

  test("returns null when no src provided", () => {
    const { container } = setup({ element: {} });
    expect(container.firstChild).toBeNull();
  });

  test("renders with correct structure and attributes", () => {
    setup();
    
    const container = screen.getByTestId("custom-webuddhist");
    expect(container).toHaveClass("custom-webuddhist-container");
    
    const wrapper = container.querySelector(".custom-webuddhist-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute("contentEditable", "false");
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveClass("custom-webuddhist-link");
    
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(image).toHaveAttribute("alt", "segment-123");
    expect(image).toHaveClass("custom-webuddhist-image");
  });
});