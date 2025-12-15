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

const expectedColumnLinks: { href: string; label: string }[] = [
  { href: "https://dharmaduta.in/about", label: "About Us" },
  { href: "https://dharmaduta.in/team", label: "Team" },
  { href: "https://dharmaduta.in/projects", label: "Products" },
  { href: "https://buddhistai.tools/", label: "Buddhist AI Studio" },
  { href: "https://sherab.org/", label: "Sherab" },
  { href: "https://github.com/OpenPecha", label: "Fork us on GitHub" },
  { href: "https://discord.com/invite/7GFpPFSTeA", label: "Discord" },
];

const expectedSocialLinks: { href: string }[] = [
  { href: "https://www.instagram.com/we.buddhist/" },
  { href: "https://www.facebook.com/profile.php?id=61578322432088" },
  { href: "mailto:contact@dharmaduta.in" },
  { href: "https://www.linkedin.com/company/webuddhist/" },
  { href: "https://www.youtube.com/@WeBuddhistmedia" },
];

describe("Footer", () => {
  const setup = () => render(<Footer />);

  beforeEach(() => {
    translateMock.mockClear();
  });

  test("renders footer landmark and headings", () => {
    setup();

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText("translated-footer.about")).toBeInTheDocument();
    expect(screen.getByText("translated-footer.tools")).toBeInTheDocument();
    expect(
      screen.getByText("translated-footer.developers"),
    ).toBeInTheDocument();
  });

  test("renders all column links with correct attributes", () => {
    setup();

    expectedColumnLinks.forEach(({ href, label }) => {
      const link = screen.getByRole("link", { name: label });

      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test("renders all social media links with correct attributes", () => {
    setup();

    expectedSocialLinks.forEach(({ href }) => {
      const links = screen.getAllByRole("link");
      const socialLink = links.find((l) => l.getAttribute("href") === href);

      expect(socialLink).toBeInTheDocument();
      expect(socialLink).toHaveAttribute("href", href);
      expect(socialLink).toHaveAttribute("target", "_blank");
      expect(socialLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test("renders correct total number of links", () => {
    setup();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(
      expectedColumnLinks.length + expectedSocialLinks.length,
    );
  });

  test("uses translation helper for column headings", () => {
    setup();

    expect(translateMock).toHaveBeenCalledWith("footer.about");
    expect(translateMock).toHaveBeenCalledWith("footer.tools");
    expect(translateMock).toHaveBeenCalledWith("footer.developers");
  });
});
