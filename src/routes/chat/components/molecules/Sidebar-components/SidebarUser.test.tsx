import {
  mockAxios,
  mockTolgee,
  mockLocalStorage,
} from "@/test-utils/CommonMocks.ts";
import { QueryClient, QueryClientProvider } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SidebarUser } from "./SidebarUser.tsx";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-query", async () => {
  const actual = await vi.importActual("react-query");
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })),
  };
});

const mockPechaLogout = vi.fn();
vi.mock("@/config/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isLoggedIn: true,
    login: vi.fn(),
    logout: mockPechaLogout,
  })),
}));

const mockAuth0Logout = vi.fn();
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: false,
    logout: mockAuth0Logout,
    loginWithRedirect: vi.fn(),
    user: null,
  })),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    size?: string;
    className?: string;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    side?: string;
    align?: string;
    className?: string;
  }) => (
    <div data-testid="dropdown-content" {...props}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick} type="button">
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span data-testid="avatar-fallback" className={className}>
      {children}
    </span>
  ),
}));

vi.mock("react-icons/bs", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    BsBoxArrowRight: () => <span data-testid="logout-icon">LogoutIcon</span>,
  };
});

vi.mock("react-icons/fi", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    FiUser: () => <span data-testid="user-icon">UserIcon</span>,
  };
});

mockAxios();

describe("SidebarUser Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let localStorageMock: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <SidebarUser />
          </TolgeeProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  test("renders user component", () => {
    setup();

    expect(screen.getByText("P")).toBeInTheDocument();
  });

  test("renders dropdown menu with Profile option", async () => {
    setup();

    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  test("renders dropdown menu with Logout option", async () => {
    setup();

    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("navigates to profile when Profile is clicked", async () => {
    setup();

    const profileOption = screen.getByText("Profile");
    await userEvent.click(profileOption);

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  test("handles logout and clears storage", async () => {
    setup();

    const logoutOption = screen.getByText("Logout");
    await userEvent.click(logoutOption);

    expect(localStorageMock.removeItem).toHaveBeenCalled();
    expect(mockPechaLogout).toHaveBeenCalled();
  });

  test("navigates to login after pecha logout", async () => {
    setup();

    const logoutOption = screen.getByText("Logout");
    await userEvent.click(logoutOption);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
