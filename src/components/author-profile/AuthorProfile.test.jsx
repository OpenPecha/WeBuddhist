import React from "react";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import AuthorProfile, { fetchAuthorInfo } from "./AuthorProfile.jsx";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import axiosInstance from "../../config/axios-config.js";

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
    useParams: vi.fn(),
  };
});

vi.mock("../../utils/helperFunctions.jsx", () => ({
  mapLanguageCode: (code) => code === "bo-IN" ? "bo" : code,
  getEarlyReturn: vi.fn(() => null)
}));

vi.mock("../../utils/constants.js", () => ({
  LANGUAGE: "LANGUAGE",
  siteName: "WeBuddhist",
}));

vi.mock("../user-profile/tabs/sheet-listing/SheetListing.jsx", () => ({
  default: ({ userInfo }) => (
    <div data-testid="sheet-listing">
      Sheet Listing for {userInfo?.firstname} {userInfo?.lastname}
    </div>
  )
}));

describe("AuthorProfile Component", () => {
  const queryClient = new QueryClient();
  const mockAuthorData = {
    firstname: "John",
    lastname: "Doe",
    title: "Senior Developer",
    location: "San Francisco, CA",
    educations: ["Computer Science", "Software Engineering"],
    followers: 150,
    following: 75,
    avatar_url: "https://example.com/avatar.jpg",
    email: "john.doe@example.com",
    social_profiles: [
      { account: "linkedin", url: "https://linkedin.com/in/johndoe" },
      { account: "x.com", url: "https://x.com/johndoe" },
      { account: "email", url: "john.doe@example.com" },
      { account: "facebook", url: "" },
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ username: "johndoe" });
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockAuthorData,
      isLoading: false,
      error: null,
    }));
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider
            fallback={"Loading tolgee..."}
            tolgee={mockTolgee}
          >
            <AuthorProfile />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders AuthorProfile component", () => {
    setup();
    expect(document.querySelector(".user-profile")).toBeInTheDocument();
    expect(document.querySelector(".webuddhist-user-profile")).toBeInTheDocument();
    expect(document.querySelector(".section1")).toBeInTheDocument();
    expect(document.querySelector(".section2")).toBeInTheDocument();
  });

  test("displays author basic information correctly", () => {
    setup();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
  });

  test("displays author location and education", () => {
    setup();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    expect(screen.getByText("Computer Science Software Engineering")).toBeInTheDocument();
  });

  test("displays followers and following count", () => {
    setup();
    expect(screen.getByText("150 common.followers")).toBeInTheDocument();
    expect(screen.getByText("75 common.following")).toBeInTheDocument();
  });

  test("renders profile image when avatar_url is provided", () => {
    setup();
    const profileImage = document.querySelector(".profile-image");
    expect(profileImage).toBeInTheDocument();
    expect(profileImage.src).toBe("https://example.com/avatar.jpg");
    expect(profileImage.alt).toBe("Profile");
  });

  test("renders fallback when no avatar_url is provided", () => {
    const authorDataWithoutAvatar = { ...mockAuthorData, avatar_url: null };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: authorDataWithoutAvatar,
      isLoading: false,
      error: null,
    }));

    setup();
  });

  test("renders social links correctly", () => {
    setup();
    const socialLinks = document.querySelector(".social-links");
    expect(socialLinks).toBeInTheDocument();
    
    const links = socialLinks.querySelectorAll("a");
    expect(links).toHaveLength(3); 
    
    const linkedinLink = Array.from(links).find(link => 
      link.getAttribute("href") === "https://linkedin.com/in/johndoe"
    );
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink.getAttribute("aria-label")).toBe("linkedin");
    
    const emailLink = Array.from(links).find(link => 
      link.getAttribute("href") === "mailto:john.doe@example.com"
    );
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.getAttribute("aria-label")).toBe("email");
  });


  test("renders tabs container with stories tab", () => {
    setup();
    const tabsContainer = document.querySelector(".tabs-container");
    expect(tabsContainer).toBeInTheDocument();
    
    const storiesTab = screen.getByText("profile.tab.stories");
    expect(storiesTab).toBeInTheDocument();
  });

  test("renders SheetListing component", () => {
    setup();
    expect(screen.getByTestId("sheet-listing")).toBeInTheDocument();
    expect(screen.getByText("Sheet Listing for John Doe")).toBeInTheDocument();
  });

  test("handles loading state", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }));

    setup();
    expect(screen.getByText("common.loading")).toBeInTheDocument();
    expect(document.querySelector(".user-profile")).not.toBeInTheDocument();
  });


  test("handles author data without educations", () => {
    const authorDataWithoutEducations = { 
      ...mockAuthorData, 
      educations: [] 
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: authorDataWithoutEducations,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    expect(screen.queryByText("Computer Science Software Engineering")).not.toBeInTheDocument();
  });

  test("handles author data without location", () => {
    const authorDataWithoutLocation = { 
      ...mockAuthorData, 
      location: null 
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: authorDataWithoutLocation,
      isLoading: false,
      error: null,
    }));

    setup();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("San Francisco, CA")).not.toBeInTheDocument();
  });

  test("handles author data with no social profiles", () => {
    const authorDataWithoutSocial = { 
      ...mockAuthorData, 
      social_profiles: [] 
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: authorDataWithoutSocial,
      isLoading: false,
      error: null,
    }));

    setup();
    const socialLinks = document.querySelector(".social-links");
    expect(socialLinks).toBeInTheDocument();
    expect(socialLinks.querySelectorAll("a")).toHaveLength(0);
  });

  test("uses correct username from params in query", () => {
    useParams.mockReturnValue({ username: "testuser" });
    const useQuerySpy = vi.spyOn(reactQuery, "useQuery");
    
    setup();
    
    expect(useQuerySpy).toHaveBeenCalledWith(
      "userInfo",
      expect.any(Function),
      { retry: false, refetchOnWindowFocus: false }
    );
  });

  test("fetches author info with correct parameters", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockAuthorData });

    const result = await fetchAuthorInfo("johndoe");
    
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/v1/users/johndoe");
    expect(result).toEqual(mockAuthorData);
  });

  test("renders profile sections in correct structure", () => {
    setup();
    
    const section1 = document.querySelector(".section1");
    const section2 = document.querySelector(".section2");
    
    expect(section1).toBeInTheDocument();
    expect(section2).toBeInTheDocument();
    
    expect(section1.querySelector(".profile-left")).toBeInTheDocument();
    expect(section1.querySelector(".profile-right")).toBeInTheDocument();
    
    expect(section2.querySelector(".tabs-container")).toBeInTheDocument();
  });

});
