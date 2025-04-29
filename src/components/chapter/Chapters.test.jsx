import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Chapters from "./Chapters.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth} from "../../test-utils/CommonMocks.js";

mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: vi.fn().mockReturnValue({
      state: {
        chapterInformation: {
          contentId: "content123",
          versionId: "version123",
          contentIndex: 0
        }
      }
    }),
    useParams: vi.fn().mockReturnValue({}),
  };
});

const MockChapter = ({ currentChapter, addChapter, removeChapter, updateChapter }) => {
  const contentId = currentChapter?.contentId || '';
  const segmentId = currentChapter?.segmentId || '';
  return (
    <div data-testid="mocked-chapter" data-chapter-id={contentId} data-segment-id={segmentId}>
      Mocked Chapter Component
      <button data-testid="add-chapter-btn" onClick={() => addChapter({ contentId: 'new-content', versionId: 'new-version' })}>Add Chapter</button>
      <button data-testid="remove-chapter-btn" onClick={() => removeChapter(currentChapter)}>Remove Chapter</button>
      <button data-testid="update-chapter-btn" onClick={() => updateChapter(currentChapter, { contentId: 'updated-content' })}>Update Chapter</button>
      {segmentId && (
        <>
          <button data-testid="remove-segment-btn" onClick={() => removeChapter({ segmentId })}>Remove By Segment</button>
          <button data-testid="update-segment-btn" onClick={() => updateChapter({ segmentId }, { contentId: "updated-by-segment" })}>Update By Segment</button>
        </>
      )}
    </div>
  );
};

vi.mock('./component/chapter/Chapter.jsx', () => ({
  default: (props) => <MockChapter {...props} />
}));

// This mock is already defined above

