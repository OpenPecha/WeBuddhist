import { fireEvent, render, screen, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import UserProfile, { fetchUserInfo } from "./UserProfile.tsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
} from "../../test-utils/CommonMocks.ts";
import { TolgeeProvider } from "@tolgee/react";
import * as ReactRouterDom from "react-router-dom";
import axiosInstance from "../../config/axios-config.ts";
import { vi, beforeEach, test, expect, describe } from "vitest";

// Mock react-router-dom for the navigation test
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(() => ({})),
  };
});

// Mock SheetListing component
vi.mock("./tabs/sheet-listing/SheetListing.tsx", () => ({
  default: ({ userInfo }) => (
    <div data-testid="sheet-listing">
      <div>Sample Sheet 1</div>
      <div>123</div>
      <div>2023-01-01</div>
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
  educations: [
    "Master of Computer Application (MCA)",
    "Bachelor of Science, Physics",
  ],
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
    </Router>,
  );
};

describe("UserProfile Component", () => {
  const mockedNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    ReactRouterDom.useNavigate.mockImplementation(() => mockedNavigate);
    ReactRouterDom.useParams.mockImplementation(() => ({}));

    useQuery.mockImplementation((queryKey) => {
      if (queryKey[0] === "userInfo") {
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
    expect(
      screen.getByText(
        "Master of Computer Application (MCA) Bachelor of Science, Physics",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Followers")).toBeInTheDocument();
    expect(screen.getByText("Following")).toBeInTheDocument();
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
    expect(twitterLink.querySelector("svg")).toBeInTheDocument();
    expect(youtubeLink.querySelector("svg")).toBeInTheDocument();
    expect(linkedInLink.querySelector("svg")).toBeInTheDocument();
    expect(facebookLink.querySelector("svg")).toBeInTheDocument();
    expect(emailLink.querySelector("svg")).toBeInTheDocument();
  });

  test("handles edit profile navigation correctly", async () => {
    setup();

    const editButton = screen.getByText("Edit Profile");
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(mockedNavigate).toHaveBeenCalledWith("/edit-profile", {
      state: { userInfo: mockUserInfo },
    });
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

  test("displays profile image when avatar_url exists", () => {
    const userInfoWithAvatar = {
      ...mockUserInfo,
      avatar_url: "https://example.com/avatar.jpg",
    };

    useQuery.mockImplementation(() => ({
      data: userInfoWithAvatar,
      isLoading: false,
      refetch: vi.fn(),
    }));

    setup();

    const avatarContainer = document.querySelector('[data-slot="avatar"]');
    expect(avatarContainer).toBeInTheDocument();
  });

  test("adds email to social profiles when social_profiles exists but has no email entry", () => {
    const userInfoWithSocialButNoEmail = {
      ...mockUserInfo,
      social_profiles: [
        { account: "linkedin", url: "https://linkedin.com" },
        { account: "x.com", url: "https://x.com" },
      ],
      email: "test@pecha.com",
    };

    useQuery.mockImplementation(() => ({
      data: userInfoWithSocialButNoEmail,
      isLoading: false,
      refetch: vi.fn(),
    }));

    setup();

    const emailLink = screen.getByLabelText("email");
    expect(emailLink).toHaveAttribute("href", "mailto:test@pecha.com");
  });

  test("useQuery is called with correct queryFn that calls fetchUserInfo", () => {
    let capturedQueryFn;

    useQuery.mockImplementation((queryKey, queryFn) => {
      capturedQueryFn = queryFn;
      return {
        data: mockUserInfo,
        isLoading: false,
        refetch: vi.fn(),
      };
    });

    setup();

    expect(capturedQueryFn).toBeDefined();

    axiosInstance.get.mockResolvedValueOnce({ data: mockUserInfo });
    capturedQueryFn();

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/info");
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
        { account: "linkedin", url: "https://linkedin.com/johndoe" },
      ],
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
      { status: 500, message: "Internal Server Error" },
    ];

    for (const errorCase of errorCases) {
      const mockError = {
        response: {
          status: errorCase.status,
          data: { message: errorCase.message },
        },
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
