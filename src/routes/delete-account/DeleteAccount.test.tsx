import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import "../../test-utils/CommonMocks.ts";

import DeleteAccount from "./DeleteAccount";

const setup = () =>
  render(
    <MemoryRouter>
      <DeleteAccount />
    </MemoryRouter>,
  );

describe("DeleteAccount", () => {
  test("renders main content area", () => {
    setup();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  test("renders page title and account deletion steps", () => {
    setup();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /delete your account/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/open the webuddhist app/i)).toBeInTheDocument();
    expect(screen.getByText(/go to profile/i)).toBeInTheDocument();
    expect(screen.getByText(/open settings/i)).toBeInTheDocument();
    expect(
      screen.getByText(/tap delete account and follow the prompts/i),
    ).toBeInTheDocument();
  });

  test("renders support email link", () => {
    setup();
    const emailLink = screen.getByRole("link", {
      name: /privacy@webuddhist\.com/i,
    });
    expect(emailLink).toHaveAttribute("href", "mailto:privacy@webuddhist.com");
  });
});
