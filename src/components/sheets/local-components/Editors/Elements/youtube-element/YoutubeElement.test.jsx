import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import YoutubeElement from "./YoutubeElement";

describe("YoutubeElement Component", () => {
  test("renders youtube element with correct structure", () => {
    const props = {
      attributes: { "data-testid": "youtube-element" },
      children: "Sample content",
      element: { youtubeId: "dQw4w9WgXcQ" }
    };
    
    render(<YoutubeElement {...props} />);
    
    const youtubeElement = screen.getByTestId("youtube-element");
    expect(youtubeElement).toBeInTheDocument();
    expect(youtubeElement.tagName).toBe("DIV");
  });
});
