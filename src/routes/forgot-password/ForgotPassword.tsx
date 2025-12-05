import { useState } from "react";
import "./ForgotPassword.scss";
import { useMutation } from "react-query";
import axiosInstance from "../../config/axios-config.ts";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import pechaIcon from "../../assets/icons/pecha_icon.png";

const ForgotPassword = () => {
    const { t } = useTranslate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const forgotPasswordMutation = useMutation(async (email) => {
        const response = await axiosInstance.post("api/v1/auth/request-reset-password", email)
        return response.data
    }, {
        onSuccess: () => {
            alert("Email with reset password link is sent to your email address")
            navigate("/")
        },
        onError: (error) => {
            console.error("Forgot password failed", error);
            const errorMsg = (error as any)?.response?.data?.message || (error as any)?.response?.data?.detail || "Request failed";
            setError(errorMsg);
        }
    })

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!email) {
            setError(t("user.validation.required"));
        } else if (!validateEmail(email)) {
            setError(t("user.validation.invalid_email"));
        } else {
            setError("");
            forgotPasswordMutation.mutate({email} as any)
        }
    };

    return (
    <div className="auth-page">
      <div className="forgot-password-container">
        <form onSubmit={handleSubmit}>
          <div className="header">
            <img src={pechaIcon}  className="logo" alt="Webuddhist"/>
            <h4>{t("common.forgot_password.reset.title")}</h4>
          </div>
          <div className="text-content">
            <p>{t("user.forgot_password")}</p>
          </div>
          <div className="content">
            <label className="form-label" htmlFor="email">{ t("common.email") }</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-control ${error ? "is-invalid" : ""}`}
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          <button type="submit" className="btn">
            { t("common.button.submit") }
          </button>
        </form>
      </div>
    </div>
    );
};

export default ForgotPassword;
