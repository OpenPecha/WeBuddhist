import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { TolgeeProvider } from "@tolgee/react";
import Notes from "./Notes.js";
import { mockTolgee } from "../../../../test-utils/CommonMocks.js";

const renderWithTolgee = () =>
  render(
    <TolgeeProvider tolgee={mockTolgee}>
      <Notes />
    </TolgeeProvider>
  );

afterEach(() => {
  cleanup();
});

describe("Notes", () => {
  it("renders heading with correct translation", async () => {
    renderWithTolgee();
    const heading = await screen.findByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Notes");
  });

});
