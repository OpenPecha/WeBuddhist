import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import UserProfile ,{fetchsheet} from "./UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";
import { ACCESS_TOKEN } from "../../utils/constants.js";
import * as ReactRouterDom from "react-router-dom";
import axiosInstance from "../../config/axios-config.js";
import { fetchUserInfo } from "./UserProfile.jsx";

// Mock react-router-dom for the navigation test
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

mockAxios();
mockUseAuth();
mockReactQuery();

describe("UserProfile Component", () => {
  const queryClient = new QueryClient();
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
  };

  const mockSheetsData = {
    sheets: [
      {
        id: '1',
        title: 'Sample Sheet 1',
        views: 123,
        date: '2023-01-01',
        topics: ['Topic 1', 'Topic 2'],
      },
    ],
  };

  const mockedNavigate = vi.fn();

  beforeAll(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll(() => {
    window.alert.mockRestore();
  });
  beforeEach(() => {
    // Mock localStorage and sessionStorage methods
    Object.defineProperty(window, "localStorage", {
      value: {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, "sessionStorage", {
      value: {
        removeItem: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });
  beforeEach(() => {
    vi.clearAllMocks();
    ReactRouterDom.useNavigate.mockImplementation(() => mockedNavigate);

    useQuery.mockImplementation((queryKey) => {
      if (queryKey === "userInfo") {
        return {
          data: mockUserInfo,
          isLoading: false,
          refetch: vi.fn(),
        };
      } else if (Array.isArray(queryKey) && queryKey[0] === "sheets") {
        return {
          data: mockSheetsData,
          isLoading: false,
        };
      }
      return {
        data: null,
        isLoading: true,
      };
    });
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <UserProfile />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the user profile with all details", () => {
    setup();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Bangalore")).toBeInTheDocument();
    expect(screen.getByText("Master of Computer Application (MCA) Bachelor of Science, Physics")).toBeInTheDocument();
  });

  test("renders all social media links with correct attributes", () => {
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
  });

  test("renders tabs and their content", () => {
    setup();

    const sheetsTab = screen.getByRole('tab', { name: /Sheets/i });
    const collectionsTab = screen.getByRole('tab', { name: /Collections/i });
    const notesTab = screen.getByRole('tab', { name: /Notes/i });
    const trackerTab = screen.getByRole('tab', { name: /Buddhist Text Tracker/i });

    expect(sheetsTab).toBeInTheDocument();
    expect(collectionsTab).toBeInTheDocument();
    expect(notesTab).toBeInTheDocument();
    expect(trackerTab).toBeInTheDocument();

    fireEvent.click(collectionsTab);
    expect(screen.getByText(/Collections can be shared privately or made public on Pecha/i)).toBeInTheDocument();

    fireEvent.click(notesTab);
    expect(screen.getByText(/profile.notes.description/i)).toBeInTheDocument();

    fireEvent.click(trackerTab);
    expect(screen.getByText(/profile.text_tracker.descriptions/i)).toBeInTheDocument();
  });

  test("handles picture upload correctly with valid and invalid files", async () => {
    setup();

    const fileInput = screen.getByLabelText(/Add Picture/i);

    // Valid file
    const validFile = new File(["valid"], "valid.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Invalid file type
    const invalidFileType = new File(["invalid"], "invalid.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [invalidFileType] } });

    // Large file size
    const largeFileSize = new File(["large".repeat(1024 * 1024)], "large.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [largeFileSize] } });

    // Check alerts
    expect(window.alert).toHaveBeenCalledTimes(2); // Invalid type and size
  });

  test("handles logout correctly", () => {
    setup();
  
    const logoutButton = screen.getByText(/Log Out/i);
  
    fireEvent.click(logoutButton);
  
    // Verify that localStorage.removeItem was called with the correct keys
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("loggedInVia");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
  
    // Verify that sessionStorage.removeItem was called with the correct key
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN);
  });
  

  test("navigates to edit profile page with user info when edit button is clicked", () => {
    setup();

    const editButton = screen.getByText(/Edit Profile/i);

    fireEvent.click(editButton);

    expect(mockedNavigate).toHaveBeenCalledWith("/edit-profile", { state: { userInfo: mockUserInfo } });
  });

  test("renders sheets data correctly in Sheets tab", () => {
    setup();

    const sheetTitle = screen.getByText(/Sample Sheet 1/i);
    
     // Check sheet metadata
     expect(sheetTitle).toBeInTheDocument()
    
  });
  
  test("fetches sheet with correct parameters when access token exists", async () => {
    window.localStorage.getItem.mockReturnValue("en");
    window.sessionStorage.getItem.mockReturnValue("test-access-token");
    axiosInstance.get.mockResolvedValueOnce({ data: mockSheetsData });
    const result = await fetchsheet("test@gmail.com", 10, 0);
    expect(window.sessionStorage.getItem).toHaveBeenCalledWith("accessToken");
    expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/sheets", {
      headers: {
        Authorization: "Bearer test-access-token"
      },
      params: {
        language: "en",
        email: "test@gmail.com",
        limit: 10,
        skip: 0,
      }
    });
  
    expect(result).toEqual(mockSheetsData);
  });

  test("fetches sheet with correct parameters when no access token exists", async () => {
    window.localStorage.getItem.mockReturnValue("en");
    window.sessionStorage.getItem.mockReturnValue(null);
    axiosInstance.get.mockResolvedValueOnce({ data: mockSheetsData });
    const result = await fetchsheet("test@gmail.com", 10, 0);
  
    expect(axiosInstance.get).toHaveBeenCalledWith("api/v1/sheets", {
      headers: {
        Authorization: "Bearer None"
      },
      params: {
        language: "en",
        email: "test@gmail.com",
        limit: 10,
        skip: 0,
      }
    });
  
    expect(result).toEqual(mockSheetsData);
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
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUserData);
  });

  test("handles API error correctly", async () => {
    const mockError = new Error("Network Error");
    axiosInstance.get.mockRejectedValueOnce(mockError);

    await expect(fetchUserInfo()).rejects.toThrow("Network Error");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
  });

  test("handles 401 unauthorized error", async () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: "Unauthorized" }
      }
    };
    axiosInstance.get.mockRejectedValueOnce(mockError);

    await expect(fetchUserInfo()).rejects.toEqual(mockError);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
  });

  test("handles 404 not found error", async () => {
    const mockError = {
      response: {
        status: 404,
        data: { message: "User not found" }
      }
    };
    axiosInstance.get.mockRejectedValueOnce(mockError);

    await expect(fetchUserInfo()).rejects.toEqual(mockError);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
  });

  test("handles server error (500)", async () => {
    const mockError = {
      response: {
        status: 500,
        data: { message: "Internal Server Error" }
      }
    };
    axiosInstance.get.mockRejectedValueOnce(mockError);

    await expect(fetchUserInfo()).rejects.toEqual(mockError);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
  });

  test("returns data with correct structure", async () => {
    const mockUserData = {
      firstname: "Jane",
      lastname: "Smith",
      title: "Product Manager",
      location: "Mumbai",
      educations: ["MBA", "B.Tech"],
      organization: "tech company",
      following: 25,
      followers: 100,
      avatar_url: null,
      social_profiles: []
    };

    axiosInstance.get.mockResolvedValueOnce({ data: mockUserData });

    const result = await fetchUserInfo();

    expect(result).toHaveProperty('firstname');
    expect(result).toHaveProperty('lastname');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('location');
    expect(result).toHaveProperty('educations');
    expect(result).toHaveProperty('organization');
    expect(result).toHaveProperty('following');
    expect(result).toHaveProperty('followers');
    expect(result).toHaveProperty('avatar_url');
    expect(result).toHaveProperty('social_profiles');

    expect(typeof result.firstname).toBe('string');
    expect(typeof result.lastname).toBe('string');
    expect(typeof result.following).toBe('number');
    expect(typeof result.followers).toBe('number');
    expect(Array.isArray(result.educations)).toBe(true);
    expect(Array.isArray(result.social_profiles)).toBe(true);
  });

  test("handles empty response data", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: null });

    const result = await fetchUserInfo();

    expect(result).toBeNull();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
  });

  test("handles partial user data", async () => {
    const partialUserData = {
      firstname: "Test",
      lastname: "User"
    };

    axiosInstance.get.mockResolvedValueOnce({ data: partialUserData });

    const result = await fetchUserInfo();

    expect(result).toEqual(partialUserData);
    expect(result.firstname).toBe("Test");
    expect(result.lastname).toBe("User");
    expect(result.title).toBeUndefined();
    expect(result.location).toBeUndefined();
  });
});
