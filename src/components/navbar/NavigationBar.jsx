import { Button, Container, Dropdown, Form, InputGroup, Nav, Navbar, } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaGlobe, FaQuestionCircle } from "react-icons/fa";
import "./NavigationBar.scss";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { ACCESS_TOKEN, LANGUAGE, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/Constants.js";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.js";
import { useState } from 'react';

const NavigationBar = () => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslate();
  const { isLoggedIn, logout: pechaLogout } = useAuth();
  const { isAuthenticated, logout } = useAuth0();
  const tolgee = useTolgee(['language']);

  const changeLanguage = async (lng) => {
    await tolgee.changeLanguage(lng);
    localStorage.setItem(LANGUAGE, lng);
    setFontVariables(lng);
    setExpanded(false);
  };

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem(LOGGED_IN_VIA);
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN)
    isLoggedIn && pechaLogout()
    isAuthenticated && logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
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

        <Navbar.Toggle aria-controls="navbar-links" />
        <Navbar.Collapse id="navbar-links">
          <Nav className="content me-auto">
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

          <Nav>
            <Form className="d-flex me-3">
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder={t("common.placeholder.search")}
                  aria-label="Search"
                />
                <Button variant="outline-secondary" onClick={handleNavClick}>
                  {t("common.placeholder.search")}
                </Button>
              </InputGroup>
            </Form>

            {(!isLoggedIn && !isAuthenticated) ? (
              <>
                <Button as={Link} to="/login" variant="outline-dark" className="me-2" onClick={handleNavClick}>
                  {t("login.form.button.login_in")}
                </Button>
                <Button as={Link} to="/register" variant="dark" className="me-3" onClick={handleNavClick}>
                  {t("common.sign_up")}
                </Button>
              </>
            ) : (
              <Button
              // as={ Link }
              // to="/login"
                onClick={(e) => {
                  handleLogout(e);
                  handleNavClick();
                }}
                variant="outline-dark"
                className="me-2"
              >
                {t("profile.log_out")}
              </Button>
            )}
            
            <Nav.Link
              as={Link}
              to="/help"
              className="d-flex align-items-center"
              onClick={handleNavClick}
            >
              <FaQuestionCircle size={20} />
            </Nav.Link>

            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-basic" data-testid="dropdown-basic">
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;