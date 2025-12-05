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
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

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

  const renderRegistrationTitle = () => (
    <h2 className="subtitle register-title" data-testid="signup-title">
      {t("common.sign_up")}
    </h2>
  );

  const renderInputField = (field) => (
    <div className="form-group" key={field.name}>
      <input
        type={field.type}
        placeholder={t(field.placeholderKey)}
        className={`form-input content ${errors[field.name] ? "is-invalid" : ""}`}
        value={field.value}
        onChange={field.onChange}
      />
      {errors[field.name] && (
        <IoAlertCircleOutline className="validation-icon-standalone" />
      )}
      {errors[field.name] && (
        <div className="invalid-feedback">{errors[field.name]}</div>
      )}
    </div>
  );

  const renderBasicInfoFields = () => {
    const basicFields = [
      {
        name: "email",
        type: "email",
        placeholderKey: "common.email",
        value: email,
        onChange: (e) => setEmail(e.target.value),
      },
      {
        name: "firstName",
        type: "text",
        placeholderKey: "sign_up.form.first_name",
        value: firstName,
        onChange: (e) => setFirstName(e.target.value),
      },
      {
        name: "lastName",
        type: "text",
        placeholderKey: "sign_up.form.last_name",
        value: lastName,
        onChange: (e) => setLastName(e.target.value),
      },
    ];

    return <>{basicFields.map((field) => renderInputField(field))}</>;
  };

  const renderPasswordToggle = (isVisible, toggleFunction) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFunction(!isVisible);
      }}
      className="password-toggle"
    >
      {isVisible ? (
        <img src={eyeOpen} alt="Eye Icon" width="16" height="16" />
      ) : (
        <img src={eyeClose} alt="Eye Slash Icon" width="16" height="16" />
      )}
    </button>
  );

  const renderPasswordIcons = (error, showPassword, toggleFunction) => (
    error ? (
      <div className="input-icons">
        {renderPasswordToggle(showPassword, toggleFunction)}
        <IoAlertCircleOutline className="validation-icon" />
      </div>
    ) : (
      <div className="password-toggle-standalone">
        {renderPasswordToggle(showPassword, toggleFunction)}
      </div>
    )
  );

  const renderPasswordField = () => (
    <div className="form-group">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={t("common.password")}
        className={`form-input content ${errors.password ? "is-invalid" : ""}`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && (
        <div className="invalid-feedback">{errors.password}</div>
      )}
      {renderPasswordIcons(errors.password, showPassword, setShowPassword)}
    </div>
  );

  const renderConfirmPasswordField = () => (
    <div className="form-group">
      <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder={t("common.confirm_password")}
        className={`form-input ${errors.confirmPassword ? "is-invalid" : ""}`}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {errors.confirmPassword && (
        <div className="invalid-feedback">{errors.confirmPassword}</div>
      )}
      {renderPasswordIcons(errors.confirmPassword, showConfirmPassword, setShowConfirmPassword)}
    </div>
  );

  const renderPasswordFields = () => (
    <>
      {renderPasswordField()}
      {renderConfirmPasswordField()}
    </>
  );

  const renderFormActions = () => (
    <>
      <button type="submit" className="register-button">
        {t("common.sign_up")}
      </button>

      <div className="content register-links">
        <span>{t("sign_up.already_have_account")} </span>
        <br />
        <Link to={"/login"} className="login-link">
          {t("login.form.button.login_in")}
        </Link>
      </div>
    </>
  );

  const renderSocialLoginSection = () => (
    <>
      <div className="social-login-buttons">
        <button className="social-btn" onClick={loginWithGoogle}>
          <FcGoogle />
          Google
        </button>
        <button className="social-btn" onClick={loginWithApple}>
          <FaApple />
          Apple
        </button>
      </div>
      {registrationError && (
        <div className="content registration-error">
          <IoAlertCircleOutline className="validation-icon" />
          {registrationError}
        </div>
      )}
      <hr />

    </>
  );

  const renderRegistrationForm = () => (
    <form onSubmit={registerUser}>
      {renderSocialLoginSection()}
      {renderBasicInfoFields()}
      {renderPasswordFields()}
      {renderFormActions()}
    </form>
  );

  return (
    <div className="register-container">
        <div className="register-box">
          {renderRegistrationTitle()}
          {renderRegistrationForm()}
        </div>
      </div>
  );
};

export default UserRegistration;
