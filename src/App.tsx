import "./App.css";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useMutation } from "react-query";
import { AuthenticationGuard } from "./config/AuthenticationGuard.tsx";
import { useEffect, useState, Suspense, lazy } from "react";
import axiosInstance from "./config/axios-config.ts";
import {
  ACCESS_TOKEN,
  LANGUAGE,
  LOGGED_IN_VIA,
  REFRESH_TOKEN,
} from "./utils/constants.ts";
import { useAuth } from "./config/AuthContext.tsx";
import EditUserProfile from "./routes/edit-user-profile/EditUserProfile.tsx";
import UserProfile from "./routes/user-profile/UserProfile.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { setFontVariables } from "./config/commonConfigs.ts";
import Sheets from "./routes/sheets/Sheets.tsx";
import SheetChapters from "./routes/chapterV2/SheetChapters.tsx";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { NoFooterLayout } from "./layouts/NoFooterLayout";

const tokenRefreshIntervalMs =
  Number(import.meta.env.VITE_TOKEN_EXPIRY_TIME_SEC) || 0;
const Collections = lazy(() => import("./routes/collections/Collections.tsx"));
const UserLogin = lazy(() => import("./routes/user-login/UserLogin.tsx"));
const UserRegistration = lazy(
  () => import("./routes/user-registration/UserRegistration.tsx"),
);
const CommunityPage = lazy(
  () => import("./routes/community/CommunityPage.tsx"),
);
const Texts = lazy(() => import("./routes/texts/Texts.tsx"));
const Works = lazy(() => import("./routes/works/Works.tsx"));
const ChaptersV2 = lazy(() => import("./routes/chapterV2/Chapters.tsx"));
const ResetPassword = lazy(
  () => import("./routes/reset-password/ResetPassword.tsx"),
);
const ForgotPassword = lazy(
  () => import("./routes/forgot-password/ForgotPassword.tsx"),
);
const SearchResultsPage = lazy(
  () => import("./routes/search/SearchResultsPage.tsx"),
);
const Chat = lazy(() => import("./routes/chat/Chat.tsx"));

type Auth0UserType = {
  getIdTokenClaims: () => Promise<any>;
  isAuthenticated: boolean;
  logout: (options?: { logoutParams?: { returnTo: string } }) => Promise<void>;
};

type AuthUserType = {
  login: (token: string) => void;
  isLoggedIn: boolean;
  logout: () => void;
};
function App() {
  const navigate = useNavigate();
  const { login, isLoggedIn, logout: pechaLogout } = useAuth() as AuthUserType;
  const [intervalId, setIntervalId] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const { getIdTokenClaims, isAuthenticated, logout }: Auth0UserType =
    useAuth0() as Auth0UserType;

  useEffect(() => {
    if (isAuthenticated) {
      const getToken = async () => {
        try {
          const claims = await getIdTokenClaims();
          const idToken = claims.__raw;
          if (Date.now() >= claims.exp * 1000) {
            localStorage.removeItem(LOGGED_IN_VIA);
            sessionStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            isLoggedIn && pechaLogout();
            isAuthenticated &&
              (await logout({
                logoutParams: {
                  returnTo: window.location.origin + "/collections",
                },
              }));
          } else {
            sessionStorage.setItem(ACCESS_TOKEN, idToken);
          }
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      };
      getToken().then();
    }
  }, [isAuthenticated]);

  const loginMutation = useMutation(
    async (refreshToken: string) => {
      const response = await axiosInstance.post("/api/v1/auth/refresh-token", {
        token: refreshToken,
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        sessionStorage.setItem(ACCESS_TOKEN, data.access_token);
        login(data.access_token);
        if (!intervalId) {
          startTokenRefreshCounter();
        }
      },
      onError: () => {
        sessionStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(LOGGED_IN_VIA);
        localStorage.removeItem(REFRESH_TOKEN);
        navigate("/login");
      },
    },
  );

  const startTokenRefreshCounter = () => {
    const interval = setInterval(() => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        loginMutation.mutate(refreshToken);
      }
    }, tokenRefreshIntervalMs);
    setIntervalId(interval);
  };

  useEffect(() => {
    const loginMethod = localStorage.getItem(LOGGED_IN_VIA);
    if (loginMethod === "pecha") {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        loginMutation.mutate(refreshToken);
      }
    }

    setFontVariables(localStorage.getItem(LANGUAGE) || "en");
  }, []);

  return (
    <Suspense>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<NoFooterLayout />}>
          <Route path="/sheets/:id" element={<Sheets />} />
          <Route path="/chapter" element={<ChaptersV2 />} />
          <Route path="/ai" element={<Navigate to="/ai/new" replace />} />
          <Route path="/ai/new" element={<Chat />} />
          <Route path="/ai/:threadId" element={<Chat />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Collections />} />
          <Route path="/collections" element={<Collections />} />
          <Route
            path="/profile"
            element={<AuthenticationGuard component={UserProfile} />}
          />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route
            path="/edit-profile"
            element={<AuthenticationGuard component={EditUserProfile} />}
          />
          <Route path="/note" element={<CommunityPage />} />
          <Route path="/texts/:id" element={<Texts />} />
          <Route path="/works/:id" element={<Works />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route
            path="/:username/:sheetSlugAndId"
            element={<SheetChapters />}
          />
          <Route path="*" element={<Collections />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
