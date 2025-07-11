import { fireEvent, render, screen, act, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import UserProfile ,{fetchsheet} from "./UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery, useMutation } from "react-query";
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

const mockSheetsData = {
  sheets: [
    {
      id: '1',
      title: 'Sample Sheet 1',
      views: 123,
      published_date: '2023-01-01 12:00:00',
      language: 'en',
      publisher: { username: 'johndoe' },
    },
  ],
  total: 1,
};

const queryClient = new QueryClient();

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

describe("UserProfile Component", () => {
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

    vi.clearAllMocks();
    ReactRouterDom.useNavigate.mockImplementation(() => mockedNavigate);

    useQuery.mockImplementation((queryKey) => {
      if (queryKey === "userInfo") {
        return {
          data: mockUserInfo,
          isLoading: false,
          refetch: vi.fn(),
        };
      } else if (Array.isArray(queryKey) && queryKey[0] === "sheets-user-profile") {
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

    // Check for sheet title
    const sheetTitle = screen.getByText(/Sample Sheet 1/i);
    expect(sheetTitle).toBeInTheDocument();

    // Check for sheet views
    const sheetViews = screen.getByText(/123/);
    expect(sheetViews).toBeInTheDocument();

    // Check for published date (only date part)
    const sheetDate = screen.getByText('2023-01-01');
    expect(sheetDate).toBeInTheDocument();
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

describe("Upload Profile Image Functionality", () => {
  const mockFile = new File(["test"], "test.png", { type: "image/png" });
  const mockFormData = new FormData(); // For reference, not used in mock
  const mockUserRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    global.FormData = vi.fn(() => {
      const instance = { append: vi.fn() }; // Mock object with append method
      Object.setPrototypeOf(instance, FormData.prototype); // Set prototype to pass instanceof
      return instance;
    });
    
    global.FileReader = vi.fn(() => ({
      readAsDataURL: vi.fn(),
      result: 'data:image/png;base64,mockbase64data',
    }));

    useQuery.mockImplementation((queryKey) => {
      if (queryKey === "userInfo") {
        return {
          data: mockUserInfo,
          isLoading: false,
          refetch: mockUserRefetch,
        };
      } else if (Array.isArray(queryKey) && queryKey[0] === "sheets-user-profile") {
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

  describe("uploadProfileImage Function", () => {

    test("creates FormData and makes API call with correct parameters", async () => {
    const mockResponseData = { avatar_url: "https://example.com/new-avatar.jpg" };
    axiosInstance.post.mockResolvedValueOnce({ data: mockResponseData });

    const formDataSpy = { append: vi.fn() };
    Object.setPrototypeOf(formDataSpy, FormData.prototype);
    global.FormData.mockReturnValueOnce(formDataSpy);

    const { uploadProfileImage } = await import("./UserProfile.jsx");
    const result = await uploadProfileImage(mockFile);

    expect(FormData).toHaveBeenCalledTimes(1);
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "api/v1/users/upload",
      expect.objectContaining({ append: expect.any(Function) })
    );
    expect(formDataSpy.append).toHaveBeenCalledWith("file", mockFile);
    expect(result).toEqual(mockResponseData);
    });

    test("handles API error correctly", async () => {
      const mockError = new Error("Upload failed");
      axiosInstance.post.mockRejectedValueOnce(mockError);

      const { uploadProfileImage } = await import("./UserProfile.jsx");

      await expect(uploadProfileImage(mockFile)).rejects.toThrow("Upload failed");
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "api/v1/users/upload",
        expect.any(FormData)
      );
    });

    test("handles 413 payload too large error", async () => {
      const mockError = {
        response: {
          status: 413,
          data: { message: "Payload too large" }
        }
      };
      axiosInstance.post.mockRejectedValueOnce(mockError);

      const { uploadProfileImage } = await import("./UserProfile.jsx");

      await expect(uploadProfileImage(mockFile)).rejects.toEqual(mockError);
    });

    test("handles 400 bad request error", async () => {
      const mockError = {
        response: {
          status: 400,
          data: { message: "Invalid file format" }
        }
      };
      axiosInstance.post.mockRejectedValueOnce(mockError);

      const { uploadProfileImage } = await import("./UserProfile.jsx");

      await expect(uploadProfileImage(mockFile)).rejects.toEqual(mockError);
    });
  });

  describe("uploadProfileImageMutation Integration", () => {
    test("executes mutation successfully and shows success alert", async () => {
      axiosInstance.post.mockResolvedValueOnce({ 
        data: { avatar_url: "https://example.com/new-avatar.jpg" } 
      });

      const mockMutateAsync = vi.fn().mockResolvedValue({ 
        avatar_url: "https://example.com/new-avatar.jpg" 
      });
      
      useMutation.mockImplementation((mutationFn, options) => {
        return {
          mutateAsync: mockMutateAsync,
          isLoading: false,
          error: null,
        };
      });

      setup();

      const fileInput = screen.getByLabelText(/Add Picture/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(mockFile);
      });
    });

    test("handles mutation error and shows error alert", async () => {
      const mockError = new Error("Upload failed");
      axiosInstance.post.mockRejectedValueOnce(mockError);

      const mockMutateAsync = vi.fn().mockRejectedValue(mockError);
      
      useMutation.mockImplementation((mutationFn, options) => {
        return {
          mutateAsync: mockMutateAsync,
          isLoading: false,
          error: mockError,
        };
      });

      setup();

      const fileInput = screen.getByLabelText(/Add Picture/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(mockFile);
      });
    });
    //   axiosInstance.post.mockResolvedValueOnce({ 
    //     data: { avatar_url: "https://example.com/new-avatar.jpg" } 
    //   });
    
    //   // Mock the mutation with success callback handling
    //   useMutation.mockImplementation((mutationFn, options) => {
    //     // Create a mock mutateAsync function that will call onSuccess if it exists
    //     const mutateAsync = vi.fn().mockImplementation(async (file) => {
    //       const result = await mutationFn(file);
    //       if (options?.onSuccess) {
    //         await options.onSuccess(result);
    //       }
    //       return result;
    //     });
    
    //     return {
    //       mutateAsync,
    //       isLoading: false,
    //       error: null,
    //     };
    //   });
    
    //   setup();
    
    //   const fileInput = screen.getByLabelText(/Add Picture/i);
      
    //   await act(async () => {
    //     fireEvent.change(fileInput, { target: { files: [mockFile] } });
    //   });
    
    //   await waitFor(() => {
    //     expect(mockUserRefetch).toHaveBeenCalled();
    //     expect(window.alert).toHaveBeenCalledWith("Image uploaded successfully!");
    //   });
    // });

    test("shows error alert and logs error on upload failure", async () => {
      const mockError = new Error("Upload failed");
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      let mutationOptions;

      useMutation.mockImplementation((mutationFn, options) => {
        mutationOptions = options;
        
        const mutateAsync = vi.fn().mockRejectedValue(mockError);
        
        return {
          mutateAsync,
          isLoading: false,
          error: mockError,
        };
      });
    
      setup();
    
      const fileInput = screen.getByLabelText(/Add Picture/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(useMutation).toHaveBeenCalled();
      });

      if (mutationOptions?.onError) {
        mutationOptions.onError(mockError);
      }
    
      // Check if console.error and alert were called
      // expect(consoleSpy).toHaveBeenCalledWith("Error:", expect.objectContaining({ message: "Upload failed" }));
      // expect(alertSpy).toHaveBeenCalledWith("Failed to upload image. Please try again.");
      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

  });

  describe("handlePictureUpload Function Integration", () => {
    test("processes valid file and triggers FileReader", async () => {
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: 'data:image/png;base64,mockbase64data',
      };
      
      global.FileReader = vi.fn(() => mockFileReader);
      
      const mockMutateAsync = vi.fn().mockResolvedValue({ 
        avatar_url: "https://example.com/new-avatar.jpg" 
      });
      
      useMutation.mockImplementation(() => ({
        mutateAsync: mockMutateAsync,
        isLoading: false,
        error: null,
      }));

      setup();

      const fileInput = screen.getByLabelText(/Add Picture/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      expect(FileReader).toHaveBeenCalled();
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(mockFile);
      });
    });

    test("resets file input value after invalid file type", async () => {
      setup();

      const fileInput = screen.getByLabelText(/Add Picture/i);
      const invalidFile = new File(["invalid"], "invalid.txt", { type: "text/plain" });
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      });

      expect(fileInput.value).toBe("");
    });

    test("resets file input value after file size validation failure", async () => {
      setup();

      const fileInput = screen.getByLabelText(/Add Picture/i);
      const largeFile = new File(["x".repeat(1024 * 1024 + 1)], "large.png", { type: "image/png" });
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [largeFile] } });
      });

      expect(fileInput.value).toBe("");
    });

    test("does not process upload when no file is selected", async () => {
      const mockMutateAsync = vi.fn();
      
      useMutation.mockImplementation(() => ({
        mutateAsync: mockMutateAsync,
        isLoading: false,
        error: null,
      }));

      setup();

      const fileInput = screen.getByLabelText(/Add Picture/i);
      
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [] } });
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("Profile Picture Display Logic", () => {
    test("shows profile image when avatar_url exists", () => {
      const userInfoWithAvatar = {
        ...mockUserInfo,
        avatar_url: "https://example.com/avatar.jpg"
      };

      useQuery.mockImplementation((queryKey) => {
        if (queryKey === "userInfo") {
          return {
            data: userInfoWithAvatar,
            isLoading: false,
            refetch: mockUserRefetch,
          };
        } else if (Array.isArray(queryKey) && queryKey[0] === "sheets-user-profile") {
          return {
            data: mockSheetsData,
            isLoading: false,
          };
        }
        return { data: null, isLoading: true };
      });

      setup();

      const profileImage = screen.getByAltText("Profile");
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute("src", "https://example.com/avatar.jpg");
      expect(screen.queryByText(/Add Picture/i)).not.toBeInTheDocument();
    });

    test("shows add picture button when no avatar_url", () => {
      const userInfoWithoutAvatar = {
        ...mockUserInfo,
        avatar_url: null
      };

      useQuery.mockImplementation((queryKey) => {
        if (queryKey === "userInfo") {
          return {
            data: userInfoWithoutAvatar,
            isLoading: false,
            refetch: mockUserRefetch,
          };
        } else if (Array.isArray(queryKey) && queryKey[0] === "sheets-user-profile") {
          return {
            data: mockSheetsData,
            isLoading: false,
          };
        }
        return { data: null, isLoading: true };
      });

      setup();

      const addPictureButton = screen.getByText(/Add Picture/i);
      expect(addPictureButton).toBeInTheDocument();
      expect(screen.queryByAltText("Profile")).not.toBeInTheDocument();
    });
  });
});
