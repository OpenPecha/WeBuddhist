import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Heading from "./Heading";

describe("Heading Component", () => {
  const defaultProps = {
    as: "h1",
    attributes: { "data-testid": "heading-element" },
    children: "Sample heading content",
    element: { align: "left" }
  };

  const setup = (props = {}) => {
    return render(<Heading {...defaultProps} {...props} />);
  };

  test("renders h1 element with correct attributes and styling", () => {
    setup({
      as: "h1",
      element: { align: "center" }
    });
    
    const h1 = screen.getByTestId("heading-element");
    expect(h1).toBeInTheDocument();
    expect(h1.tagName).toBe("H1");
    expect(h1).toHaveStyle({ textAlign: "center" });
    expect(screen.getByText("Sample heading content")).toBeInTheDocument();
  });

  test("renders h2 element with correct attributes and styling", () => {
    setup({
      as: "h2",
      element: { align: "right" },
      children: "H2 Heading"
    });
    
    const h2 = screen.getByTestId("heading-element");
    expect(h2).toBeInTheDocument();
    expect(h2.tagName).toBe("H2");
    expect(h2).toHaveStyle({ textAlign: "right" });
    expect(screen.getByText("H2 Heading")).toBeInTheDocument();
  });

  test("renders p element as default when as prop is not h1 or h2", () => {
    setup({
      as: "h3",
      element: { align: "justify" },
      children: "Default paragraph"
    });
    
    const p = screen.getByTestId("heading-element");
    expect(p).toBeInTheDocument();
    expect(p.tagName).toBe("P");
    expect(p).toHaveStyle({ textAlign: "justify" });
    expect(screen.getByText("Default paragraph")).toBeInTheDocument();
  });
});
