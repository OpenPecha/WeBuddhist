import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DefaultElement from "./DefaultElement.js";
import { vi, describe, beforeEach, test, expect, type Mock } from "vitest";

import { useSelected } from "slate-react";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.js";

vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: vi.fn(() => "en-class"),
}));

vi.mock("slate-react", () => ({
  useSelected: vi.fn(),
}));

vi.mock("react-icons/md", () => ({
  MdDragIndicator: (props: any) => (
    <span data-testid="drag-indicator" {...props}>
      Drag
    </span>
  ),
}));

describe("DefaultElement Component", () => {
  const mockUseSelected = useSelected as unknown as Mock;
  const mockGetLanguageClass = getLanguageClass as unknown as Mock;

  const defaultProps: any = {
    attributes: { "data-testid": "default-element" },
    children: "Sample text content",
    element: {},
  };

  const setup = (props: any = {}) => {
    return render(<DefaultElement {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelected.mockReturnValue(false);
    mockGetLanguageClass.mockReturnValue("en-class");
  });

  test("applies custom alignment when specified", () => {
    setup({
      element: { align: "center" },
    });

    const paragraph = screen.getByTestId("default-element");
    expect(paragraph).toHaveStyle({
      textAlign: "center",
      whiteSpace: "pre-wrap",
    });
  });

  test("shows drag indicator when element is selected", () => {
    mockUseSelected.mockReturnValue(true);
    setup();

    const indicator = screen.getByTestId("drag-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator.className).toContain("absolute");
  });
});
