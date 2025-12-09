import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListItem from "./ListItem";

describe("ListItem Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "list-item-element" },
    children: "Sample list item content"
  };

  const setup = (props = {}) => {
    return render(<ListItem {...defaultProps} {...props} />);
  };

  test("renders list item with correct attributes and children", () => {
    setup({
      attributes: { 
        "data-testid": "list-item-element",
        "data-custom": "custom-value",
        className: "custom-class"
      },
      children: "Custom list item"
    });
    
    const li = screen.getByTestId("list-item-element");
    expect(li).toBeInTheDocument();
    expect(li).toHaveAttribute("data-custom", "custom-value");
    expect(li).toHaveClass("en-serif-text");
    expect(screen.getByText("Custom list item")).toBeInTheDocument();
  });
});
