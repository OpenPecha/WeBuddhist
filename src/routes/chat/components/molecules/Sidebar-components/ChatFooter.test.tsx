import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, test } from "vitest";
import ChatFooter from "./ChatFooter";

describe("ChatFooter Component", () => {
  const setup = () => {
    return render(<ChatFooter />);
  };

  test("renders the warning message", () => {
    setup();

    expect(
      screen.getByText(
        /Output may contain errors\. Verify important information using additional sources\./i,
      ),
    ).toBeInTheDocument();
  });

  test("renders the warning icon", () => {
    const { container } = setup();

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  test("has centered layout with background styling", () => {
    const { container } = setup();

    const footerDiv = container.firstChild as HTMLElement;
    expect(footerDiv).toHaveClass("flex");
    expect(footerDiv).toHaveClass("justify-center");
    expect(footerDiv).toHaveClass("bg-background");
  });
});
