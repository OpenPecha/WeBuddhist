import { useState } from "react";
import "./ResetPassword.scss";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import { useMutation } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useLocation } from "react-router-dom";
import { RESET_PASSWORD_TOKEN } from "../../utils/constants.js";
import { useTranslate } from "@tolgee/react";

const ResetPassword = () => {
  const { t } = useTranslate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const resetPasswordToken = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });

  const resetPasswordMutation = useMutation(
    async (resetPasswordData) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/reset-password",
        resetPasswordData
      );
      return response.data;
    },
    {
      onSuccess: () => {
        setFormData({ newPassword: "", confirmPassword: "" });
      },
      onError: (error) => {
        console.error("Reset password failed", error);
      }
    }
  );

  // Validation Functions
  const validatePassword = (password) => password.length >= 8;

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.newPassword) {
      validationErrors.newPassword = t("user.validation.required");
    } else if (!validatePassword(formData.newPassword)) {
      validationErrors.newPassword = t("user.validation.invalid_password");
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.required");
    } else if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.password_do_not_match");
    }

    return validationErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      sessionStorage.setItem(RESET_PASSWORD_TOKEN, resetPasswordToken)
      resetPasswordMutation.mutate({ password: formData.newPassword });
    }
  };

  // Reusable Field Component
  const renderInputField = (label, name) => (
    <div className="content reset-password-form">
      <label className="form-label" htmlFor={ name }>{ label }</label>
      <div className="password-input-container">
        <input
          id={ name }
          type={ showPassword[name] ? "text" : "password" }
          name={ name }
          value={ formData[name] }
          onChange={ handleInputChange }
          className={`form-control ${errors[name] ? "is-invalid" : ""}`}
        />
        <button
          type="button"
          onClick={ (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePasswordVisibility(name);
          } }
          className="password-toggle-button"
          aria-label="toggle-password"
        >
          { showPassword[name] ? (
            <img src={ eyeOpen } alt="Eye Icon" width="16" height="16" />
          ) : (
            <img src={ eyeClose } alt="Eye Slash Icon" width="16" height="16" />
          ) }
        </button>
        { errors[name] && <div className="error-message">{ errors[name] }</div> }
      </div>
    </div>
  );

  return (
    <div className="reset-password-container">
      <form onSubmit={ handleSubmit }>
        { renderInputField("New Password", "newPassword") }
        { renderInputField("Confirm Password", "confirmPassword") }
        <button type="submit" className="reset-button">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
