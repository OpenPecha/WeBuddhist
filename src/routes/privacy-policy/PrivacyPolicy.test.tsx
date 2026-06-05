import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import "../../test-utils/CommonMocks.ts";

import PrivacyPolicy from "./PrivacyPolicy";

const setup = () =>
  render(
    <MemoryRouter>
      <PrivacyPolicy />
    </MemoryRouter>,
  );

describe("PrivacyPolicy", () => {
  test("renders main content area", () => {
    setup();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  test("renders breadcrumb nav with back-to-home link", () => {
    setup();
    const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  test("renders the privacy policy article element", () => {
    setup();
    const article = document.querySelector("article.privacy-policy-content");
    expect(article).toBeInTheDocument();
  });

  test("renders key privacy policy section headings", () => {
    setup();
    expect(
      screen.getAllByText(/WHAT INFORMATION DO WE COLLECT/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/HOW DO WE PROCESS YOUR INFORMATION/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/HOW CAN YOU CONTACT US ABOUT THIS NOTICE/i).length,
    ).toBeGreaterThan(0);
  });

  test("renders DPO contact email link", () => {
    setup();
    const emailLinks = screen.getAllByRole("link", {
      name: /dpo@webuddhist\.com/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
    expect(emailLinks[0]).toHaveAttribute("href", "mailto:dpo@webuddhist.com");
  });
});
