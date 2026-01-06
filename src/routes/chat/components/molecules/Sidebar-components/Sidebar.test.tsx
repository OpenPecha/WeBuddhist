import {
  mockAxios,
  mockTolgee,
  mockLocalStorage,
} from "@/test-utils/CommonMocks.ts";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatSidebar } from "./Sidebar.tsx";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mockNavigate = vi.fn();
let alertDialogOnOpenChange: ((open: boolean) => void) | undefined;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      "aria-label"?: string;
    }) => (
      <a href={to} {...props} tabIndex={0}>
        {children}
      </a>
    ),
  };
});

const mockResetChat = vi.fn();
const mockThreadId = null;
vi.mock("../../../context/ChatContext", () => ({
  useChat: () => ({
    threadId: mockThreadId,
    resetChat: mockResetChat,
  }),
}));

const mockDeleteThread = vi.fn();
const mockFetchNextPage = vi.fn();

interface Thread {
  id: string;
  title: string;
}

interface UseThreadsReturn {
  threads: Thread[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  deleteThread: (id: string) => void;
  isDeleting: boolean;
}

const defaultUseThreadsReturn: UseThreadsReturn = {
  threads: [],
  isLoading: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  fetchNextPage: mockFetchNextPage,
  deleteThread: mockDeleteThread,
  isDeleting: false,
};

const mockUseThreads = vi.fn(() => defaultUseThreadsReturn);

vi.mock("../../../hooks/useThreads", () => ({
  useThreads: () => mockUseThreads(),
}));

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

vi.mock("@/config/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isLoggedIn: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: false,
    logout: vi.fn(),
    loginWithRedirect: vi.fn(),
    user: null,
  })),
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => {
      const translations: Record<string, string> = {
        "chat.delete_header": "Delete Chat",
        "chat.delete_warning_message":
          "Are you sure you want to delete this chat?",
      };
      return {
        t: (key: string) => translations[key] || key,
      };
    },
  };
});

const mockInView = vi.fn(() => false);
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({
    ref: { current: null },
    inView: mockInView(),
  }),
}));

vi.mock("@/config/axios-config", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="sidebar" {...props}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-footer">{children}</div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="sidebar-group-content" {...props}>
      {children}
    </div>
  ),
  SidebarGroupLabel: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="sidebar-group-label" {...props}>
      {children}
    </div>
  ),
  SidebarHeader: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="sidebar-header" {...props}>
      {children}
    </div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
    isActive,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
    className?: string;
    tooltip?: string;
  }) => (
    <button
      data-testid="sidebar-menu-button"
      onClick={onClick}
      data-active={isActive}
      {...props}
    >
      {children}
    </button>
  ),
  SidebarMenuItem: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="sidebar-menu-item" {...props}>
      {children}
    </div>
  ),
  SidebarSeparator: () => <hr data-testid="sidebar-separator" />,
  SidebarTrigger: ({ ...props }: { className?: string }) => (
    <button data-testid="sidebar-trigger" {...props}>
      Trigger
    </button>
  ),
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
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => {
    alertDialogOnOpenChange = onOpenChange;
    return (
      <div data-testid="alert-dialog" data-open={open}>
        {open && <div>{children}</div>}
      </div>
    );
  },
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      data-testid="alert-dialog-cancel"
      onClick={() => {
        onClick?.();
        alertDialogOnOpenChange?.(false);
      }}
      {...props}
    >
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ ...props }: { className?: string }) => (
    <div data-testid="skeleton" {...props} />
  ),
}));

vi.mock("./SidebarUser.tsx", () => ({
  SidebarUser: () => <div data-testid="sidebar-user">SidebarUser</div>,
}));

vi.mock("react-icons/bs", () => ({
  BsTrash: () => <span data-testid="trash-icon">TrashIcon</span>,
}));

vi.mock("react-icons/io5", () => ({
  IoCreateOutline: () => <span data-testid="create-icon">CreateIcon</span>,
}));

vi.mock("react-icons/fa6", () => ({
  FaEllipsis: () => <span data-testid="ellipsis-icon">EllipsisIcon</span>,
}));

vi.mock("react-icons/ci", () => ({
  CiLocationArrow1: () => <span data-testid="location-icon">LocationIcon</span>,
}));

vi.mock("@/utils/Icon.tsx", () => ({
  HistoryIcon: () => <span data-testid="history-icon">HistoryIcon</span>,
}));

mockAxios();

