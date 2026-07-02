import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import "../../test-utils/CommonMocks.ts";

import TermsOfService from "./TermsOfService";

const setup = () =>
  render(
    <MemoryRouter>
      <TermsOfService />
    </MemoryRouter>,
  );

describe("TermsOfService", () => {
  test("renders main content area", () => {
    setup();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  test("renders the terms of service article element", () => {
    setup();
    const article = document.querySelector("article.tos-content");
    expect(article).toBeInTheDocument();
  });

  test("renders key terms of service section headings", () => {
    setup();
    expect(screen.getAllByText(/TERMS OF SERVICE/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/AGREEMENT TO OUR LEGAL TERMS/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/TABLE OF CONTENTS/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/PROHIBITED ACTIVITIES/i).length,
    ).toBeGreaterThan(0);
  });

  test("renders contact email link", () => {
    setup();
    const emailLinks = screen.getAllByRole("link", {
      name: /contact@dharmaduta\.in/i,
    });
    expect(emailLinks.length).toBeGreaterThan(0);
    expect(emailLinks[0]).toHaveAttribute(
      "href",
      "mailto:contact@dharmaduta.in",
    );
  });
});
