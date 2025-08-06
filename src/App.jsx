import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import NavigationBar from "./components/navbar/NavigationBar.jsx";
import { useMutation } from "react-query";
import { AuthenticationGuard } from "./config/AuthenticationGuard.jsx";
import { useEffect, useState , Suspense, lazy} from "react";
import axiosInstance from "./config/axios-config.js";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "./utils/constants.js";
import { useAuth } from "./config/AuthContext.jsx";
import EditUserProfile from "./components/edit-user-profile/EditUserProfile.jsx";
import UserProfile from "./components/user-profile/UserProfile.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { setFontVariables } from "./config/commonConfigs.js";
import Sheets from "./components/sheets/Sheets.jsx";
import SheetDetailPage from "./components/sheets/view-sheet/SheetDetailPage.jsx";

const tokenExpiryTime = import.meta.env.VITE_TOKEN_EXPIRY_TIME_SEC;
const Collections = lazy(() => import("./components/collections/Collections.jsx"));
const UserLogin = lazy(() => import("./components/user-login/UserLogin.jsx"));
const UserRegistration = lazy(() => import("./components/user-registration/UserRegistration.jsx"));
const Topics = lazy(() => import("./components/topics/Topics.jsx"));
const CommunityPage = lazy(() => import("./components/community/CommunityPage.jsx"));
const Texts = lazy(() => import("./components/texts/Texts"));
const Works = lazy(() => import("./components/works/Works.jsx"));
const SubCollections = lazy(() => import("./components/sub-collections/SubCollections.jsx"));
const ChaptersV2 = lazy(() => import("./components/chapterV2/Chapters"));

const ResetPassword = lazy(() => import("./components/reset-password/ResetPassword.jsx"));
const ForgotPassword = lazy(() => import("./components/forgot-password/ForgotPassword.jsx"));
const SearchResultsPage = lazy(() => import("./components/search/SearchResultsPage.jsx"));


function App() {
    const navigate = useNavigate();
    const { login, isLoggedIn, logout: pechaLogout } = useAuth();
    const [intervalId, setIntervalId] = useState(null);
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

        setFontVariables(localStorage.getItem(LANGUAGE) || "bo-IN");
    }, []);

    return (
      <Suspense>
          <NavigationBar/>
          <Routes>
              <Route path="/" element={<Collections/>}/>
              <Route path="/collections" element={<Collections/>}/>
              <Route path="/profile" element={<AuthenticationGuard component={UserProfile}/>}/>
              <Route path="/edit-profile" element={<AuthenticationGuard component={EditUserProfile}/>}/>
              <Route path="/reset-password" element={<ResetPassword/>}/>
              <Route path="/forgot-password" element={<ForgotPassword/>}/>
              <Route path="/register" element={<UserRegistration/>}/>
              <Route path="/login" element={<UserLogin/>}/>
              <Route path="/topics" element={<Topics/>}/>
              <Route path="/topics/:id" element={<Topics/>}/>
              <Route path="/community" element={<CommunityPage/>}/>
              <Route path="/texts/:id" element={<Texts/>}/>
              <Route path="/collections/:id" element={<SubCollections/>}/>
              <Route path="/works/:id" element={<Works/>}/>
              <Route path="/chapter" element={<ChaptersV2/>}/>
              <Route path="/search" element={<SearchResultsPage/>}/>
              <Route path="*" element={<Collections/>}/>
              <Route path="/sheets/:id" element={<Sheets/>}/>
              <Route path="/:username/:sheetSlugAndId" element={<SheetDetailPage/>}/>
          </Routes>
      </Suspense>
    );
}

export default App;
