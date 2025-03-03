import { fireEvent, render, screen } from "@testing-library/react";
import * as ReactRouterDom from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
import EditUserProfile from "./EditUserProfile.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { mockAxios, mockReactQuery, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import "@testing-library/jest-dom";
import { TolgeeProvider } from "@tolgee/react";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom"); // Import the actual module for non-mocked exports
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({
      state: {
        userInfo: {
          firstname: "John",
          lastname: "Doe",
          title: "Developer",
          organization: "Tech Corp",
          website: "https://example.com",
          location: "New York",
          educations: ["B.Sc. Computer Science"],
          about_me: "Software Engineer with 5 years of experience.",
          email: "john.doe@example.com",
          avatar_url: "https://profile.example.com",
          "x.com": "@johndoe",
          linkedIn: "https://linkedin.com/in/johndoe",
          facebook: "https://facebook.com/johndoe",
          youtube: "https://youtube.com/johndoe",
        },
      },
    })),
  };
});

mockAxios();
mockUseAuth();
mockReactQuery();

// Mock the translation function
vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => {
        const translations = {
          "edit_profile.header": "Edit Profile",
          "profile.personal_details": "Personal Details",
          "sign_up.form.first_name": "First Name",
          "sign_up.form.last_name": "Last Name",
          "topic.admin.title": "Title",
          "edit_profile.organization": "Organization",
          "edit_profile.location": "Location",
          "edit_profile.education_info": "Education",
          "profile.enter-your-education": "Enter your education",
          "edit_profile.line_add": "Add line",
          "edit_profile.about_me": "About Me",
          "profile.contact_details": "Contact Details",
          "common.button.cancel": "Cancel",
          "common.button.save": "Save",
          "profile.enter-your-first-name": "Enter your first name",
          "profile.enter-your-last-name": "Enter your last name",
          "profile.enter-your-title": "Enter your title",
          "profile.enter-your-organization": "Enter your organization",
          "profile.enter-your-location": "Enter your location",
          "profile.tell-us-about-yourself": "Tell us about yourself",
          "common.email": "Email",
          "common.x.com": "X.com",
          "common.linkedin": "LinkedIn",
          "common.facebook": "Facebook",
          "common.youtube": "YouTube",
          "profile.enter-your-email": "Enter your email",
          "profile.enter-your-x.com": "Enter your X.com",
          "profile.enter-your-linkedin": "Enter your LinkedIn",
          "profile.enter-your-facebook": "Enter your Facebook",
          "profile.enter-your-youtube": "Enter your YouTube",
        };
        return translations[key] || key;
      }
    })
  };
});

describe("EditUserProfile Component", () => {
  const queryClient = new QueryClient();

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <EditUserProfile />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  it("renders the form with pre-filled values from userInfo", () => {
    setup();


    expect(screen.getByLabelText("First Name")).toHaveValue("John");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Title")).toHaveValue("Developer");
    expect(screen.getByLabelText("Organization")).toHaveValue("Tech Corp");
    expect(screen.getByLabelText("Location")).toHaveValue("New York");
  });

  it("updates the form values when the user types in the input fields", () => {
    setup();


    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });

    expect(firstNameInput).toHaveValue("Jane");
  });

  it("adds a new education field when the add button is clicked", async () => {
    setup();


    const addButton = screen.getByText("Add line");
    fireEvent.click(addButton);
    
    // After clicking the Add button, there should be two education fields
    const educationInputs = screen.getAllByPlaceholderText("Enter your education");
    expect(educationInputs).toHaveLength(2);
  });

  it("Cancel button", () => {
    setup();
    expect(screen.getByText("Cancel")).toBeInTheDocument()

  });

  it("Submit button", () => {
    const mockedUsedNavigate = vi.fn();
    vi.spyOn(ReactRouterDom, "useNavigate").mockImplementation(() => mockedUsedNavigate);
    setup();
    const submitButton = screen.getByText("Save");
    fireEvent.click(submitButton);

    expect(screen.getByText("Save")).toBeInTheDocument()
  });
});
