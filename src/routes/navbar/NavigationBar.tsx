import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { useAuth } from "../../config/AuthContext.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ACCESS_TOKEN,
  LANGUAGE,
  LOGGED_IN_VIA,
  REFRESH_TOKEN,
} from "../../utils/constants.ts";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.ts";
import { useQueryClient } from "react-query";
import { useState, type FormEvent } from "react";
import { useCollectionColor } from "../../context/CollectionColorContext.tsx";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import NavSmallerScreen from "./NavSmallerScreen.tsx";

export const invalidateQueries = async (queryClient: any) => {
  const queriesToInvalidate = [
    "texts",
    "topics",
    "sheets",
    "sidePanel",
    "works",
    "texts-versions",
    "texts-content",
    "sheets-user-profile",
    "table-of-contents",
    "collections",
    "sub-collections",
    "versions",
  ];
  await Promise.all(
    queriesToInvalidate.map((query) => queryClient.invalidateQueries(query)),
  );
};
export const changeLanguage = async (
  lng: string,
  queryClient: any,
  tolgee: any,
) => {
  await tolgee.changeLanguage(lng);
  sessionStorage.setItem("textLanguage", lng);
  localStorage.setItem(LANGUAGE, lng);
  setFontVariables(lng);
  await invalidateQueries(queryClient);
};
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslate();
  const {
    isLoggedIn,
    logout: pechaLogout,
    isAuthLoading,
  } = useAuth() as {
    isLoggedIn: boolean;
    logout: () => void;
    isAuthLoading: boolean;
  };
  const { isAuthenticated, logout, isLoading: isAuth0Loading } = useAuth0();
  const tolgee = useTolgee(["language"]);
  const queryClient = useQueryClient();
  const { collectionColor } = useCollectionColor();
  const [searchTerm, setSearchTerm] = useState("");

  const navItems = [
    { to: "/collections", label: t("header.text"), key: "collections" },
    { to: "/note", label: t("header.community"), key: "community" },
    { to: "/ai/new", label: t("header.ai_mode"), key: "ai_mode" },
  ];

  const currentLanguage = tolgee.getLanguage();
  const isTibetan = currentLanguage === "bo-IN";

  const routesWithoutColorBorder = [
    "/",
    "/collections",
    "/login",
    "/register",
    "/signup",
    "/community",
    "/user",
  ];
  const shouldHideColorBorder = routesWithoutColorBorder.includes(
    location.pathname,
  );

  const handleLogout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem(LOGGED_IN_VIA);
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    isLoggedIn && pechaLogout();
    isAuthenticated && logout();

    if (isLoggedIn && !isAuthenticated) {
      navigate("/login");
    }
  };
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleLangSelect = (lng: string) => {
    changeLanguage(lng, queryClient, tolgee);
  };

  const renderAuthButtons = (variant: "desktop" | "mobile") => {
    if (isAuth0Loading || isAuthLoading) {
      return <div className="text-sm text-[#676767]">Loading...</div>;
    }
    if (!isLoggedIn && !isAuthenticated) {
      return (
        <div
          className={
            variant === "desktop"
              ? "hidden md:flex items-center gap-2.5 text-sm"
              : "flex flex-col gap-2 text-sm"
          }
        >
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="rounded text-[#676767]"
            aria-label="Go to login"
          >
            {t("login.form.button.login_in")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/register")}
            className="rounded text-[#676767]"
            aria-label="Go to sign up"
          >
            {t("common.sign_up")}
          </Button>
        </div>
      );
    }
    return (
      <Button
        variant="outline"
        className={
          variant === "desktop"
            ? "rounded text-[#676767]"
            : "w-full rounded text-[#676767]"
        }
        onClick={handleLogout}
      >
        {t("profile.log_out")}
      </Button>
    );
  };
  const renderLanguageDropdown = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Change language"
          >
            <FaGlobe className="text-[#676767]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          <DropdownMenuItem onClick={() => handleLangSelect("en")}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLangSelect("bo-IN")}>
            བོད་ཡིག
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLangSelect("zh-Hans-CN")}>
            中文
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div
      className="bg-[#FAFAF9] flex justify-between items-center h-[60px] w-full px-4 md:px-7"
      style={{
        borderBottom: `2px solid ${shouldHideColorBorder ? "#E7E5E4" : collectionColor || "#E7E5E4"}`,
      }}
    >
      <div className="flex items-center gap-x-4">
        <Link to="/" className="flex items-center" aria-label="Go home">
          <img
            className="h-[30px]"
            src="/img/webuddhist_logo.svg"
            alt="Webuddhist"
          />
        </Link>
        <div className={`hidden md:flex space-x-8 ${isTibetan ? "mt-2" : ""}`}>
          {navItems.map((navItem) => (
            <Link
              key={navItem.key}
              className="no-underline text-[#676767] font-medium hover:underline transition-all"
              to={navItem.to}
            >
              {navItem.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <form
          className="hidden md:flex items-center rounded-lg border border-[#e0e0e0] bg-[#EDEDEC]"
          onSubmit={handleSearchSubmit}
        >
          <FaSearch className="ml-1.5 text-[#5b5b5b]" />
          <input
            type="search"
            placeholder={t("common.placeholder.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-none bg-transparent outline-none px-1 py-1.5"
          />
        </form>
        {renderAuthButtons("desktop")}
        <div className="hidden md:block">
          {(isAuthenticated || isLoggedIn) && (
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="rounded text-[#676767]"
            >
              {t("header.profileMenu.profile")}
            </Button>
          )}
        </div>
        {renderLanguageDropdown()}
        <NavSmallerScreen
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          navItems={navItems}
          renderAuthButtons={renderAuthButtons}
          isAuthenticated={isAuthenticated}
          isLoggedIn={isLoggedIn}
          onProfileNavigate={() => navigate("/profile")}
          translate={t}
        />
      </div>
    </div>
  );
};

export default Navigation;
