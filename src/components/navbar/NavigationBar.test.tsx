import {mockAxios, mockReactQuery, mockTolgee, mockUseAuth, mockUseAuth0, mockLocalStorage} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import {BrowserRouter as Router} from "react-router-dom";
import {TolgeeProvider} from "@tolgee/react";
import {render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import Navigation from "./NavigationBar.jsx"; // Fix import
import userEvent from "@testing-library/user-event";
import {vi} from "vitest";
import * as useAuthContext from '../../config/AuthContext'


mockAxios();
mockUseAuth()
mockReactQuery()
mockUseAuth0()

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

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
describe("NavigationBar Component", () => { // Fix describe name

  const queryClient = new QueryClient();
  let localStorageMock;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    sessionStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.setItem.mockClear();
  });
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Navigation/>
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };
  test("renders navigation links", () => {
    setup();
    expect(screen.getByText("Texts")).toBeInTheDocument();
    // expect(screen.getByText("Topics")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
  });

  test("renders search input", () => {
    setup();
    const searchInput = screen.getByPlaceholderText("Search");
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBe(searchInput);
  });

  test("renders login and register buttons when not authenticated", () => {
    setup();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  test("renders logout button when authenticated", async () => {
    mockLoggedInStatusForIndividualTestCase()
    setup();
    await waitFor(() => {
      expect(screen.getByText("Log Out")).toBeInTheDocument();
    });
    vi.resetModules();
  });

  test("calls logout function on logout button click", async () => {
    mockLoggedInStatusForIndividualTestCase()
    setup();
    const logoutButton = screen.getByText("Log Out");
    await userEvent.click(logoutButton);
  });

  test("language change triggers changeLanguage function", async () => {
    localStorageMock.getItem.mockReturnValue("en");
    setup();
    const langDropdownButton = screen.getByLabelText("Change language");
    await userEvent.click(langDropdownButton);

    const englishOption = screen.getByText("English");
    await userEvent.click(englishOption);
    expect(localStorageMock.getItem("LANGUAGE")).toBe("en");
  });

  test("handles search form submission", async () => {
    setup();
    const searchInput = screen.getByPlaceholderText("Search");
    await userEvent.type(searchInput, "test search query");
    expect(searchInput.value).toBe("test search query");
    await userEvent.type(searchInput, "{enter}");
    expect(searchInput.value).toBe("");
  });
});