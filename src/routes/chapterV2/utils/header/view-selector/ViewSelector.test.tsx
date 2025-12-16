import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, beforeEach, test, expect, describe } from "vitest";
import ViewSelector, { VIEW_MODES, LAYOUT_MODES } from "./ViewSelector.tsx";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key: string) => key,
    }),
  };
});

vi.mock("@/components/ui/dropdown-menu.tsx", () => ({
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuRadioGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuRadioItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div role="menuitemradio" data-value={value}>
      {children}
    </div>
  ),
}));

describe("ViewSelector Component", () => {
  const setViewMode = vi.fn();
  const setLayoutMode = vi.fn();

  const setup = (
    viewMode = VIEW_MODES.SOURCE,
    layoutMode = LAYOUT_MODES.SEGMENTED,
  ) => {
    return render(
      <ViewSelector
        setViewMode={setViewMode}
        viewMode={viewMode}
        versionSelected={true}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
      />,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders layout label and all menu items", () => {
    setup();
    expect(
      screen.getByText("text.reader_option_menu.layout"),
    ).toBeInTheDocument();

    const menuItems = screen.getAllByRole("menuitemradio");
    expect(menuItems).toHaveLength(5);
  });

  test("renders view mode options with correct labels", () => {
    setup();
    expect(
      screen.getByText("text.reader_option_menu.source"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("text.reader_option_menu.translation"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("text.reader_option_menu.source_with_translation"),
    ).toBeInTheDocument();
  });

  test("renders layout options with correct labels", () => {
    setup();
    expect(screen.getByText("Prose")).toBeInTheDocument();
    expect(screen.getByText("Segmented")).toBeInTheDocument();
  });

  test("menu items have correct data-value attributes", () => {
    setup();
    const menuItems = screen.getAllByRole("menuitemradio");

    expect(menuItems[0]).toHaveAttribute("data-value", VIEW_MODES.SOURCE);
    expect(menuItems[1]).toHaveAttribute("data-value", VIEW_MODES.TRANSLATIONS);
    expect(menuItems[2]).toHaveAttribute(
      "data-value",
      VIEW_MODES.SOURCE_AND_TRANSLATIONS,
    );
    expect(menuItems[3]).toHaveAttribute("data-value", LAYOUT_MODES.PROSE);
    expect(menuItems[4]).toHaveAttribute("data-value", LAYOUT_MODES.SEGMENTED);
  });

  test("renders correct number of menu items", () => {
    setup();
    const menuItems = screen.getAllByRole("menuitemradio");
    expect(menuItems).toHaveLength(5);
  });
});
