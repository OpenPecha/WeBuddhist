import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DefaultElement from "./DefaultElement";
import { vi } from "vitest";

vi.mock('../../../../../../utils/Constants', () => ({
  getLanguageClass: vi.fn(() => 'en-class')
}));

vi.mock('slate-react', () => ({
  useSelected: vi.fn()
}));

vi.mock("react-icons/md", () => ({
  MdDragIndicator: (props) => <span data-testid="drag-indicator" {...props}>Drag</span>
}));

import { useSelected } from 'slate-react';
import {getLanguageClass} from "../../../../../../utils/helperFunctions.jsx";

describe("DefaultElement Component", () => {
  const defaultProps = {
    attributes: { "data-testid": "default-element" },
    children: "Sample text content",
    element: {}
  };

  const setup = (props = {}) => {
    return render(<DefaultElement {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSelected.mockReturnValue(false);
    getLanguageClass.mockReturnValue('en-class');
  });

  test("applies custom alignment when specified", () => {
    setup({
      element: { align: "center" }
    });
    
    const paragraph = screen.getByTestId("default-element");
    expect(paragraph).toHaveStyle({
      textAlign: "center",
      whiteSpace: "pre-wrap"
    });
  });

  test("shows drag indicator when element is selected", () => {
    useSelected.mockReturnValue(true);
    setup();
    
    expect(screen.getByTestId("drag-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("drag-indicator")).toHaveClass("newline-indicator");
  });
});