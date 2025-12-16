import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Breadcrumbs from "./Breadcrumbs.tsx";

const setup = (items: { label: string; path?: string }[]) => {
  return render(
    <Router>
      <Breadcrumbs items={items} />
    </Router>,
  );
};

describe("Breadcrumbs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when items array is empty", () => {
    const { container } = setup([]);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when items is undefined", () => {
    const { container } = render(
      <Router>
        <Breadcrumbs items={undefined as any} />
      </Router>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders single breadcrumb item as current page", () => {
    setup([{ label: "Home" }]);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders multiple breadcrumb items with links", () => {
    setup([
      { label: "Home", path: "/" },
      { label: "Plans", path: "/plans" },
      { label: "Current Plan" },
    ]);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Plans")).toBeInTheDocument();
    expect(screen.getByText("Current Plan")).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders ellipsis when more than 3 items", () => {
    setup([
      { label: "Home", path: "/" },
      { label: "Level 1", path: "/level1" },
      { label: "Level 2", path: "/level2" },
      { label: "Level 3", path: "/level3" },
      { label: "Current" },
    ]);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Level 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Level 2")).not.toBeInTheDocument();
    expect(screen.getByText("Level 3")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("applies truncate class to last item", () => {
    setup([
      { label: "Home", path: "/" },
      { label: "Very Long Current Page Name" },
    ]);

    const lastItem = screen.getByText("Very Long Current Page Name");
    expect(lastItem).toHaveClass("truncate");
  });
});
