import { useState } from "react";
import { useMutation } from "react-query";
import "./UserLogin.scss";
import axiosInstance from "../../config/axios-config";
import { Link, useNavigate } from "react-router-dom";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import { IoAlertCircleOutline } from "react-icons/io5";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../../config/AuthContext.jsx";
import { useTranslate } from "@tolgee/react";
import { FaGoogle, FaApple } from "react-icons/fa";

const UserLogin = () => {
    const { t } = useTranslate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const { loginWithRedirect } = useAuth0();
    const { login } = useAuth();
    const navigate = useNavigate();

    const loginMutation = useMutation(
        async (loginData) => {
            const response = await axiosInstance.post(
                "/api/v1/auth/login",
                loginData
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                const accessToken = data.auth.access_token;
                const refreshToken = data.auth.refresh_token;
                login(accessToken, refreshToken);
                navigate("/collections");
            },
            onError: (error) => {
                console.error("Login failed", error);
                const errorMsg = error?.response?.data?.message || error?.response?.data?.detail || "Login failed";
                setErrors({ error: errorMsg });
                setShowToast(true);
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

        if (!password) {
            validationErrors.password = t("user.validation.required");
        } else if (!validatePassword(password)) {
            validationErrors.password = t("user.validation.invalid_password");
        }

        return validationErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setShowToast(false);
        } else {
            setErrors({});
            loginMutation.mutate({email, password});
        }
    };

    const loginWithGoogle = async () => {
        try {
            const redirectPath ="/collections";

            await loginWithRedirect({
                authorizationParams: {
                    connection: 'google-oauth2',
                    prompt: 'select_account'
                },
                appState: {
                    returnTo: redirectPath,
                },
            });
        } catch (error) {
            console.error("Google login failed:", error);
        }
    };

    const loginWithApple = async () => {
        try {
            const redirectPath = "/collections";

            await loginWithRedirect({
                authorizationParams: {
                    connection: 'apple'
                },
                appState: {
                    returnTo: redirectPath,
                },
            });

        } catch (error) {
            console.error("Apple login failed:", error);
        }
    };

    return (
      <div className="login-container">
        {showToast && (
          <div className="my-custom-toast-wrapper">
            <div className="my-custom-toast-box">
              <div className="my-toast-content">
                <span>Error: {errors.error}</span>
                <button
                  className="my-toast-close"
                  onClick={() => setShowToast(false)}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="login-wrapper">
          <div className="login-box">
            <h2 className="title text-center login-title">
              {t("login.form.button.login_in")}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <input
                  type="email"
                  placeholder={t("common.email")}
                  className={`form-input ${errors.email ? "is-invalid" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <IoAlertCircleOutline className="validation-icon" />}
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("common.password")}
                  className={`form-input ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <IoAlertCircleOutline className="validation-icon" />}
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                {/* Eye Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <img src={eyeOpen} alt="Eye Icon" width="16" height="16" />
                  ) : (
                    <img
                      src={eyeClose}
                      alt="Eye Slash Icon"
                      width="16"
                      height="16"
                    />
                  )}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="login-button w-100"
                // disabled={loginMutation.isLoading}
              >
                {t("login.form.button.login_in")}
              </button>

              {/* Links */}
              <div className="login-links">
                <Link
                  to={"/forgot-password"}
                  className="content forgot-password"
                >
                  {t("login.forget_password")}
                </Link>
                <br />
                <Link to={"/register"} className="content create-account">
                  {t("login.create_account")}
                </Link>
                <hr />
                <div className="social-login-buttons">
                  <button
                    type="button"
                    className="social-btn"
                    onClick={loginWithGoogle}
                  >
                    <FaGoogle />
                    Google
                  </button>
                  <button
                    type="button"
                    className="social-btn"
                    onClick={loginWithApple}
                  >
                    <FaApple />
                    Apple
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
};

export default UserLogin;
