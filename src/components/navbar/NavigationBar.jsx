import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { MdOutlineManageSearch } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/constants.js";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.js";
import { useQueryClient } from "react-query";
import { useState } from 'react';
import "./NavigationBar.scss";
import { useCollectionColor } from "../../context/CollectionColorContext.jsx";

export const invalidateQueries = async (queryClient) => {
    const queriesToInvalidate = ["texts", "topics","sheets","sidePanel","works","texts-versions","texts-content","sheets-user-profile","table-of-contents","collections","sub-collections","versions"];
    await Promise.all(queriesToInvalidate.map(query => queryClient.invalidateQueries(query)));
  };
 export const changeLanguage = async (lng,queryClient,tolgee) => {
    await tolgee.changeLanguage(lng);
    sessionStorage.setItem('textLanguage', lng);
    localStorage.setItem(LANGUAGE, lng);
    setFontVariables(lng);
    await invalidateQueries(queryClient)
  };
const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslate();
    const { isLoggedIn, logout: pechaLogout, isAuthLoading } = useAuth();
    const { isAuthenticated, logout, isLoading: isAuth0Loading } = useAuth0();
    const userisLoggedIn = isLoggedIn || isAuthenticated;
    const tolgee = useTolgee(['language']);
    const queryClient = useQueryClient();
    const { collectionColor } = useCollectionColor();
    const [searchTerm, setSearchTerm] = useState("");
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const currentLanguage = tolgee.getLanguage();
    const isTibetan = currentLanguage === 'bo-IN';

    const routesWithoutColorBorder = ['/', '/collections', '/login', '/register', '/signup', '/community','/user'];
    const shouldHideColorBorder = routesWithoutColorBorder.includes(location.pathname);
   

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
        handleMobileMenuToggle();
      }
     const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm("");
      }
      handleMobileMenuToggle();
    };

    const handleLangSelect = (lng) => {
      changeLanguage(lng,queryClient,tolgee);
      setIsLangDropdownOpen(false);
    };

    const handleMobileMenuToggle = () => {
      setIsMobileMenuOpen((prev) => !prev);
      setIsLangDropdownOpen(false);
    };
    const handleLogoClick = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
const renderLogo=()=>{
    return(
        <Link to="/" onClick={handleLogoClick}>
         <img className="logo" src="/img/webuddhist_logo.svg" alt="Webuddhist"/>
       </Link>
    )
}
const renderNavLinks=()=>{
    return(
        <div className={`nav-links navbaritems ${isTibetan && 'mt-2'}`}>
            <Link to="/collections" onClick={handleMobileMenuToggle}>  {t("header.text")}</Link>
            {/* <Link to="/topics" onClick={handleMobileMenuToggle}>{t("header.topic")}</Link> */}
            <Link to="/community" onClick={handleMobileMenuToggle}> {t("header.community")}</Link>

            <button className=" text-[#5B5B5B]" onClick={() => 
              userisLoggedIn ?( navigate("/ai")) : (navigate("/login"))}> {t("header.ai_mode")}</button>
        </div>
    )
}
const renderSearch = () => {
    return (
      <form className={`search-bar content ${isSearchFocused ? 'search-focused' : ''}`} onSubmit={handleSearchSubmit}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder={t("common.placeholder.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
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
        <div className={`auth-buttons navbaritems`}>
          <Link className={`auth-button-login ${isTibetan && 'pt-2'}`}  to="/login" onClick={handleMobileMenuToggle} >
            {t("login.form.button.login_in")}
          </Link>
          <Link className={`auth-button-register ${isTibetan && 'pt-2'}`} to="/register" onClick={handleMobileMenuToggle} >
            {t("common.sign_up")}
          </Link>
        </div>
      );
    }
    return (
      <button className={`logout-button navbaritems ${isTibetan && 'pt-2'}`} onClick={handleLogout}>
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
          onClick={()=> setIsLangDropdownOpen((prev) => !prev)}
        >
          <FaGlobe />
        </button>
        {isLangDropdownOpen && (
          renderLanguageOptions()
        )}
      </div>
    );
  };
  const globalLangSelect=(lang)=>{
    handleLangSelect(lang);
    handleMobileMenuToggle();
  }
  const renderLanguageOptions=()=>{
    return(
      <div className="lang-dropdown-menu">
      <button
        className="lang-dropdown-item"
        onClick={() => globalLangSelect("en")}
      >
        English
      </button>
      <button
        className="lang-dropdown-item"
        onClick={() => globalLangSelect('bo-IN')}
      >
        བོད་ཡིག
      </button>
      <button
        className="lang-dropdown-item"
        onClick={() => globalLangSelect('zh-Hans-CN')}
      >
        中文
      </button>
    </div>
    )
  }
  const renderMobileLanguageDropdown=()=>{
    return(
        <div className='mobile-language-dropdown navbaritems'>
          <p className="mobile-language-dropdown-title">{t("header.site_language")}</p>
            {renderLanguageOptions()}
        </div>
    )
  }
  const renderProfile=()=>{
    return(
        <div className='profile-link navbaritems'>
            {(isAuthenticated || isLoggedIn) && (
             <Link to="/profile" onClick={handleMobileMenuToggle}>
               {t("header.profileMenu.profile")}
             </Link>
           )}
        </div>
    )
  }
  return (
    <>
      <div 
        className='navigation-main'
        style={{
          borderBottomColor: shouldHideColorBorder ? '#ffffff' : (collectionColor || '#ffffff')
        }}
      >
          <div className='navigation-left'>
              {renderLogo()}
              {renderNavLinks()}
          </div>
          <div className='navigation-right'>
              {renderSearch()}
              {renderAuthButtons()}
              {renderProfile()}
              {renderLanguageDropdown()}
              <button
                className="mobile-menu-trigger"
                onClick={handleMobileMenuToggle}
              >
                {!isMobileMenuOpen ? <MdOutlineManageSearch size={30} /> : <RxCross1 />}
              </button>
          </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {renderSearch()}
          {renderNavLinks()}
          {renderAuthButtons()}
          {renderProfile()}
          {renderMobileLanguageDropdown()}
        </div>
      )}
    </>
  )
}

export default Navigation