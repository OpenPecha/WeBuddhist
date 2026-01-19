import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, test, vi } from "vitest";
import ChatNavbar from "./ChatNavbar";

vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: (props: React.ComponentProps<"button">) => (
    <button type="button" data-testid="sidebar-trigger" {...props} />
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

describe("ChatNavbar Component", () => {
  const setup = (props?: { className?: string }) =>
    render(<ChatNavbar {...props} />);

  test("renders the WEBUDDHIST title", () => {
    setup();
    // WEBUDDHIST is part of a larger textContent ("WEBUDDHIST ... RAG"), so match as substring
    expect(screen.getByText(/WEBUDDHIST/i)).toBeInTheDocument();
  });

  test("renders the RAG label", () => {
    setup();
    expect(screen.getByText(/^RAG$/)).toBeInTheDocument();
  });

  test("renders the version badge with 1.0.0", () => {
    setup();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
  });

  test("applies custom className when provided", () => {
    const { container } = setup({ className: "custom-test-class" });

    const navbar = container.firstElementChild as HTMLElement;
    expect(navbar).toHaveClass("custom-test-class");
  });

  test("has sticky positioning for fixed header behavior", () => {
    const { container } = setup();

    const navbar = container.firstElementChild as HTMLElement;
    expect(navbar).toHaveClass("sticky", "top-0");
  });
});
