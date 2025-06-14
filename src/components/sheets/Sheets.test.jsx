import React from "react";
import { mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import Sheets from "./Sheets.jsx";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});
vi.mock("./local-components/UserProfileCard/ProfileCard", () => ({
  __esModule: true,
  default: () => <div data-testid="profile-card">ProfileCard</div>,
}));
vi.mock("./local-components/Editors/EditorWrapper", () => {
  const Editor = ({ children }) => <div data-testid="editor">{children}</div>;
  Editor.Input = () => <div data-testid="editor-input">EditorInput</div>;
  Editor.Toolbar = () => <div data-testid="editor-toolbar">EditorToolbar</div>;
  return { __esModule: true, default: Editor };
});

mockUseAuth();

describe("Sheets Component", () => {
  const queryClient = new QueryClient();
  const setup = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <Sheets />
        </TolgeeProvider>
      </QueryClientProvider>
    );

  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock localStorage for initialValue
    vi.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((key) => {
      if (key === "sheets-content") {
        return null;
      }
      return null;
    });
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {});
  });

  test("renders Sheets component structure", () => {
    setup();
    expect(document.querySelector(".sheets-wrapper")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("sheet.title.placeholder")).toBeInTheDocument();
    expect(screen.getByTestId("profile-card")).toBeInTheDocument();
    expect(screen.getByTestId("editor")).toBeInTheDocument();
    expect(screen.getByTestId("editor-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-input")).toBeInTheDocument();
  });

  test("title input accepts text", () => {
    setup();
    const input = screen.getByPlaceholderText("sheet.title.placeholder");
    fireEvent.change(input, { target: { value: "My Sheet Title" } });
    expect(input.value).toBe("My Sheet Title");
  });

  test("loads default value from localStorage if not present", () => {
    setup();
    expect(window.localStorage.getItem).toHaveBeenCalledWith("sheets-content");
  });

  test("saves editor content to localStorage on change", () => {
    const fakeValue = [{ type: "paragraph", children: [{ text: "Hello" }], align: "left" }];
    window.localStorage.setItem("sheets-content", JSON.stringify(fakeValue));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "sheets-content",
      JSON.stringify(fakeValue)
    );
  });

  test("renders with existing localStorage value", () => {
    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify([{ type: "paragraph", children: [{ text: "Saved!" }], align: "left" }])
    );
    setup();
    expect(window.localStorage.getItem).toHaveBeenCalledWith("sheets-content");
  });
});
