import { fireEvent, render, screen, act, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import UserProfile, { fetchUserInfo } from "./UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery, useMutation } from "react-query";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";
import { ACCESS_TOKEN, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/constants.js";
import * as ReactRouterDom from "react-router-dom";
import axiosInstance from "../../config/axios-config.js";

// Mock react-router-dom for the navigation test
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock createPortal to avoid portal-related test issues
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: vi.fn((element) => element),
  };
});

// Mock SheetListing component
vi.mock("./tabs/sheet-listing/SheetListing.jsx", () => ({
  default: ({ userInfo }) => (
    <div data-testid="sheet-listing">
      <div>Sample Sheet 1</div>
      <div>123</div>
      <div>2023-01-01</div>
    </div>
  ),
}));

// Mock other tab components
vi.mock("./tabs/collections/CollectionsTab.jsx", () => ({
  default: () => <div data-testid="collections-tab">profile.tab.collection.description</div>,
}));

vi.mock("./tabs/notes/Notes.jsx", () => ({
  default: () => <div data-testid="notes-tab">profile.notes.description</div>,
}));

vi.mock("./tabs/buddhist-tracker/BuddhistTracker.jsx", () => ({
  default: () => <div data-testid="buddhist-tracker-tab">profile.text_tracker.descriptions</div>,
}));

// Mock ImageUploadModal
vi.mock("../sheets/local-components/modals/image-upload-modal/ImageUploadModal.jsx", () => ({
  default: ({ onClose, onUpload }) => (
    <div role="dialog" data-testid="image-upload-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onUpload("test-url", "test-file.jpg")}>Upload</button>
    </div>
  ),
}));

mockAxios();
mockUseAuth();
mockReactQuery();

const mockUserInfo = {
  firstname: "John",
  lastname: "Doe",
  title: "Senior Software Engineer",
  location: "Bangalore",
  educations: ["Master of Computer Application (MCA)", "Bachelor of Science, Physics"],
  organization: "pecha org",
  following: 1,
  followers: 1,
  social_profiles: [
    { account: "x.com", url: "https://x.com" },
    { account: "email", url: "test@pecha.com" },
    { account: "linkedin", url: "https://linkedin.com" },
    { account: "facebook", url: "https://facebook.com" },
    { account: "youtube", url: "https://youtube.com" },
  ],
  avatar_url: "",
  email: "test@pecha.com",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const setup = () => {
  return render(
    <Router>
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <UserProfile />
        </TolgeeProvider>
      </QueryClientProvider>
    </Router>
  );
};

describe("UserProfile Component", () => {
  const mockedNavigate = vi.fn();

  beforeAll(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll(() => {
    window.alert.mockRestore();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage and sessionStorage methods
    const mockStorage = {
      removeItem: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: mockStorage,
      writable: true,
    });

    ReactRouterDom.useNavigate.mockImplementation(() => mockedNavigate);

    useQuery.mockImplementation((queryKey) => {
      if (queryKey === "userInfo") {
        return {
          data: mockUserInfo,
          isLoading: false,
          refetch: vi.fn(),
        };
      }
      return {
        data: null,
        isLoading: true,
      };
    });

    useMutation.mockImplementation(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      error: null,
    }));
  });

  afterEach(() => {
    // Clean up after each test
    queryClient.clear();
  });

  test("renders the user profile with all details", () => {
    setup();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Bangalore")).toBeInTheDocument();
    expect(screen.getByText("Master of Computer Application (MCA) Bachelor of Science, Physics")).toBeInTheDocument();
    expect(screen.getByText("1 Followers")).toBeInTheDocument();
    expect(screen.getByText("1 Following")).toBeInTheDocument();
  });

  test("renders all social media links with correct attributes and icons", () => {
    setup();

    const twitterLink = screen.getByLabelText("x.com");
    const youtubeLink = screen.getByLabelText("youtube");
    const linkedInLink = screen.getByLabelText("linkedin");
    const facebookLink = screen.getByLabelText("facebook");
    const emailLink = screen.getByLabelText("email");

    expect(twitterLink).toHaveAttribute("href", "https://x.com");
    expect(youtubeLink).toHaveAttribute("href", "https://youtube.com");
    expect(linkedInLink).toHaveAttribute("href", "https://linkedin.com");
    expect(facebookLink).toHaveAttribute("href", "https://facebook.com");
    expect(emailLink).toHaveAttribute("href", "mailto:test@pecha.com");

    // Check for icons
    expect(twitterLink.querySelector(".bi-twitter")).toBeInTheDocument();
    expect(youtubeLink.querySelector(".bi-youtube")).toBeInTheDocument();
    expect(linkedInLink.querySelector(".bi-linkedin")).toBeInTheDocument();
    expect(facebookLink.querySelector(".bi-facebook")).toBeInTheDocument();
    expect(emailLink.querySelector(".bi-envelope")).toBeInTheDocument();
  });

  test("renders and switches between tabs correctly", async () => {
    setup();

    const sheetsTab = screen.getByRole('tab', { name: /sheets/i });
    const collectionsTab = screen.getByRole('tab', { name: /collections/i });
    const notesTab = screen.getByRole('tab', { name: /notes/i });
    const trackerTab = screen.getByRole('tab', { name: "Buddhist Text Tracker" });

    // Check initial state (Sheets tab should be active)
    expect(screen.getByTestId("sheet-listing")).toBeInTheDocument();

    // Switch to Collections tab
    await act(async () => {
      fireEvent.click(collectionsTab);
    });
    expect(screen.getByTestId("collections-tab")).toBeInTheDocument();

    // Switch to Notes tab
    await act(async () => {
      fireEvent.click(notesTab);
    });
    expect(screen.getByTestId("notes-tab")).toBeInTheDocument();

    // Switch to Buddhist Tracker tab
    await act(async () => {
      fireEvent.click(trackerTab);
    });
    expect(screen.getByTestId("buddhist-tracker-tab")).toBeInTheDocument();

    // Switch back to Sheets tab
    await act(async () => {
      fireEvent.click(sheetsTab);
    });
    expect(screen.getByTestId("sheet-listing")).toBeInTheDocument();
  });

  test("handles image upload modal and image upload process", async () => {
    const mockRefetch = vi.fn();
    useQuery.mockImplementation(() => ({
      data: mockUserInfo,
      isLoading: false,
      refetch: mockRefetch,
    }));

    setup();

    // Test opening modal
    const addPictureButton = screen.getByText("Add Picture");
    await act(async () => {
      fireEvent.click(addPictureButton);
    });

    expect(screen.getByTestId("image-upload-modal")).toBeInTheDocument();

    // Test successful upload
    await act(async () => {
      fireEvent.click(screen.getByText("Upload"));
    });

    expect(mockRefetch).toHaveBeenCalled();
    expect(screen.queryByTestId("image-upload-modal")).not.toBeInTheDocument();

    // Test closing modal
    await act(async () => {
      fireEvent.click(addPictureButton);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Close"));
    });
    expect(screen.queryByTestId("image-upload-modal")).not.toBeInTheDocument();
  });

  

  test("handles edit profile navigation correctly", async () => {
    setup();

    const editButton = screen.getByText("Edit Profile");
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(mockedNavigate).toHaveBeenCalledWith("/edit-profile", { state: { userInfo: mockUserInfo } });
  });

  test("shows loading state when user info is loading", () => {
    useQuery.mockImplementation(() => ({
      data: null,
      isLoading: true,
      refetch: vi.fn(),
    }));

    setup();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays profile image with edit overlay when avatar_url exists", () => {
    const userInfoWithAvatar = {
      ...mockUserInfo,
      avatar_url: "https://example.com/avatar.jpg"
    };

    useQuery.mockImplementation(() => ({
      data: userInfoWithAvatar,
      isLoading: false,
      refetch: vi.fn(),
    }));

    setup();

    const profileImage = screen.getByAltText("Profile");
    expect(profileImage).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(screen.getByRole("img")).toBeInTheDocument();
    
    // Check for edit overlay
    const editOverlay = screen.getByTestId("edit-overlay");
    expect(editOverlay).toBeInTheDocument();
  });
});

