import { Button, Container, Dropdown, Form, InputGroup, Nav, Navbar, } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaQuestionCircle } from "react-icons/fa";
import "./NavigationBar.scss";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/Constants.js";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.js";
import { useQueryClient } from "react-query";
import { useState } from 'react';

export const invalidateQueries = async (queryClient) => {
  const queriesToInvalidate = ["texts", "topics","sheets","sidePanel","book","texts-versions","texts-content"];
  await Promise.all(queriesToInvalidate.map(query => queryClient.invalidateQueries(query)));
};
const NavigationBar = () => {
 const [expanded, setExpanded] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const navigate = useNavigate();
 const { t } = useTranslate();
 const { isLoggedIn, logout: pechaLogout } = useAuth();
 const { isAuthenticated, logout } = useAuth0();
 const tolgee = useTolgee(['language']);
 const queryClient = useQueryClient();

  const changeLanguage = async (lng) => {
    await tolgee.changeLanguage(lng);
    localStorage.setItem(LANGUAGE, lng);
    setFontVariables(lng);
    await invalidateQueries(queryClient)
  };

 function handleLogout(e) {
   e.preventDefault()
   
   const currentPath = window.location.pathname;
   if (currentPath !== '/login' && currentPath !== '/register') {
     sessionStorage.setItem('redirectAfterLogin', currentPath);
   }
   
   localStorage.removeItem(LOGGED_IN_VIA);
   sessionStorage.removeItem(ACCESS_TOKEN);
   localStorage.removeItem(REFRESH_TOKEN)
   isLoggedIn && pechaLogout()
   isAuthenticated && logout({
     logoutParams: {
       returnTo: window.location.origin + '/login',
     },
   });
   
   if (isLoggedIn && !isAuthenticated) {
     navigate('/login');
   }
   
   setExpanded(false);
 }

 const handleNavClick = () => setExpanded(false);

 return (
   <Navbar
     bg="light"
     expand="lg"
     className="custom-navbar"
     sticky="top"
     expanded={expanded}
     onToggle={(expanded) => setExpanded(expanded)}
   >
     <Container>
        <Navbar.Brand as={ Link } to="/" className="d-flex align-items-center" onClick={handleNavClick}>
         <img className="logo" src="/img/pecha-logo.svg" alt="Pecha" />
       </Navbar.Brand>


       <div className="d-flex d-lg-none align-items-center">
         <Nav.Link
           as={Link}
           to="/help"
           className="d-flex align-items-center me-2"
           onClick={handleNavClick}
         >
           <FaQuestionCircle size={20} />
         </Nav.Link>
         <Dropdown align="end" className="me-2">
           <Dropdown.Toggle variant="light" id="dropdown-basic" data-testid="dropdown-basic">
             <FaGlobe size={20} />
           </Dropdown.Toggle>
           <Dropdown.Menu >
             {(isAuthenticated || isLoggedIn) && (
               <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center" onClick={handleNavClick}>
                 {t("header.profileMenu.profile")}
               </Dropdown.Item>
             )}
             <Dropdown.Item onClick={() => {
               changeLanguage("en");
               handleNavClick();
             }}>
               English
             </Dropdown.Item>
             <Dropdown.Item onClick={() => {
               changeLanguage("bo-IN");
               handleNavClick();
             }}>
               བོད་ཡིག
             </Dropdown.Item>
           </Dropdown.Menu>
         </Dropdown>
         <Navbar.Toggle aria-controls="navbar-links" />
       </div>


       <div className=" d-lg-none  w-100 mt-3 ">
         <Form className="d-flex w-100" onSubmit={(e) => {
           e.preventDefault();
           if (searchTerm.trim()) {
             navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
             handleNavClick();
           }
         }}>
           <InputGroup>
             <Form.Control
               type="search"
               placeholder={t("common.placeholder.search")}
               aria-label="Search"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Button variant="outline-secondary" type="submit">
               {t("common.placeholder.search")}
             </Button>
           </InputGroup>
         </Form>
       </div>
      
       <Navbar.Collapse id="navbar-links">
         <Nav className="me-auto navbaritems ">
           <Nav.Link as={Link} to="/texts" onClick={handleNavClick}>
             {t("header.text")}
           </Nav.Link>
           <Nav.Link as={Link} to="/topics" onClick={handleNavClick}>
             {t("header.topic")}
           </Nav.Link>
           <Nav.Link as={Link} to="/community" onClick={handleNavClick}>
             {t("header.community")}
           </Nav.Link>
         </Nav>


         <div className="d-none d-lg-flex align-items-center navbaritems">
           <Form className="d-flex me-3" onSubmit={(e) => {
             e.preventDefault();
             if (searchTerm.trim()) {
               navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
               handleNavClick();
             }
           }}>
             <InputGroup>
               <Form.Control
                 type="search"
                 placeholder={t("common.placeholder.search")}
                 aria-label="Search"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <Button variant="outline-secondary" type="submit">
                 {t("common.placeholder.search")}
               </Button>
             </InputGroup>
           </Form>
         </div>


         <Nav className="d-flex align-items-lg-center navbaritems">
           {(!isLoggedIn && !isAuthenticated) ? (
             <div className="d-flex flex-column flex-lg-row">
               <Button as={Link} to="/login" variant="outline-dark" className="mb-2 mb-lg-0 me-lg-2" onClick={handleNavClick}>
                 {t("login.form.button.login_in")}
               </Button>
               <Button as={Link} to="/register" variant="dark" className="mb-2 mb-lg-0 me-lg-3" onClick={handleNavClick}>
                 {t("common.sign_up")}
               </Button>
             </div>
           ) : (
             <Button
              // as={ Link }
              // to="/login"
               onClick={(e) => {
                 handleLogout(e);
                 handleNavClick();
               }}
               variant="outline-dark"
               className="mb-2 mb-lg-0 me-lg-2"
             >
               {t("profile.log_out")}
             </Button>
           )}

           <Nav.Link
             as={Link}
             to="/help"
             className="d-none d-lg-flex align-items-center me-lg-2"
             onClick={handleNavClick}
           >
             <FaQuestionCircle size={20} />
           </Nav.Link>
          
           <div className="d-none d-lg-block">
             <Dropdown align="end">
               <Dropdown.Toggle variant="light" id="dropdown-basic-desktop" data-testid="dropdown-basic-desktop">
                 <FaGlobe size={20} />
               </Dropdown.Toggle>

               <Dropdown.Menu>
                 {(isAuthenticated || isLoggedIn) && (
                   <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center" onClick={handleNavClick}>
                     {t("header.profileMenu.profile")}
                   </Dropdown.Item>
                 )}
                 <Dropdown.Item onClick={() => {
                   changeLanguage("en");
                   handleNavClick();
                 }}>
                   English
                 </Dropdown.Item>
                 <Dropdown.Item onClick={() => {
                   changeLanguage("bo-IN");
                   handleNavClick();
                 }}>
                   བོད་ཡིག
                 </Dropdown.Item>
               </Dropdown.Menu>
             </Dropdown>
           </div>
         </Nav>
       </Navbar.Collapse>
     </Container>
   </Navbar>
 );
};

export default NavigationBar;
