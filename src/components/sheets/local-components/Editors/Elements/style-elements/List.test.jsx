import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import List from "./List";

describe("List Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "list-element" },
    children: "Sample list content",
    element: { type: "unordered-list", align: "left" }
  };

  const setup = (props = {}) => {
    return render(<List {...defaultProps} {...props} />);
  };

  test("renders ordered list with correct styling and attributes", () => {
    setup({
      element: { type: "ordered-list", align: "right" },
      children: "Ordered list items"
    });
    
    const ol = screen.getByTestId("list-element");
    expect(ol).toBeInTheDocument();
    expect(ol.tagName).toBe("OL");
    expect(ol).toHaveStyle({
      paddingLeft: "2em",
      margin: "0.5em 0",
      textAlign: "right"
    });
    expect(screen.getByText("Ordered list items")).toBeInTheDocument();
  });

  test("renders unordered list with default styling and attributes", () => {
    setup({
      element: { type: "unordered-list" }
    });
    
    const ul = screen.getByTestId("list-element");
    expect(ul).toBeInTheDocument();
    expect(ul.tagName).toBe("UL");
    expect(ul).toHaveStyle({
      paddingLeft: "2em",
      margin: "0.5em 0",
      textAlign: "left"
    });
    expect(screen.getByText("Sample list content")).toBeInTheDocument();
  });
});
