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
});
