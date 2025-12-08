import "./App.css";
import { Route, Routes, useLocation, useNavigate, matchPath, Navigate } from "react-router-dom";
import NavigationBar from "./routes/navbar/NavigationBar.tsx";
import { useMutation } from "react-query";
import { AuthenticationGuard } from "./config/AuthenticationGuard.tsx";
import { useEffect, useState , Suspense, lazy} from "react";
import axiosInstance from "./config/axios-config.ts";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "./utils/constants.ts";
import { useAuth } from "./config/AuthContext.tsx";
import EditUserProfile from "./routes/edit-user-profile/EditUserProfile.tsx";
import UserProfile from "./routes/user-profile/UserProfile.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { setFontVariables } from "./config/commonConfigs.ts";
import Sheets from "./routes/sheets/Sheets.tsx";
import SheetChapters from "./routes/chapterV2/SheetChapters.tsx";
import Footer from "./routes/footer/Footer.tsx";

const tokenExpiryTime = import.meta.env.VITE_TOKEN_EXPIRY_TIME_SEC;
const Collections = lazy(() => import("./routes/collections/Collections.tsx"));
const UserLogin = lazy(() => import("./routes/user-login/UserLogin.tsx"));
const UserRegistration = lazy(() => import("./routes/user-registration/UserRegistration.tsx"));
const Topics = lazy(() => import("./routes/topics/Topics.tsx"));
const CommunityPage = lazy(() => import("./routes/community/CommunityPage.tsx"));
const Texts = lazy(() => import("./routes/texts/Texts.tsx"));
const Works = lazy(() => import("./routes/works/Works.tsx"));
const ChaptersV2 = lazy(() => import("./routes/chapterV2/Chapters.tsx"));
const AuthorProfile = lazy(() => import("./routes/author-profile/AuthorProfile.tsx"));
const ResetPassword = lazy(() => import("./routes/reset-password/ResetPassword.tsx"));
const ForgotPassword = lazy(() => import("./routes/forgot-password/ForgotPassword.tsx"));
const SearchResultsPage = lazy(() => import("./routes/search/SearchResultsPage.tsx"));
const Chat = lazy(() => import("./routes/chat/base/Chat.tsx"));

function App() {
    const navigate = useNavigate();
    const { login, isLoggedIn, logout: pechaLogout } = useAuth();
    const [intervalId, setIntervalId] = useState(null);
    const location = useLocation();
    const { getIdTokenClaims, isAuthenticated, logout } = useAuth0();

    useEffect(() => {
        if (isAuthenticated) {
            const getToken = async () => {
                try {
                    const claims = await getIdTokenClaims();
                    const idToken = claims.__raw;
                    if (Date.now() >= claims.exp * 1000) {
                        localStorage.removeItem(LOGGED_IN_VIA);
                        sessionStorage.removeItem(ACCESS_TOKEN);
                        localStorage.removeItem(REFRESH_TOKEN)
                        isLoggedIn && pechaLogout()
                        isAuthenticated && await logout({
                            logoutParams: {
                                returnTo: window.location.origin + "/collections",
                            },
                        });
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
        async (refreshToken) => {
            const response = await axiosInstance.post(
                "/api/v1/auth/refresh-token",
                { 'token': refreshToken }
            );
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
                navigate("/login")
            },
        }
    );

    const startTokenRefreshCounter = () => {
        const interval = setInterval(() => {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (refreshToken) {
                loginMutation.mutate(refreshToken);
            }
        }, tokenExpiryTime);
        setIntervalId(interval);
    }

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

    const hideNavigationBar = !!matchPath("/ai/new", location.pathname) || !!matchPath("/ai/:threadId", location.pathname)
    || !!matchPath("/login", location.pathname)
    || !!matchPath("/register", location.pathname)
    || !!matchPath("/forgot-password", location.pathname)
    || !!matchPath("/reset-password", location.pathname);

    const hideFooter =
      !!matchPath("/sheets/:id", location.pathname) ||
      !!matchPath("/chapter", location.pathname) ||
      !!matchPath("/login", location.pathname) ||
      !!matchPath("/register", location.pathname) ||
      !!matchPath("/ai", location.pathname) ||
      !!matchPath("/ai/:threadId", location.pathname)
      || !!matchPath("/forgot-password", location.pathname)
      || !!matchPath("/reset-password", location.pathname);

    return (
      <Suspense>
        {!hideNavigationBar && <NavigationBar/>}
          <Routes>
              <Route path="/" element={<Collections/>}/>
              <Route path="/collections" element={<Collections/>}/>
              <Route path="/profile" element={<AuthenticationGuard component={UserProfile}/>}/>
              <Route path="/user/:username" element={<AuthorProfile/>}/>
              <Route path="/edit-profile" element={<AuthenticationGuard component={EditUserProfile}/>}/>
              <Route path="/reset-password" element={<ResetPassword/>}/>
              <Route path="/forgot-password" element={<ForgotPassword/>}/>
              <Route path="/register" element={<UserRegistration/>}/>
              <Route path="/login" element={<UserLogin/>}/>
              <Route path="/topics" element={<Topics/>}/>
              <Route path="/topics/:id" element={<Topics/>}/>
              <Route path="/note" element={<CommunityPage/>}/>
              <Route path="/texts/:id" element={<Texts/>}/>
              <Route path="/works/:id" element={<Works/>}/>
              <Route path="/chapter" element={<ChaptersV2/>}/>
              <Route path="/search" element={<SearchResultsPage/>}/>
              <Route path="/ai" element={<Navigate to="/ai/new" replace />}/>
              <Route path="/ai/new" element={<Chat/>}/>
              <Route path="/ai/:threadId" element={<Chat/>}/>
              <Route path="*" element={<Collections/>}/>
              <Route path="/sheets/:id" element={<Sheets/>}/>
              <Route path="/:username/:sheetSlugAndId" element={<SheetChapters/>}/>
          </Routes>
          {!hideFooter && <Footer/>}
      </Suspense>
    );
}

export default App;
