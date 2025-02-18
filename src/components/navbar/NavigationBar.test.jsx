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
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
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
    const options = screen.getByTestId("dropdown-basic");
    await userEvent.click(options);

    const englishOption = screen.getByText("English")
    await userEvent.click(englishOption);

    expect(localStorage.getItem("language")).toBe("en");
    await userEvent.click(options);

    const hebrewOption = screen.getByText("བོད་ཡིག")
    await userEvent.click(hebrewOption);

    expect(localStorage.getItem("language")).toBe("bo-IN");
  });

});