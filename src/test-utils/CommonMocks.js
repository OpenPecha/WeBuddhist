import { vi } from "vitest";
import { Tolgee } from "@tolgee/react";
import localeEn from "../i18n/en.json";
import "@testing-library/jest-dom";

export const mockAxios = () => {
  vi.mock("../config/axios-config.js", () => ({
    default: {
      get: vi.fn(() => Promise.resolve({ data: {} })),
      post: vi.fn(() => Promise.resolve({ data: "Success" })),
    },
  }));
};

export const mockUseAuth = () => {
  vi.mock("../config/AuthContext.jsx", () => ({
    useAuth: () => ({
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  }));
};

export const mockUseAuth0 = () => {
  vi.mock("@auth0/auth0-react", () => ({
    useAuth0: () => ({
      isAuthenticated: false,
      logout: vi.fn(),
      loginWithRedirect: vi.fn(),
      user: null,
    }),
  }));
};

export const mockReactQuery = () => {
  vi.mock("react-query", async () => {
    const actual = await vi.importActual("react-query");
    const defaultUseMutation = (mutationFn, options) => {
      const mutate = async (args) => {
        try {
          const result = await mutationFn(args);
          if (options?.onSuccess) {
            options.onSuccess(result);
          }
          return result;
        } catch (error) {
          if (options?.onError) {
            options.onError(error);
          }
          throw error;
        }
      };
      return {
        mutate,
        mutateAsync: mutate,
      };
    };

    return {
      ...actual,
      useQuery: vi.fn(),
      useMutation: vi.fn(defaultUseMutation),
    };
  });
};

export const mockTolgee = Tolgee().init({
  language: "en",
  fallbackLanguage: "en",
  staticData: {
    en: localeEn,
  },
});

vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }) => children ?? null,
  HelmetProvider: ({ children }) => children ?? null,
}));

window.alert = vi.fn();

export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  return localStorageMock;
};
