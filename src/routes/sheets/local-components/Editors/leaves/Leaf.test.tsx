import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Leaf from "./Leaf";

describe("Leaf Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "leaf-element" },
    children: "Sample text content",
    leaf: {
      bold: false,
      italic: false,
      underline: false,
    },
  };

  const setup = (props = {}) => {
    return render(<Leaf {...defaultProps} {...props} />);
  };

  test("renders with default styling and children content", () => {
    setup({
      attributes: {
        "data-testid": "leaf-element",
        "data-custom": "custom-value",
        className: "custom-class",
      },
    });

    const span = screen.getByTestId("leaf-element");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("data-custom", "custom-value");
    expect(span).toHaveClass("custom-class");
    expect(screen.getByText("Sample text content")).toBeInTheDocument();
  });

  test("applies all text formatting styles when leaf properties are true", () => {
    setup({
      leaf: { bold: true, italic: true, underline: true },
      children: "Formatted text",
    });

    const span = screen.getByTestId("leaf-element");
    expect(span).toHaveStyle({
      fontWeight: "bold",
      fontStyle: "italic",
      textDecoration: "underline",
    });
    expect(screen.getByText("Formatted text")).toBeInTheDocument();
  });
});
