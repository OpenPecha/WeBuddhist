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
          social_profiles: [
            { account: "email", url: "john.doe@example.com" },
            { account: "x.com", url: "@johndoe" },
            { account: "linkedin", url: "https://linkedin.com/in/johndoe" },
            { account: "facebook", url: "https://facebook.com/johndoe" },
            { account: "youtube", url: "https://youtube.com/johndoe" },
          ],
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

  const setup = (customUserInfo = null) => {
    if (customUserInfo) {
      vi.spyOn(ReactRouterDom, "useLocation").mockReturnValue({
        state: { userInfo: customUserInfo }
      });
    }
    
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders the form with pre-filled values from userInfo", () => {
      setup();

      expect(screen.getByLabelText("First Name")).toHaveValue("John");
      expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
      expect(screen.getByLabelText("Title")).toHaveValue("Developer");
      expect(screen.getByLabelText("Organization")).toHaveValue("Tech Corp");
      expect(screen.getByLabelText("Location")).toHaveValue("New York");
    });

    it("renders with empty form when no userInfo is provided", () => {
      setup({});

      expect(screen.getByLabelText("First Name")).toHaveValue("");
      expect(screen.getByLabelText("Last Name")).toHaveValue("");
      expect(screen.getByLabelText("Title")).toHaveValue("");
      expect(screen.getByLabelText("Organization")).toHaveValue("");
      expect(screen.getByLabelText("Location")).toHaveValue("");
    });

    it("renders both Personal Details and Contact Details tabs", () => {
      setup();

      expect(screen.getByRole('button', { name: "Personal Details" })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: "Contact Details" })).toBeInTheDocument();
    });

    it("renders Personal Details tab as active by default", () => {
      setup();

      const personalDetailsTab = screen.getByRole('button', { name: "Personal Details" });
      expect(personalDetailsTab).toHaveClass('active');
    });
  });

  describe("Form Input Handling", () => {
    it("updates the form values when the user types in the input fields", () => {
      setup();

      const firstNameInput = screen.getByLabelText("First Name");
      fireEvent.change(firstNameInput, { target: { value: "Jane" } });

      expect(firstNameInput).toHaveValue("Jane");
    });

    it("updates multiple form fields correctly", () => {
      setup();

      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");
      const titleInput = screen.getByLabelText("Title");

      fireEvent.change(firstNameInput, { target: { value: "Jane" } });
      fireEvent.change(lastNameInput, { target: { value: "Smith" } });
      fireEvent.change(titleInput, { target: { value: "Senior Developer" } });

      expect(firstNameInput).toHaveValue("Jane");
      expect(lastNameInput).toHaveValue("Smith");
      expect(titleInput).toHaveValue("Senior Developer");
    });

    it("updates about me textarea correctly", () => {
      setup();

      const aboutMeTextarea = screen.getByLabelText("About Me");
      fireEvent.change(aboutMeTextarea, { target: { value: "Updated bio" } });

      expect(aboutMeTextarea).toHaveValue("Updated bio");
    });
  });

  describe("Education Management", () => {
    it("adds a new education field when the add button is clicked", () => {
      setup();
      
      const addButton = screen.getByText("Add line");
      fireEvent.click(addButton);

      const educationInputs = screen.getAllByPlaceholderText("Enter your education");
      expect(educationInputs).toHaveLength(2);
    });

    it("removes education field when remove button is clicked", () => {
      setup();
      
      const addButton = screen.getByText("Add line");
      fireEvent.click(addButton);
      
      let educationInputs = screen.getAllByPlaceholderText("Enter your education");
      expect(educationInputs).toHaveLength(2);
      
      const removeButtons = screen.getAllByText("✕");
      fireEvent.click(removeButtons[0]);
      
      educationInputs = screen.getAllByPlaceholderText("Enter your education");
      expect(educationInputs).toHaveLength(1);
    });

    it("updates education field values correctly", () => {
      setup();
      
      const educationInput = screen.getByPlaceholderText("Enter your education");
      fireEvent.change(educationInput, { target: { value: "M.Sc. Computer Science" } });
      
      expect(educationInput).toHaveValue("M.Sc. Computer Science");
    });
  });

  describe("Social Profiles with social_profiles Array", () => {
    const userInfoWithSocialProfiles = {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      social_profiles: [
        { account: "email", url: "john@example.com" },
        { account: "x.com", url: "https://x.com/johndoe" },
        { account: "linkedin", url: "https://linkedin.com/in/johndoe" },
        { account: "facebook", url: "https://facebook.com/johndoe" },
        { account: "youtube", url: "" }
      ]
    };

    it("populates social media fields from social_profiles array", () => {
      setup(userInfoWithSocialProfiles);

      const contactDetailsTab = screen.getByRole('button', { name: "Contact Details" });
      fireEvent.click(contactDetailsTab);

      expect(screen.getByPlaceholderText("Enter your email")).toHaveValue("john@example.com");
      expect(screen.getByPlaceholderText("Enter your X.com")).toHaveValue("https://x.com/johndoe");
      expect(screen.getByPlaceholderText("Enter your LinkedIn")).toHaveValue("https://linkedin.com/in/johndoe");
      expect(screen.getByPlaceholderText("Enter your Facebook")).toHaveValue("https://facebook.com/johndoe");
      expect(screen.getByPlaceholderText("Enter your YouTube")).toHaveValue("");
    });

    it("handles missing social_profiles array gracefully", () => {
      const userInfoWithoutSocialProfiles = {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com"
      };

      setup(userInfoWithoutSocialProfiles);

      const contactDetailsTab = screen.getByRole('button', { name: "Contact Details" });
      fireEvent.click(contactDetailsTab);

      expect(screen.getByPlaceholderText("Enter your email")).toHaveValue("john@example.com");
      expect(screen.getByPlaceholderText("Enter your X.com")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter your LinkedIn")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter your Facebook")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter your YouTube")).toHaveValue("");
    });

    it("updates social profile URLs correctly", () => {
      setup(userInfoWithSocialProfiles);

      const contactDetailsTab = screen.getByRole('button', { name: "Contact Details" });
      fireEvent.click(contactDetailsTab);

      const linkedInInput = screen.getByPlaceholderText("Enter your LinkedIn");
      fireEvent.change(linkedInInput, { target: { value: "https://linkedin.com/in/newprofile" } });

      expect(linkedInInput).toHaveValue("https://linkedin.com/in/newprofile");
    });
  });

  describe("Tab Navigation", () => {
    it("switches between tabs correctly", () => {
      setup();
    
      expect(screen.getByLabelText("First Name")).toBeInTheDocument();
      
      const personalDetailsTab = screen.getByRole('button', { name: "Personal Details" });
      fireEvent.click(personalDetailsTab);
      
      const contactDetailsTab = screen.getByRole('button', { name: "Contact Details" });
      fireEvent.click(contactDetailsTab);
      
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByText("Personal Details")).toBeInTheDocument(); 
    });

    it("shows correct tab as active when clicked", () => {
      setup();

      const personalDetailsTab = screen.getByRole('button', { name: "Personal Details" });
      const contactDetailsTab = screen.getByRole('button', { name: "Contact Details" });

      expect(personalDetailsTab).toHaveClass('active');
      expect(contactDetailsTab).not.toHaveClass('active');

      fireEvent.click(contactDetailsTab);

      expect(contactDetailsTab).toHaveClass('active');
      expect(personalDetailsTab).not.toHaveClass('active');
    });
  });

  describe("Form Actions", () => {
    it("calls navigate on Cancel button click", () => {
      const mockedUsedNavigate = vi.fn();
      vi.spyOn(ReactRouterDom, "useNavigate").mockImplementation(() => mockedUsedNavigate);

      setup();

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockedUsedNavigate).toHaveBeenCalledWith(-1);
    });

    it("calls mutation on Save button click", async () => {
      setup();

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await screen.findByText(/Save/);
    });
  });

  describe("Edge Cases", () => {
    it("handles null userInfo gracefully", () => {
      vi.spyOn(ReactRouterDom, "useLocation").mockReturnValue({ state: null });

      setup();

      expect(screen.getByLabelText("First Name")).toHaveValue("");
      expect(screen.getByLabelText("Last Name")).toHaveValue("");
    });

    it("handles empty educations array", () => {
      const userInfoWithEmptyEducations = {
        firstname: "John",
        lastname: "Doe",
        educations: []
      };

      setup(userInfoWithEmptyEducations);

      const educationInputs = screen.getAllByPlaceholderText("Enter your education");
      expect(educationInputs).toHaveLength(1);
      expect(educationInputs[0]).toHaveValue("");
    });
  });
});
