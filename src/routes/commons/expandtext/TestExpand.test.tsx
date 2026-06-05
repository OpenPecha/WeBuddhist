import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TextExpand from "./TextExpand";

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

const setup = (props: {
  children: string;
  maxLength: number;
  language: string;
}) => {
  return render(<TextExpand {...props} />);
};

describe("TextExpand", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when children is empty string", () => {
    const { container } = setup({
      children: "",
      maxLength: 50,
      language: "en",
    });
    expect(container.firstChild).toBeNull();
  });

  it("renders full text when shorter than maxLength", () => {
    setup({ children: "Short text", maxLength: 50, language: "en" });
    expect(screen.getByText("Short text")).toBeInTheDocument();
    expect(screen.queryByText("panel.showmore")).not.toBeInTheDocument();
  });

  it("expands and collapses text on button click", () => {
    const longText = "This is a very long text that exceeds the max length";
    setup({ children: longText, maxLength: 20, language: "en" });

    const button = screen.getByText("panel.showmore");
    fireEvent.click(button);
    expect(screen.getByText("panel.showless")).toBeInTheDocument();

    fireEvent.click(screen.getByText("panel.showless"));
    expect(screen.getByText("panel.showmore")).toBeInTheDocument();
  });

  describe("line break transformation", () => {
    it("transforms ⤵ character to <br> tag in content", () => {
      const { container } = setup({
        children: "Line one⤵Line two",
        maxLength: 100,
        language: "en",
      });
      const contentDiv = container.querySelector("div");
      expect(contentDiv?.innerHTML).toContain("<br>");
      expect(contentDiv?.innerHTML).not.toContain("⤵");
    });

    it("transforms multiple ⤵ characters to <br> tags", () => {
      const { container } = setup({
        children: "Line one⤵Line two⤵Line three",
        maxLength: 100,
        language: "en",
      });
      const contentDiv = container.querySelector("div");
      const brCount = (contentDiv?.innerHTML.match(/<br>/g) || []).length;
      expect(brCount).toBe(2);
      expect(contentDiv?.innerHTML).not.toContain("⤵");
    });

    it("handles content without ⤵ character correctly", () => {
      const { container } = setup({
        children: "Normal text without special characters",
        maxLength: 100,
        language: "en",
      });
      const contentDiv = container.querySelector("div");
      expect(contentDiv?.innerHTML).toBe(
        "Normal text without special characters",
      );
    });

    it("transforms ⤵ in truncated content when collapsed", () => {
      const { container } = setup({
        children: "Start⤵Middle text that is very long and will be truncated",
        maxLength: 20,
        language: "en",
      });
      const contentDiv = container.querySelector("div");
      expect(contentDiv?.innerHTML).toContain("<br>");
      expect(contentDiv?.innerHTML).not.toContain("⤵");
    });

    it("transforms ⤵ in full content when expanded", () => {
      const longTextWithArrow =
        "Start⤵Middle⤵End of a very long text that exceeds max length";
      setup({
        children: longTextWithArrow,
        maxLength: 20,
        language: "en",
      });

      const button = screen.getByText("panel.showmore");
      fireEvent.click(button);

      const contentDiv = document.querySelector("div.text-base");
      expect(contentDiv?.innerHTML).toContain("<br>");
      expect(contentDiv?.innerHTML).not.toContain("⤵");
      const brCount = (contentDiv?.innerHTML.match(/<br>/g) || []).length;
      expect(brCount).toBe(2);
    });

    it("handles empty string with transformation", () => {
      const { container } = setup({
        children: "",
        maxLength: 50,
        language: "en",
      });
      expect(container.firstChild).toBeNull();
    });

    it("handles content with only ⤵ character", () => {
      const { container } = setup({
        children: "⤵",
        maxLength: 50,
        language: "en",
      });
      const contentDiv = container.querySelector("div");
      expect(contentDiv?.innerHTML).toBe("<br>");
    });
  });

  it("returns null for non-string children", () => {
    const { container } = render(
      <TextExpand children={123 as any} maxLength={50} language="en" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("uses default maxLength when maxLength is not provided", () => {
    const longText = "A".repeat(300); // Longer than DEFAULT_MAX_LENGTH (250)
    setup({
      children: longText,
      maxLength: 0, // Should use DEFAULT_MAX_LENGTH
      language: "en",
    });
    expect(screen.getByText("panel.showmore")).toBeInTheDocument();
  });

  it("applies correct language class", () => {
    const { container } = setup({
      children: "Test content",
      maxLength: 50,
      language: "bo",
    });
    const contentDiv = container.querySelector("div");
    expect(contentDiv).toHaveClass("bo-text");
  });

  it("handles transformation with null content gracefully", () => {
    // Test the transformLineBreaks function edge case
    const { container } = setup({
      children: "",
      maxLength: 50,
      language: "en",
    });
    expect(container.firstChild).toBeNull();
  });

  it("shows exact maxLength characters when truncated", () => {
    const text = "12345678901234567890"; // 20 characters
    const { container } = setup({
      children: text,
      maxLength: 10,
      language: "en",
    });
    const contentDiv = container.querySelector("div");
    expect(contentDiv?.innerHTML).toBe("1234567890");
    expect(screen.getByText("panel.showmore")).toBeInTheDocument();
  });
});