describe("fetchUserInfo Function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("successfully fetches user info", async () => {
    const mockUserData = {
      firstname: "John",
      lastname: "Doe",
      title: "Senior Software Engineer",
      location: "Bangalore",
      educations: ["Master of Computer Application (MCA)"],
      organization: "pecha org",
      following: 1,
      followers: 1,
      avatar_url: "https://example.com/avatar.jpg",
      social_profiles: [
        { account: "linkedin", url: "https://linkedin.com/johndoe" }
      ]
    };

    axiosInstance.get.mockResolvedValueOnce({ data: mockUserData });

    const result = await fetchUserInfo();

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
    expect(result).toEqual(mockUserData);
  });

  test("handles API error correctly", async () => {
    const mockError = new Error("Network Error");
    axiosInstance.get.mockRejectedValueOnce(mockError);

    await expect(fetchUserInfo()).rejects.toThrow("Network Error");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
  });

  test("handles various HTTP error responses", async () => {
    const errorCases = [
      { status: 401, message: "Unauthorized" },
      { status: 404, message: "User not found" },
      { status: 500, message: "Internal Server Error" }
    ];

    for (const errorCase of errorCases) {
      const mockError = {
        response: {
          status: errorCase.status,
          data: { message: errorCase.message }
        }
      };
      axiosInstance.get.mockRejectedValueOnce(mockError);

      await expect(fetchUserInfo()).rejects.toEqual(mockError);
      expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
    }
  });

  test("handles empty and partial response data", async () => {
    // Test null response
    axiosInstance.get.mockResolvedValueOnce({ data: null });
    let result = await fetchUserInfo();
    expect(result).toBeNull();

    // Test partial data
    const partialData = { firstname: "Test", lastname: "User" };
    axiosInstance.get.mockResolvedValueOnce({ data: partialData });
    result = await fetchUserInfo();
    expect(result).toEqual(partialData);
  });
});