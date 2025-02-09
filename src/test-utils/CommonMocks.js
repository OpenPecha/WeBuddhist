import { vi } from "vitest";
import { Tolgee } from "@tolgee/react";
import localeEn from "../i18n/en.json";

export const mockAxios = () => {
  vi.mock("../services/config/axios-config.js", () => ({
    default: {
      get: vi.fn(),
      post: vi.fn(),
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
}

export const mockUseAuth0 = () => {
  vi.mock("@auth0/auth0-react", () => ({
    useAuth0: () => ({
      isAuthenticated: false,
      logout: vi.fn(),
      loginWithRedirect: vi.fn(),
      user: null,
    }),
  }));
}
export const mockReactQuery = () => {
  vi.mock("react-query", async () => {
    const actual = await vi.importActual("react-query");
    return {
      ...actual,
      useQuery: vi.fn(),
      useMutation: vi.fn(() => ({
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        mutate: vi.fn().mockResolvedValue({ success: true }),
      }))
    };
  });
}

export const mockTolgee = Tolgee()
  .init({
    language: 'en',
    fallbackLanguage: 'en',
    staticData: {
      en: localeEn
    }
  });
