import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import UserProfile from "./UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";
import { ACCESS_TOKEN } from "../../utils/Constants.js";

mockAxios();
mockUseAuth()
mockReactQuery()

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
    ]
  };
  beforeAll(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll(() => {
    window.alert.mockRestore(); // Restore the original implementation of alert
  });

  beforeEach(() => {
    useQuery.mockImplementation(() => ({
      data: mockUserInfo,
      isLoading: false,
    }));
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <UserProfile />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the user profile with all details", () => {
    setup();

    // Check if name and job title ares rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();

    // Check if location and education details are rendered
    expect(screen.getByText("Bangalore")).toBeInTheDocument();
    expect(screen.getByText("Master of Computer Application (MCA) Bachelor of Science, Physics")).toBeInTheDocument();
  });

  test("Edit profile button", () => {
    setup();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  test("renders all social media links with correct attributes", () => {
    setup();

    // Check social media links
    const twitterLink = screen.getByLabelText("x.com");
    const youtubeLink = screen.getByLabelText("youtube");
    const linkedInLink = screen.getByLabelText("linkedin");
    const facebookLink = screen.getByLabelText("facebook");
    const email = screen.getByLabelText("email");

    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute("href", "https://x.com");

    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute("href", "https://youtube.com");

    expect(linkedInLink).toBeInTheDocument();
    expect(linkedInLink).toHaveAttribute("href", "https://linkedin.com");

    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute("href", "https://facebook.com");

    expect(email).toBeInTheDocument();
    expect(email).toHaveAttribute("href", "mailto:test@pecha.com");
  });

  test("renders tabs and their content", () => {
    setup();

    // Check if the tabs are rendered
    expect(screen.getByLabelText("profile.sheets.title")).toBeInTheDocument();
    expect(screen.getByLabelText("profile.collections.title")).toBeInTheDocument();
    expect(screen.getByLabelText("profile.notes.title")).toBeInTheDocument();
    expect(screen.getByLabelText("profile.text_tracker.title")).toBeInTheDocument();

    // Check content for each tab
    fireEvent.click(screen.getByLabelText("profile.sheets.title"));
    expect(screen.getByLabelText("profile.sheets.title")).toBeInTheDocument();
    expect(screen.getByText("profile.sheets.description")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("profile.collections.title"));
    expect(screen.getByLabelText("profile.collections.title")).toBeInTheDocument();
    expect(screen.getByText("profile.collections.description")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("profile.notes.title"));
    expect(screen.getByLabelText("profile.notes.title")).toBeInTheDocument();
    expect(screen.getByText("profile.notes.description")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("profile.text_tracker.title"));
    expect(screen.getByLabelText("profile.text_tracker.title")).toBeInTheDocument();
    expect(screen.getByText("profile.text_tracker.descriptions")).toBeInTheDocument();
  });

  test("picture upload", async () => {
    setup();

    const fileInput = screen.getByLabelText("Add Picture", { selector: "input" });

    const file = new File(["test".repeat(900 * 900)], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });


    const invalidFile = new File(["test2".repeat(100 * 100 + 1)], "test.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    const largeFile = new File(["test3".repeat(1024 * 1024 + 1)], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
  });

  test("handles logout correctly", () => {
    setup();
    const logoutText = screen.getByText("Log Out");
    fireEvent.click(logoutText);

    // Check if logout logic works correctly by verifying localStorage and sessionStorage are cleared
    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull();
    expect(sessionStorage.getItem(ACCESS_TOKEN)).toBeNull();
  });

});
