import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { useAuth } from "../../config/AuthContext.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/constants.ts";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.ts";
import { useQueryClient } from "react-query";
import { useState } from 'react';
import { useCollectionColor } from "../../context/CollectionColorContext.tsx";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

export const invalidateQueries = async (queryClient: any) => {
    const queriesToInvalidate = ["texts", "topics","sheets","sidePanel","works","texts-versions","texts-content","sheets-user-profile","table-of-contents","collections","sub-collections","versions"];
    await Promise.all(queriesToInvalidate.map(query => queryClient.invalidateQueries(query)));
  };
 export const changeLanguage = async (lng: string,queryClient: any,tolgee: any) => {
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
    const { isLoggedIn, logout: pechaLogout, isAuthLoading } = useAuth() as { isLoggedIn: boolean, logout: () => void, isAuthLoading: boolean };
    const { isAuthenticated, logout, isLoading: isAuth0Loading } = useAuth0();
    const userisLoggedIn = isLoggedIn || isAuthenticated;
    const tolgee = useTolgee(['language']);
    const queryClient = useQueryClient();
    const { collectionColor } = useCollectionColor();
    const [searchTerm, setSearchTerm] = useState("");

    const currentLanguage = tolgee.getLanguage();
    const isTibetan = currentLanguage === 'bo-IN';

    const routesWithoutColorBorder = ['/', '/collections', '/login', '/register', '/signup', '/community','/user'];
    const shouldHideColorBorder = routesWithoutColorBorder.includes(location.pathname);
   

     const handleLogout = (e: any) => {
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
     const handleSearchSubmit = (e: any) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm("");
      }
    };

    const handleLangSelect = (lng: string) => {
      changeLanguage(lng,queryClient,tolgee);
    };


const renderAuthButtons = () => {
    if (isAuth0Loading || isAuthLoading) {
      return <div className="text-sm">Loading...</div>;
    }
    if (!isLoggedIn && !isAuthenticated) {
      return (
        <div className="hidden md:flex items-center gap-2.5 text-sm">
          <Button variant="outline" onClick={() => navigate("/login")} className=" rounded text-[#676767]">
            {t("login.form.button.login_in")}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/register")} className=" rounded text-[#676767]">
            {t("common.sign_up")}
          </Button>
        </div>
      );
    }
    return (
      <Button 
        variant="outline"
        className="rounded text-[#676767]"
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
            className="flex items-center justify-center  p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Change language"
          >
            <FaGlobe className="text-[#676767]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          <DropdownMenuItem 
            onClick={() => handleLangSelect("en")}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleLangSelect('bo-IN')}
          >
            བོད་ཡིག
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleLangSelect('zh-Hans-CN')}
          >
            中文
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
      <div 
        className=' bg-[#FAFAF9] flex justify-between items-center h-[60px] w-full px-7'
        style={{
          borderBottom: `2px solid ${shouldHideColorBorder ? '#E7E5E4' : (collectionColor || '#E7E5E4')}`
        }}
      >
          <div className='flex items-center gap-x-6'>
          <Link to="/" className="flex items-center">
         <img className="h-[30px]" src="/img/webuddhist_logo.svg" alt="Webuddhist"/>
       </Link>            
        <div className={` space-x-8 ${isTibetan ? 'mt-2' : ''}`}>
            <Link 
            className="no-underline text-[#676767] font-medium hover:underline transition-all"
              to="/collections" 
            >
              {t("header.text")}
            </Link>
            <Link 
             className="no-underline text-[#676767] font-medium hover:underline transition-all"
              to="/note" 
            >
              {t("header.community")}
            </Link>
            <button 
              className="text-[#676767] font-medium hover:underline transition-all cursor-pointer" 
              onClick={() => userisLoggedIn ? navigate("/ai/new") : navigate("/login")}
            >
              {t("header.ai_mode")}
            </button>
        </div>          
        </div>
          <div className='flex items-center space-x-2'>
          <form 
        className={`flex items-center rounded-lg border border-[#e0e0e0] bg-[#EDEDEC]`} 
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
              {renderAuthButtons()}
              <div className='hidden md:block'>
            {(isAuthenticated || isLoggedIn) && (
             <Button variant="ghost" onClick={() => navigate("/profile")} className="rounded text-[#676767]">
               {t("header.profileMenu.profile")}
             </Button>
           )}
        </div>              
        {renderLanguageDropdown()}
          </div>
      </div>
  )
}

export default Navigation