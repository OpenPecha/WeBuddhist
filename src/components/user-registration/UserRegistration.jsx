import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserRegistration.scss";
import axiosInstance from "../../config/axios-config.js";
import { useMutation } from "react-query";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import { IoAlertCircleOutline } from "react-icons/io5";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslate } from "@tolgee/react";
import { FaGoogle, FaApple } from "react-icons/fa";

const UserRegistration = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const { login, isLoggedIn } = useAuth();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isLoggedIn || isAuthenticated) {
    navigate("/collections")
  }

  const registerMutation = useMutation(
    async (registerData) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/register",
        registerData
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        setRegistrationError("");
        const { access_token, refresh_token } = data.auth;
        login(access_token, refresh_token);
        navigate('/collections')
      },
      onError: (error) => {
        setRegistrationError(error.response.data.detail);
        console.error("Registration failed", error);
      },
    }
  );

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!email) {
      validationErrors.email = t("user.validation.required");
    } else if (!validateEmail(email)) {
      validationErrors.email = t("user.validation.invalid_email");
    }

    if (!firstName) {
      validationErrors.firstName = t("user.validation.required");
    }

    if (!lastName) {
      validationErrors.lastName = t("user.validation.required");
    }

    if (!password) {
      validationErrors.password = t("user.validation.required");
    }
    if (!validatePassword(password)) {
      validationErrors.password = t("user.validation.invalid_password");
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.password_do_not_match");
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.required");
    }

    return validationErrors;
  };

  const registerUser = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      registerMutation.mutate({
        email,
        firstname: firstName,
        lastname: lastName,
        password
      });
    }
  };
  const handleSocialLogin = async (connection) => {
    try {
      const redirectPath = "/collections";
      const authParams = {
        appState: { returnTo: redirectPath }
      };

      if (connection === 'google-oauth2') {
        authParams.authorizationParams = {
          connection: 'google-oauth2',
          prompt: 'select_account'
        };
      } else if (connection === 'apple') {
        authParams.authorizationParams = {
          connection: 'apple'
        };
      }

      await loginWithRedirect(authParams);
    } catch (error) {
      console.error(`${connection} login failed:`, error);
    }
  };

  const loginWithGoogle = () => handleSocialLogin('google-oauth2');
  const loginWithApple = () => handleSocialLogin('apple');

  return (
    <div className="register-container">
        <div className="register-box">
          <h2 className="title register-title" data-testid="signup-title">
            { t("common.sign_up") }
          </h2>

          <form onSubmit={ registerUser }>
            {/* Email Field */ }
            <div className="form-group">
              <input
                type="email"
                placeholder={ t("common.email") }
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                value={ email }
                onChange={ (e) => setEmail(e.target.value) }
              />
              {errors.email && <IoAlertCircleOutline className="validation-icon" />}
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* First Name Field */ }
            <div className="form-group">
              <input
                type="text"
                placeholder={ t("sign_up.form.first_name") }
                className={`form-input ${errors.firstName ? 'is-invalid' : ''}`}
                value={ firstName }
                onChange={ (e) => setFirstName(e.target.value) }
              />
              {errors.firstName && <IoAlertCircleOutline className="validation-icon" />}
              {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </div>

            {/* Last Name Field */ }
            <div className="form-group">
              <input
                type="text"
                placeholder={ t("sign_up.form.last_name") }
                className={`form-input ${errors.lastName ? 'is-invalid' : ''}`}
                value={ lastName }
                onChange={ (e) => setLastName(e.target.value) }
              />
              {errors.lastName && <IoAlertCircleOutline className="validation-icon" />}
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </div>

            {/* Password Field */ }
            <div className="form-group">
              <input
                type={ showPassword ? "text" : "password" }
                placeholder={ t("common.password") }
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                value={ password }
                onChange={ (e) => setPassword(e.target.value) }
              />
              {errors.password && <IoAlertCircleOutline className="validation-icon" />}
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}

              {/* Password Toggle Icon */ }
              <button
                onClick={ (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                } }
                className="password-toggle"
              >
                { showPassword ? (
                  <img src={ eyeOpen } alt="Eye Icon" width="16" height="16" />
                ) : (
                  <img src={ eyeClose } alt="Eye Slash Icon" width="16" height="16" />
                ) }
              </button>
            </div>

            {/* Confirm Password Field */ }
            <div className="form-group">
              <input
                type={ showConfirmPassword ? "text" : "password" }
                placeholder={ t("common.confirm_password") }
                className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={ confirmPassword }
                onChange={ (e) => setConfirmPassword(e.target.value) }
              />
              {errors.confirmPassword && <IoAlertCircleOutline className="validation-icon" />}
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              {/* Password Toggle Icon */ }
              <button
                onClick={ (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmPassword(!showConfirmPassword);
                } }
                className="password-toggle"
              >
                { showConfirmPassword ? (
                  <img src={ eyeOpen } alt="Eye Icon" width="16" height="16" />
                ) : (
                  <img src={ eyeClose } alt="Eye Slash Icon" width="16" height="16" />
                ) }
              </button>
            </div>

            {/* Submit Button */ }
            <button type="submit" className="register-button">
              { t("common.sign_up") }
            </button>

            {/* Link to Login */ }
            <div className="content register-links">
              <span>{ t("sign_up.already_have_account") } </span>
              <br />
              <Link to={ "/login" } className="login-link">
                { t("login.form.button.login_in") }
              </Link>
            </div>
            <hr />
            <div className="social-login-buttons">
              <button
                className="social-btn"
                onClick={loginWithGoogle}
              >
                <FaGoogle />
                Google
              </button>
              <button
                className="social-btn"
                onClick={loginWithApple}
              >
                <FaApple />
                Apple
              </button>
            </div>
            { registrationError && <div className="content registration-error">
              <IoAlertCircleOutline className="validation-icon" />
              { registrationError }
            </div> }
          </form>
        </div>
    </div>
  );
};

export default UserRegistration;