const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe("Chapters Component", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.resetAllMocks();
    mockSessionStorage.clear();
    mockSessionStorage.getItem.mockImplementation(key => {
      if (key === 'chapters') {
        return JSON.stringify([{
          contentId: "content123",
          versionId: "version123",
          contentIndex: 0,
          segmentId: "segment123" 
        }]);
      }
      return null;
    });
    useLocation.mockReturnValue({
      state: {
        chapterInformation: {
          contentId: "content123",
          versionId: "version123",
          contentIndex: 0
        }
      }
    });
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Chapters />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders Chapters component", () => {
    const { container } = setup();
    expect(container.querySelector(".chapters-container")).toBeInTheDocument();
  });

  test("renders initial chapter from sessionStorage", () => {
    const { container } = setup();
    const chapterContainers = container.querySelectorAll(".chapter-container");
    expect(chapterContainers.length).toBe(1);
  });


  test("initializes with location state if available", () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    const { container } = setup();
    
    const chapterContainers = container.querySelectorAll(".chapter-container");
    expect(chapterContainers.length).toBe(1);
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'chapters',
      expect.any(String)
    );
  });


  test("limits the number of chapters to 3", () => {
    mockSessionStorage.getItem.mockImplementation(key => {
      if (key === 'chapters') {
        return JSON.stringify([
          { contentId: "content1", versionId: "version1" },
          { contentId: "content2", versionId: "version2" },
          { contentId: "content3", versionId: "version3" }
        ]);
      }
      return null;
    });
    
    const { container } = setup();
    
    const initialChapters = container.querySelectorAll(".chapter-container");
    expect(initialChapters.length).toBe(3);
  });

  test("adds a new chapter when addChapter is called", () => {
    const { getAllByTestId } = setup();
    
    const chapterContainers = document.querySelectorAll(".chapter-container");
    expect(chapterContainers.length).toBe(1);
      
    const addButton = getAllByTestId("add-chapter-btn")[0];
    fireEvent.click(addButton);
    
    const updatedContainers = document.querySelectorAll(".chapter-container");
    expect(updatedContainers.length).toBe(2);
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'chapters',
      expect.stringContaining('new-content')
    );
  });
  
  test("removes a chapter when removeChapter is called", () => {
    mockSessionStorage.getItem.mockImplementation(() => {
      return JSON.stringify([
        { contentId: "content123", versionId: "version123" },
        { contentId: "content456", versionId: "version456" }
      ]);
    });
    
    const { getAllByTestId } = setup();
    
    const initialContainers = document.querySelectorAll(".chapter-container");
    expect(initialContainers.length).toBe(2);
    
    const removeButton = getAllByTestId("remove-chapter-btn")[0];
    fireEvent.click(removeButton);
    
    const updatedContainers = document.querySelectorAll(".chapter-container");
    expect(updatedContainers.length).toBe(1);
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'chapters',
      expect.not.stringContaining('content123')
    );
  });
  
  test("updates a chapter when updateChapter is called", async () => {
    const { getAllByTestId } = setup();
    
    const updateButton = getAllByTestId("update-chapter-btn")[0];
    fireEvent.click(updateButton);
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'chapters',
      expect.stringContaining('updated-content')
    );
  });
  
  test("limits the maximum number of chapters to 3", () => {
    mockSessionStorage.getItem.mockImplementation(() => {
      return JSON.stringify([
        { contentId: "content1", versionId: "version1" },
        { contentId: "content2", versionId: "version2" },
        { contentId: "content3", versionId: "version3" }
      ]);
    });
    
    const { getAllByTestId } = setup();
    
    const initialContainers = document.querySelectorAll(".chapter-container");
    expect(initialContainers.length).toBe(3);
    
    const addButton = getAllByTestId("add-chapter-btn")[0];
    fireEvent.click(addButton);
    
    const updatedContainers = document.querySelectorAll(".chapter-container");
    expect(updatedContainers.length).toBe(3);
  });
  
  test("correctly handles chapter removal with segmentId", () => {
    mockSessionStorage.getItem.mockImplementation(() => {
      return JSON.stringify([
        { contentId: "content1", versionId: "version1", segmentId: "segment1" },
        { contentId: "content2", versionId: "version2", segmentId: "segment2" }
      ]);
    });
    
    const { getAllByTestId } = setup();
    
    const initialContainers = document.querySelectorAll(".chapter-container");
    expect(initialContainers.length).toBe(2);
    
    const removeButton = getAllByTestId("remove-segment-btn")[0];
    fireEvent.click(removeButton);
    
    const updatedContainers = document.querySelectorAll(".chapter-container");
    expect(updatedContainers.length).toBe(1);
  });
  
  test("correctly handles chapter update with segmentId", () => {
    mockSessionStorage.getItem.mockImplementation(() => {
      return JSON.stringify([
        { contentId: "content1", versionId: "version1", segmentId: "segment1" }
      ]);
    });
    
    const { getAllByTestId } = setup();
    
    const updateButton = getAllByTestId("update-segment-btn")[0];
    fireEvent.click(updateButton);
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'chapters',
      expect.stringContaining('updated-by-segment')
    );
  });
  
  test("correctly sets chapter width based on number of chapters", () => {
    mockSessionStorage.getItem.mockImplementation(() => {
      return JSON.stringify([
        { contentId: "content1", versionId: "version1" },
        { contentId: "content2", versionId: "version2" }
      ]);
    });
    
    const { container } = setup();
    
    const chapterContainers = container.querySelectorAll(".chapter-container");
    expect(chapterContainers.length).toBe(2);
    
    expect(chapterContainers[0].style.width).toBe("50%");
    expect(chapterContainers[1].style.width).toBe("50%");
    
    mockSessionStorage.getItem.mockImplementation(() => {
      return JSON.stringify([
        { contentId: "content1", versionId: "version1" },
        { contentId: "content2", versionId: "version2" },
        { contentId: "content3", versionId: "version3" }
      ]);
    });
    
    const { container: container2 } = setup();
    
    const chapterContainers2 = container2.querySelectorAll(".chapter-container");
    expect(chapterContainers2.length).toBe(3);
    
    const widthPattern = /^33\.33/;
    expect(widthPattern.test(chapterContainers2[0].style.width)).toBe(true);
    expect(widthPattern.test(chapterContainers2[1].style.width)).toBe(true);
    expect(widthPattern.test(chapterContainers2[2].style.width)).toBe(true);
  });
});
