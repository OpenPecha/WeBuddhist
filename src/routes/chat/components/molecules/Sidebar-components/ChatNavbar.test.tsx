import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, test } from "vitest";
import ChatNavbar from "./ChatNavbar";

describe("ChatNavbar Component", () => {
  const setup = (props?: { className?: string }) => {
    return render(<ChatNavbar {...props} />);
  };

  test("renders the WEBUDDHIST title", () => {
    setup();

    expect(screen.getByText("WEBUDDHIST")).toBeInTheDocument();
  });

  test("renders the RAG label", () => {
    setup();

    expect(screen.getByText("RAG")).toBeInTheDocument();
  });

  test("renders the version badge with 1.0.0", () => {
    setup();

    expect(screen.getByText("1.0.0")).toBeInTheDocument();
  });

  test("applies custom className when provided", () => {
    const { container } = setup({ className: "custom-test-class" });

    const navbar = container.firstChild as HTMLElement;
    expect(navbar).toHaveClass("custom-test-class");
  });

  test("has sticky positioning for fixed header behavior", () => {
    const { container } = setup();

    const navbar = container.firstChild as HTMLElement;
    expect(navbar).toHaveClass("sticky");
    expect(navbar).toHaveClass("top-0");
  });
});
