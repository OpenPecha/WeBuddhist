import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { TolgeeProvider } from "@tolgee/react";
import CollectionsTab from "./CollectionsTab";
import { mockTolgee } from "../../../../test-utils/CommonMocks.js";

const renderWithTolgee = () =>
  render(
    <TolgeeProvider tolgee={mockTolgee}>
      <CollectionsTab />
    </TolgeeProvider>
  );

afterEach(() => {
  cleanup();
});

describe("CollectionsTab", () => {
  it("renders heading with correct translation", async () => {
    renderWithTolgee();
    const heading = await screen.findByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Collections");
  });

});
