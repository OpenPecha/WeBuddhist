import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CodeElement from "./CodeElement";

describe("CodeElement Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "code-element" },
    children: "const example = 'test';",
    element: { align: "left" },
  };

  const setup = (props = {}) => {
    return render(<CodeElement {...defaultProps} {...props} />);
  };

  test("defaults to left alignment when no align specified", () => {
    setup({ element: {} });

    const preElement = screen.getByTestId("code-element");
    expect(preElement).toHaveStyle({ textAlign: "left" });
  });

  test("passes through attributes", () => {
    setup({
      attributes: {
        "data-testid": "code-element",
        "data-custom": "value",
        className: "custom-class",
      },
    });

    const preElement = screen.getByTestId("code-element");
    expect(preElement).toHaveAttribute("data-custom", "value");
    expect(preElement).toHaveClass("custom-class");
  });
});
