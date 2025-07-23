import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth, mockUseAuth0} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import {render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import NavigationBar from "./NavigationBar.jsx";
import userEvent from "@testing-library/user-event";
import {vi} from "vitest";
import * as useAuthContext from '../../config/AuthContext'


mockAxios();
mockUseAuth()
mockReactQuery()
mockUseAuth0()

const mockLoggedInStatusForIndividualTestCase = () => { vi.spyOn(useAuthContext, "useAuth").mockReturnValue({
    isLoggedIn: true,
    login: vi.fn(),
    logout: vi.fn(),
  });
  
  const mockUseAuth0 = vi.spyOn(require('@auth0/auth0-react'), 'useAuth0');
  mockUseAuth0.mockReturnValue({
    isAuthenticated: true,  // Mocked value for this test case
    logout: vi.fn(),
    loginWithRedirect: vi.fn(),
    user: null,
  });

}
describe("UserRegistration Component", () => {

  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <NavigationBar/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };
  test("renders navigation links", () => {
    setup();
    expect(screen.getByText("Texts")).toBeInTheDocument();
    expect(screen.getByText("Topics")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  test("renders search input and button", () => {
    setup();
    const searchInputs = screen.getAllByPlaceholderText("Search");
    expect(searchInputs).toHaveLength(2); // One for mobile, one for desktop
  
    const searchButtons = screen.getAllByText("Search");
    expect(searchButtons).toHaveLength(2); 
    
    expect(searchInputs[0]).toBeInTheDocument();
    expect(searchInputs[1]).toBeInTheDocument();
  });

  test("renders login and register buttons when not authenticated", () => {
    setup();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  test("renders logout button when authenticated", async () => {
    mockLoggedInStatusForIndividualTestCase()
    setup();
    await waitFor(()=> {
      expect(screen.getByText("Log Out")).toBeInTheDocument();

    })
    vi.resetModules();
  });

  test("calls logout function on logout button click", async () => {
    mockLoggedInStatusForIndividualTestCase()
    setup();
    const logoutButton = screen.getByText("Log Out");
    await userEvent.click(logoutButton);
  });

  test("language change triggers changeLanguage function", async () => {
    setup();
    const mobileDropdown = screen.getByTestId("dropdown-basic");
    await userEvent.click(mobileDropdown);
    const mobileEnglishOption = screen.getByText("English");
    await userEvent.click(mobileEnglishOption);
    expect(localStorage.getItem("language")).toBe("en");
    
    await userEvent.click(mobileDropdown);
    const mobileTibetanOption = screen.getByText("བོད་ཡིག");
    await userEvent.click(mobileTibetanOption);
    expect(localStorage.getItem("language")).toBe("bo-IN");
    
    const desktopDropdown = screen.getByTestId("dropdown-basic-desktop");
    await userEvent.click(desktopDropdown);
    const desktopEnglishOption = screen.getAllByText("English")[1];
    await userEvent.click(desktopEnglishOption);
    expect(localStorage.getItem("language")).toBe("en");
  });
  
  test("handles search form submission for both search forms", async () => {
  setup();
  
  const searchInputs = screen.getAllByPlaceholderText("Search");
  const searchButtons = screen.getAllByText("Search");
  
  for (let i = 0; i < searchInputs.length; i++) {
    const searchInput = searchInputs[i];
    const searchButton = searchButtons[i];
    
    await userEvent.type(searchInput, "test search query");
    expect(searchInput.value).toBe("test search query");
    await userEvent.click(searchButton);
    await userEvent.clear(searchInput);
  }
});
});