import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import PechaElement, { fetchSegmentDetails } from "./PechaElement";
import { vi } from "vitest";
import { mockAxios, mockReactQuery } from "../../../../../../test-utils/CommonMocks.js";
import * as reactQuery from "react-query";
import { removeFootnotes } from '../../../../sheet-utils/Constant';
import axiosInstance from '../../../../../../config/axios-config';
import {getLanguageClass} from "../../../../../../utils/helperFunctions.jsx";

mockAxios();
mockReactQuery();

vi.mock('../../../../../../utils/Constants', () => ({
  getLanguageClass: vi.fn(() => 'tibetan-class')
}));

vi.mock('../../../../sheet-utils/Constant', () => ({
  removeFootnotes: vi.fn((content) => content)
}));

vi.mock('../../../../../../assets/icons/pecha_icon.png', () => ({
  default: 'mocked-pecha-icon.png'
}));

describe("PechaElement Component", () => {
  const queryClient = new QueryClient();
  const mockSegmentData = {
    content: '<p>Sample content with [footnote]</p>',
    text: {
      title: 'Sample Text Title',
      language: 'tibetan'
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSegmentData,
      isLoading: false,
    }));
    getLanguageClass.mockReturnValue('tibetan-class');
    removeFootnotes.mockImplementation((content) => content);
  });

  const defaultProps = {
    attributes: { "data-testid": "pecha-element" },
    children: null,
    element: {
      src: "segment-123"
    }
  };

  const setup = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PechaElement {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  test("shows loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
    }));
    
    setup();
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders segment data when loaded successfully", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText('Sample Text Title')).toBeInTheDocument();
    });

    const container = screen.getByTestId("pecha-element");
    const contentWrapper = container.querySelector(".pecha-content");
    expect(contentWrapper).toBeInTheDocument();

    const pechaIcon = screen.getByAltText("source icon");
    expect(pechaIcon).toHaveAttribute("src", "mocked-pecha-icon.png");
    expect(pechaIcon).toHaveClass("pecha-icon");

    const titleElement = screen.getByText('Sample Text Title');
    expect(titleElement).toHaveClass("pecha-title");
  });

  test("disables query when segmentId is falsy", () => {
    const querySpy = vi.spyOn(reactQuery, "useQuery");

    setup({ element: { src: null } });

    expect(querySpy).toHaveBeenCalledWith(
      ['segment', null],
      expect.any(Function),
      {
        enabled: false,
        refetchOnWindowFocus: false
      }
    );
  });

  test("fetchSegmentDetails function makes correct API call", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockSegmentData });
    
    const segmentId = "segment-123";
    const result = await fetchSegmentDetails(segmentId);
    
    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/segments/segment-123', {
      params: {
        text_details: true
      }
    });
    
    expect(result).toEqual(mockSegmentData);
  });

  test("useQuery executes fetchSegmentDetails function", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockSegmentData });
    
    vi.spyOn(reactQuery, "useQuery").mockImplementation((_queryKey, queryFn, options) => {
      if (options?.enabled) {
        queryFn();
      }
      return {
        data: mockSegmentData,
        isLoading: false,
      };
    });

    setup();

    expect(axiosInstance.get).toHaveBeenCalledWith('/api/v1/segments/segment-123', {
      params: {
        text_details: true
      }
    });
  });
});