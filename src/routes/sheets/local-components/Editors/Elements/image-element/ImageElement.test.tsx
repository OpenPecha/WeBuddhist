import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageElement from "./ImageElement";

describe("ImageElement Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "image-element" },
    children: <span>Child content</span>,
    element: {
      src: "https://example.com/image.jpg",
      url: "https://example.com/image",
    },
  };

  const setup = (props = {}) => {
    return render(<ImageElement {...defaultProps} {...props} />);
  };

  test("renders image with correct attributes when src is provided", () => {
    setup();

    const image = screen.getByRole("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", defaultProps.element.src);
    expect(image).toHaveClass("sheet-image");
    expect(image).toHaveStyle({ maxWidth: "100%", height: "auto" });
  });

  test("renders fallback content with link when src is not provided but url exists", () => {
    setup({
      element: {
        ...defaultProps.element,
        src: null,
        error: "Image not found",
      },
    });

    expect(screen.getByText("Image link:")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/image")).toBeInTheDocument();
    expect(screen.getByText("(Error: Image not found)")).toBeInTheDocument();
  });

  test("renders fallback content with default text when both src and url are not provided", () => {
    setup({
      element: {
        ...defaultProps.element,
        src: null,
        url: null,
      },
    });

    expect(screen.getByText("Image link:")).toBeInTheDocument();
    expect(screen.getByText("Pasted image link")).toBeInTheDocument();
  });

  test("handles image load error by switching to fallback image", () => {
    setup();

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", defaultProps.element.src);
    fireEvent.error(image);

    // Check that the image src is changed to the fallback URL
    expect(image).toHaveAttribute(
      "src",
      "https://icrier.org/wp-content/uploads/2022/12/media-Event-Image-Not-Found.jpg",
    );
  });
});
