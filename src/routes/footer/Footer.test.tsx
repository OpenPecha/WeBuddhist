import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const translateMock = vi.fn((key: string) => `translated-${key}`);

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: translateMock,
    }),
  };
});

import Footer from "./Footer";

const expectedLinks: { href: string; labelKey: string }[] = [
  { href: "https://dharmaduta.in/about", labelKey: "footer.about_us" },
  { href: "https://dharmaduta.in/team", labelKey: "footer.team" },
  { href: "https://dharmaduta.in/projects", labelKey: "footer.products" },
  { href: "https://buddhistai.tools/", labelKey: "footer.buddhist_ai_tools" },
  { href: "https://sherab.org/", labelKey: "footer.sherab" },
  {
    href: "https://github.com/OpenPecha",
    labelKey: "footer.fork_us_on_github",
  },
  { href: "https://discord.com/invite/7GFpPFSTeA", labelKey: "footer.discord" },
  {
    href: "https://www.instagram.com/we.buddhist/",
    labelKey: "footer.instagram",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61578322432088",
    labelKey: "footer.facebook",
  },
  {
    href: "https://www.youtube.com/@WeBuddhistmedia",
    labelKey: "footer.youtube",
  },
  {
    href: "https://www.linkedin.com/company/webuddhist/",
    labelKey: "footer.linkedin",
  },
  { href: "mailto:contact@dharmaduta.in", labelKey: "footer.email" },
];

describe("Footer", () => {
  const setup = () => render(<Footer />);

  beforeEach(() => {
    translateMock.mockClear();
  });

  test("renders footer landmark and headings", () => {
    setup();

    expect(
      screen.getByRole("contentinfo", { name: "Site footer" }),
    ).toBeInTheDocument();
    expect(screen.getByText("translated-footer.about")).toBeInTheDocument();
    expect(screen.getByText("translated-footer.tools")).toBeInTheDocument();
    expect(
      screen.getByText("translated-footer.developers"),
    ).toBeInTheDocument();
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  test("renders all links with correct attributes", () => {
    setup();

    expectedLinks.forEach(({ href, labelKey }) => {
      const link = screen.getByRole("link", {
        name: `translated-${labelKey}`,
      });

      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    expect(screen.getAllByRole("link")).toHaveLength(expectedLinks.length);
  });

  test("uses translation helper for labels while leaving raw headings when requested", () => {
    setup();

    expect(translateMock).toHaveBeenCalledWith("footer.about");
    expect(translateMock).toHaveBeenCalledWith("footer.tools");
    expect(translateMock).toHaveBeenCalledWith("footer.developers");
    expect(translateMock).toHaveBeenCalledWith("footer.instagram");
    expect(translateMock).not.toHaveBeenCalledWith("Connect");
  });
});
