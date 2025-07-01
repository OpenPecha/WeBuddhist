import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as reactQuery from "react-query";
import "@testing-library/jest-dom";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
} from "../../../test-utils/CommonMocks.js";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../../config/axios-config.js";
import SheetDetailPageWithPanelContext, { fetchSheetData } from "./SheetDetailPage.jsx";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import * as Constants from "../sheet-utils/Constant";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("../../resources-side-panel/Resources", () => ({
  default: ({ segmentId, handleClose }) => (
    <div data-testid="resources-panel">
      <button onClick={handleClose}>Close</button>
      <div>Resources for segment: {segmentId}</div>
    </div>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useSearchParams: vi.fn(() => [
      new URLSearchParams(),
      vi.fn(),
    ]),
  };
});

describe("SheetDetailPage Component", () => {
  const queryClient = new QueryClient();
  const mockSheetData = {
    sheet_title: "Test Sheet",
    views: 42,
    publisher: {
      name: "Test User",
      username: "testuser",
      avatar_url: "https://example.com/avatar.jpg"
    },
    content: {
      segments: [
        {
          segment_id: "segment1",
          type: "source",
          content: "Source content",
          language: "bo",
          text_title: "Source Title"
        },
        {
          segment_id: "segment2",
          type: "content",
          content: "Text content"
        },
        {
          segment_id: "segment3",
          type: "image",
          content: "https://example.com/image.jpg"
        }
      ]
    }
  };

  let extractSpotifyInfoSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    useParams.mockReturnValue({ sheetSlugAndId: "test-sheet-626ddc35-a146-4bca-a3a3-b8221c501df3" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSheetData,
      isLoading: false,
    }));
    extractSpotifyInfoSpy = vi.spyOn(Constants, 'extractSpotifyInfo').mockImplementation(() => null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <SheetDetailPageWithPanelContext />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders sheet details correctly", () => {
    setup();
    expect(screen.getByText("Test Sheet")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Source Title")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));

    setup();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays not found message when sheet data is null", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("displays not found message when segments array is empty", () => {
    const emptySheetData = {
      ...mockSheetData,
      content: {
        segments: []
      }
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: emptySheetData,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("text_category.message.notfound")).toBeInTheDocument();
  });

  test("renders different segment types correctly", () => {
    setup();
    
    expect(screen.getByText("Source Title")).toBeInTheDocument();
    expect(screen.getByAltText("source icon")).toBeInTheDocument();
    
    expect(screen.getByText("Text content")).toBeInTheDocument();
    
    expect(screen.getByAltText("Sheet content")).toBeInTheDocument();
  });

  // test("opens resources panel when clicking on a source segment", () => {
  //   setup();
  //
  //   const sourceSegment = screen.getByText("Source Title").closest(".segment-source");
  //   fireEvent.click(sourceSegment);
  //
  //   expect(screen.getByTestId("resources-panel")).toBeInTheDocument();
  //   expect(screen.getByText("Resources for segment: segment1")).toBeInTheDocument();
  // });

  describe("getAudioSrc function tests", () => {
    test("renders audio segment with Spotify URL correctly", () => {
      extractSpotifyInfoSpy.mockReturnValue({ type: "track", id: "4iV5W9uYEdYUVa79Axb7Rh" });

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio1",
              type: "audio",
              content: "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio1");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("https://open.spotify.com/embed/track/4iV5W9uYEdYUVa79Axb7Rh?utm_source=generator");
      expect(extractSpotifyInfoSpy).toHaveBeenCalledWith("https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh");
    });

    test("renders audio segment with SoundCloud URL correctly", () => {
      extractSpotifyInfoSpy.mockReturnValue(null);

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio2",
              type: "audio",
              content: "https://soundcloud.com/test/track"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio2");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Ftest%2Ftrack&color=%23ff5500");
      expect(extractSpotifyInfoSpy).toHaveBeenCalledWith("https://soundcloud.com/test/track");
    });

    test("handles audio segment with unsupported URL (returns null)", () => {
      extractSpotifyInfoSpy.mockReturnValue(null);

      const audioSheetData = {
        ...mockSheetData,
        content: {
          segments: [
            {
              segment_id: "audio3",
              type: "audio",
              content: "https://example.com/unsupported-audio"
            }
          ]
        }
      };

      vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
        data: audioSheetData,
        isLoading: false,
      }));

      setup();
      
      const iframe = screen.getByTitle("audio-audio3");
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe("");
      expect(extractSpotifyInfoSpy).toHaveBeenCalledWith("https://example.com/unsupported-audio");
    });
  });

  test("fetchSheetData calls the correct API endpoint", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockSheetData });
    
    const sheetId = "test-id";
    await fetchSheetData(sheetId);
    
    expect(axiosInstance.get).toHaveBeenCalledWith(`/api/v1/sheets/${sheetId}`, {
      params: {
        skip: 0,
        limit: 10,
      }
    });
  });
});
