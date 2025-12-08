import { useState } from "react";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import {
  IoAlertCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";

import { Button } from "@/components/ui/button";
import AuthCard from "../commons/auth/AuthCard";
import axiosInstance from "../../config/axios-config.ts";
import { RESET_PASSWORD_TOKEN } from "../../utils/constants.ts";

const ResetPassword = () => {
  const { t } = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const resetPasswordToken = searchParams.get("token");

  type FormData = {
    newPassword: string;
    confirmPassword: string;
  };

  type FormErrors = Partial<FormData> & { general?: string; success?: string };

  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const resetPasswordMutation = useMutation(
    async (resetPasswordData: { password: string }) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/reset-password",
        resetPasswordData
      );
      return response.data;
    },
    {
      onSuccess: () => {
        setFormData({ newPassword: "", confirmPassword: "" });
        setErrors({
          success: t("reset_password.success") || "Password reset successfully",
        });
        navigate("/login");
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          t("user.validation.login_failed");
        setErrors((prev) => ({ ...prev, general: message }));
      },
    }
  );

  const validateForm = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (!formData.newPassword) {
      validationErrors.newPassword = t("user.validation.required");
    } else if (formData.newPassword.length < 8) {
      validationErrors.newPassword = t("user.validation.invalid_password");
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.required");
    } else if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = t(
        "user.validation.password_do_not_match"
      );
    }

    return validationErrors;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof FormData) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (resetPasswordToken) {
      sessionStorage.setItem(RESET_PASSWORD_TOKEN, resetPasswordToken);
    }
    resetPasswordMutation.mutate({ password: formData.newPassword });
  };

  return (
    <div className="flex min-h-[95vh] bg-[#FAFAF9] items-center justify-center">
      <AuthCard
        title={t("common.reset_password")}
        description={t("common.reset_password_description") || ""}
      >
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("common.new_password")}
                </span>
              </div>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.newPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 text-base shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.newPassword)}
                  aria-describedby={errors.newPassword ? "new-password-error" : undefined}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  aria-label={
                    showPassword.newPassword
                      ? t("login.hide_password")
                      : t("login.show_password")
                  }
                >
                  {showPassword.newPassword ? (
                    <IoEyeOutline className="size-4" />
                  ) : (
                    <IoEyeOffOutline className="size-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <div
                  id="new-password-error"
                  className="flex flex-wrap gap-x-2 text-sm text-destructive"
                >
                  <IoAlertCircleOutline className="size-4" />
                  <span>{errors.newPassword}</span>
                </div>
              )}
            </label>

            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("common.confirm_password")}
                </span>
              </div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword.confirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 text-base shadow-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? "confirm-password-error" : undefined
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  aria-label={
                    showPassword.confirmPassword
                      ? t("login.hide_password")
                      : t("login.show_password")
                  }
                >
                  {showPassword.confirmPassword ? (
                    <IoEyeOutline className="size-4" />
                  ) : (
                    <IoEyeOffOutline className="size-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <div
                  id="confirm-password-error"
                  className="flex flex-wrap gap-x-2 text-sm text-destructive"
                >
                  <IoAlertCircleOutline className="size-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </label>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <IoAlertCircleOutline className="size-4" />
              <span>{errors.general}</span>
            </div>
          )}

          {errors.success && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <span>{errors.success}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="secondary"
            className="w-full cursor-pointer"
            disabled={resetPasswordMutation.isLoading}
            aria-disabled={resetPasswordMutation.isLoading}
          >
            {resetPasswordMutation.isLoading
              ? t("common.loading")
              : t("common.reset_password")}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
};

export default ResetPassword;
