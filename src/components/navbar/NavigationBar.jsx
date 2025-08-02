import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/constants.js";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.js";
import { useQueryClient } from "react-query";
import { useState } from 'react';
import "./NavigationBar.scss";

export const invalidateQueries = async (queryClient) => {
    const queriesToInvalidate = ["texts", "topics","sheets","sidePanel","works","texts-versions","texts-content","sheets-user-profile","table-of-contents","collections","sub-collections","versions"];
    await Promise.all(queriesToInvalidate.map(query => queryClient.invalidateQueries(query)));
  };
const Navigation = () => {
    const navigate = useNavigate();
    const { t } = useTranslate();
    const { isLoggedIn, logout: pechaLogout, isAuthLoading } = useAuth();
    const { isAuthenticated, logout, isLoading: isAuth0Loading } = useAuth0();
    const tolgee = useTolgee(['language']);
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
   
     const changeLanguage = async (lng) => {
       await tolgee.changeLanguage(lng);
       localStorage.setItem(LANGUAGE, lng);
       setFontVariables(lng);
       await invalidateQueries(queryClient)
     };
     function handleLogout(e) {
        e.preventDefault()
        localStorage.removeItem(LOGGED_IN_VIA);
        sessionStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN)
        isLoggedIn && pechaLogout()
        isAuthenticated && logout();
        
        if (isLoggedIn && !isAuthenticated) {
          navigate('/login');
        }
      }
     const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm("");
      }
    };

    const handleLangDropdownToggle = () => {
      setIsLangDropdownOpen((prev) => !prev);
    };

    const handleLangSelect = (lng) => {
      changeLanguage(lng);
      setIsLangDropdownOpen(false);
    };
const renderLogo=()=>{
    return(
        <Link to="/">
         <img className="logo" src="/img/pecha-logo.svg" alt="Pecha"/>
       </Link>
    )
}
const renderNavLinks=()=>{
    return(
        <div className='nav-links navbaritems'>
            <Link to="/collections">  {t("header.text")}</Link>
            <Link to="/topics">{t("header.topic")}</Link>
            <Link to="/community"> {t("header.community")}</Link>
        </div>
    )
}
const renderSearch = () => {
    return (
      <form className="search-bar navbaritems" onSubmit={handleSearchSubmit}>
        <FaSearch />
        <input
          type="text"
          placeholder={t("common.placeholder.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </form>
    );
  };
const renderAuthButtons = () => {
    if (isAuth0Loading || isAuthLoading) {
      return <div>Loading...</div>;
    }
    if (!isLoggedIn && !isAuthenticated) {
      return (
        <div className='auth-buttons navbaritems'>
          <Link className='auth-button-login'  to="/login" >
            {t("login.form.button.login_in")}
          </Link>
          <Link className='auth-button-register' to="/register" >
            {t("common.sign_up")}
          </Link>
        </div>
      );
    }
    return (
      <button className='logout-button navbaritems' onClick={handleLogout}>
        {t("profile.log_out")}
      </button>
    );
  };
  const renderLanguageDropdown = () => {
    return (
      <div className="language-dropdown navbaritems">
        <button
          className="lang-dropdown-trigger"
          aria-label="Change language"
          onClick={handleLangDropdownToggle}
        >
          <FaGlobe />
        </button>
        {isLangDropdownOpen && (
          <ul className="lang-dropdown-menu">
            <li
              className="lang-dropdown-item"
              onClick={() => handleLangSelect('en')}
            >
              English
            </li>
            <li
              className="lang-dropdown-item"
              onClick={() => handleLangSelect('bo-IN')}
            >
              བོད་ཡིག
            </li>
            <li
              className="lang-dropdown-item"
              onClick={() => handleLangSelect('zh-Hans-CN')}
            >
              中文
            </li>
          </ul>
        )}
      </div>
    );
  };
  const renderProfile=()=>{
    return(
        <div className='profile-link navbaritems'>
            {(isAuthenticated || isLoggedIn) && (
             <Link to="/profile">
               {t("header.profileMenu.profile")}
             </Link>
           )}
        </div>
    )
  }
  return (
    <div className='navigation-main'>
        <div className='navigation-left'>
            {renderLogo()}
            {renderNavLinks()}
        </div>
        <div className='navigation-right'>
            {renderSearch()}
            {renderAuthButtons()}
            {renderProfile()}
            {renderLanguageDropdown()}
        </div>
    </div>
  )
}

export default Navigation