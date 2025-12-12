import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListItem from "./ListItem";
import { describe, test, expect } from "vitest";

describe("ListItem Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "list-item-element" },
    children: "Sample list item content",
  };

  const setup = (props: any = {}) => {
    return render(<ListItem {...defaultProps} {...props} />);
  };

  test("renders list item with correct attributes and children", () => {
    setup({
      attributes: {
        "data-testid": "list-item-element",
        "data-custom": "custom-value",
        className: "custom-class",
      },
      children: "Custom list item",
    });

    const li = screen.getByTestId("list-item-element");
    expect(li).toBeInTheDocument();
    expect(li).toHaveAttribute("data-custom", "custom-value");
    expect(li).toHaveClass("custom-class");
    expect(screen.getByText("Custom list item")).toBeInTheDocument();
  });

  test("applies text alignment style when element align is provided", () => {
    setup({
      element: { align: "center" },
    });

    const li = screen.getByTestId("list-item-element");
    expect(li).toHaveStyle({ textAlign: "center" });
  });
});