describe("ChatSidebar Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage();
    mockInView.mockReturnValue(false);
    alertDialogOnOpenChange = undefined;
    mockUseThreads.mockReturnValue({
      threads: [],
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      deleteThread: mockDeleteThread,
      isDeleting: false,
    });
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <ChatSidebar />
          </TolgeeProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );
  };

  test("renders sidebar component with all sections", () => {
    setup();

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-content")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-footer")).toBeInTheDocument();
  });

  test("renders logo and home link", () => {
    setup();

    const homeLink = screen.getByLabelText("Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  test("renders sidebar trigger", () => {
    setup();

    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument();
  });

  test("renders New Chat button", () => {
    setup();

    const newChatButtons = screen.getAllByTestId("sidebar-menu-button");
    const newChatButton = newChatButtons.find((button) =>
      button.textContent?.includes("New Chat"),
    );
    expect(newChatButton).toBeInTheDocument();
  });

  test("handles New Chat button click", async () => {
    setup();

    const newChatButtons = screen.getAllByTestId("sidebar-menu-button");
    const newChatButton = newChatButtons.find((button) =>
      button.textContent?.includes("New Chat"),
    );

    if (newChatButton) {
      await userEvent.click(newChatButton);
      expect(mockResetChat).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/ai/new");
    }
  });

  test("renders History section with icon and label", () => {
    setup();

    expect(screen.getByTestId("history-icon")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  test("renders loading state when threads are loading", () => {
    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      isLoading: true,
    });

    setup();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders empty state when no threads exist", () => {
    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: [],
    });

    setup();

    expect(screen.getByText("No chats yet")).toBeInTheDocument();
  });

  test("renders threads when available", () => {
    const mockThreads = [
      { id: "1", title: "Thread 1" },
      { id: "2", title: "Thread 2" },
    ];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    expect(screen.getByText("Thread 1")).toBeInTheDocument();
    expect(screen.getByText("Thread 2")).toBeInTheDocument();
  });

  test("handles thread click navigation", async () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const threadButton = screen.getByText("Test Thread");
    await userEvent.click(threadButton);

    expect(mockNavigate).toHaveBeenCalledWith("/ai/thread-123");
  });

  test("renders delete dropdown menu for threads", () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const dropdownMenus = screen.getAllByTestId("dropdown-menu");
    expect(dropdownMenus.length).toBeGreaterThan(0);
  });

  test("opens delete confirmation dialog when delete is clicked", async () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const deleteItems = screen.getAllByTestId("dropdown-item");
    const deleteItem = deleteItems.find((item) =>
      item.textContent?.includes("Delete"),
    );

    if (deleteItem) {
      await userEvent.click(deleteItem);

      await waitFor(() => {
        const alertDialog = screen.getByTestId("alert-dialog");
        expect(alertDialog).toHaveAttribute("data-open", "true");
      });
    }
  });

  test("confirms delete action and calls deleteThread", async () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const deleteItems = screen.getAllByTestId("dropdown-item");
    const deleteItem = deleteItems.find((item) =>
      item.textContent?.includes("Delete"),
    );

    if (deleteItem) {
      await userEvent.click(deleteItem);

      await waitFor(() => {
        const deleteButton = screen.getByTestId("alert-dialog-action");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId("alert-dialog-action");
      await userEvent.click(deleteButton);

      expect(mockDeleteThread).toHaveBeenCalledWith("thread-123");
    }
  });

  test("cancels delete action and closes dialog", async () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const deleteItems = screen.getAllByTestId("dropdown-item");
    const deleteItem = deleteItems.find((item) =>
      item.textContent?.includes("Delete"),
    );

    if (deleteItem) {
      await userEvent.click(deleteItem);

      await waitFor(() => {
        const cancelButton = screen.getByTestId("alert-dialog-cancel");
        expect(cancelButton).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId("alert-dialog-cancel");
      await userEvent.click(cancelButton);

      await waitFor(() => {
        const alertDialog = screen.getByTestId("alert-dialog");
        expect(alertDialog).toHaveAttribute("data-open", "false");
      });
    }
  });

  test("shows skeleton loaders when fetching next page", () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
      isFetchingNextPage: true,
      hasNextPage: true,
    });

    setup();

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(3);
  });

  test("renders SidebarUser component in footer", () => {
    setup();

    expect(screen.getByTestId("sidebar-user")).toBeInTheDocument();
  });

  test("renders navigate back to homepage link", () => {
    setup();

    expect(screen.getByText("Navigate back to homepage")).toBeInTheDocument();
    expect(screen.getByTestId("location-icon")).toBeInTheDocument();
  });

  test("handles delete when thread is currently active", async () => {
    const mockThreads = [{ id: "active-thread", title: "Active Thread" }];

    vi.doMock("../../../context/ChatContext", () => ({
      useChat: () => ({
        threadId: "active-thread",
        resetChat: mockResetChat,
      }),
    }));

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const deleteItems = screen.getAllByTestId("dropdown-item");
    const deleteItem = deleteItems.find((item) =>
      item.textContent?.includes("Delete"),
    );

    if (deleteItem) {
      await userEvent.click(deleteItem);

      await waitFor(() => {
        const deleteButton = screen.getByTestId("alert-dialog-action");
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId("alert-dialog-action");
      await userEvent.click(deleteButton);

      expect(mockDeleteThread).toHaveBeenCalledWith("active-thread");
    }
  });

  test("shows deleting state in delete button", async () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
      isDeleting: true,
    });

    setup();

    const deleteItems = screen.getAllByTestId("dropdown-item");
    const deleteItem = deleteItems.find((item) =>
      item.textContent?.includes("Delete"),
    );

    if (deleteItem) {
      await userEvent.click(deleteItem);

      await waitFor(() => {
        const deleteButton = screen.getByTestId("alert-dialog-action");
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveTextContent("Deleting...");
        expect(deleteButton).toBeDisabled();
      });
    }
  });

  test("renders delete dialog with correct translations", async () => {
    const mockThreads = [{ id: "thread-123", title: "Test Thread" }];

    mockUseThreads.mockReturnValue({
      ...defaultUseThreadsReturn,
      threads: mockThreads,
    });

    setup();

    const deleteItems = screen.getAllByTestId("dropdown-item");
    const deleteItem = deleteItems.find((item) =>
      item.textContent?.includes("Delete"),
    );

    if (deleteItem) {
      await userEvent.click(deleteItem);

      await waitFor(() => {
        expect(screen.getByText("Delete Chat")).toBeInTheDocument();
        expect(
          screen.getByText("Are you sure you want to delete this chat?"),
        ).toBeInTheDocument();
      });
    }
  });
});
