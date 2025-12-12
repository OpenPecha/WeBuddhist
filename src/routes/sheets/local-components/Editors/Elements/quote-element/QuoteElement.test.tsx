import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuoteElement from "./QuoteElement";

describe("QuoteElement Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "quote-element" },
    children: "Sample quote content",
    element: {},
  };

  const setup = (props = {}) => {
    return render(<QuoteElement {...defaultProps} {...props} />);
  };

  test("renders with complex children content", () => {
    const complexChildren = (
      <div>
        <strong>Bold text</strong> and <em>italic text</em>
      </div>
    );

    setup({
      children: complexChildren,
    });

    expect(screen.getByText("Bold text")).toBeInTheDocument();
    expect(screen.getByText("italic text")).toBeInTheDocument();
  });
});
