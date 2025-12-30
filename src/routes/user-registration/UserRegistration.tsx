import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslate } from "@tolgee/react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
  IoAlertCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AuthCard from "../commons/auth/AuthCard";
import axiosInstance from "../../config/axios-config.ts";
import { useAuth } from "../../config/AuthContext.tsx";
import AuthTwoColumnLayout from "@/components/layout/AuthTwoColumnLayout";
import { isEmail } from "@/utils/helperFunctions.tsx";

const UserRegistration = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth() as {
    login: (accessToken: string, refreshToken: string) => void;
    isLoggedIn: boolean;
  };
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  type RegistrationPayload = {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
  };

  type FormErrors = Partial<{
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    general: string;
  }>;

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn || isAuthenticated) {
      navigate("/collections");
    }
  }, [isLoggedIn, isAuthenticated, navigate]);

  const registerMutation = useMutation(
    async (registerData: RegistrationPayload) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/register",
        registerData,
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        const { access_token, refresh_token } = data.auth;
        login(access_token, refresh_token);
        navigate("/collections");
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          t("user.validation.login_failed");
        setErrors((prev) => ({ ...prev, general: message }));
      },
    },
  );

  const validateForm = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (!email) {
      validationErrors.email = t("user.validation.required");
    } else if (!isEmail(email)) {
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
    } else if (password.length < 8) {
      validationErrors.password = t("user.validation.invalid_password");
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.required");
    } else if (password !== confirmPassword) {
      validationErrors.confirmPassword = t(
        "user.validation.password_do_not_match",
      );
    }

    return validationErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    registerMutation.mutate({
      email,
      firstname: firstName,
      lastname: lastName,
      password,
    });
  };

  const handleSocialLogin = async (connection: "google-oauth2" | "apple") => {
    try {
      const redirectPath = "/collections";
      const authParams: any = {
        appState: { returnTo: redirectPath },
        authorizationParams: { connection },
      };

      if (connection === "google-oauth2") {
        authParams.authorizationParams.prompt = "select_account";
      }

      await loginWithRedirect(authParams);
    } catch (error: any) {
      const message = error?.message || t("user.validation.login_failed");
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  return (
    <AuthTwoColumnLayout>
      <AuthCard
        title={t("common.sign_up")}
        description={t("studio.signup.title") || ""}
        footer={
          <div className="w-full text-center text-sm text-muted-foreground">
            <span>{t("sign_up.already_have_account")} </span>
            <Link
              to="/login"
              className="text-primary transition hover:underline"
            >
              {t("login.form.button.login_in")}
            </Link>
          </div>
        }
      >
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleSocialLogin("google-oauth2")}
              >
                <FcGoogle className="size-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleSocialLogin("apple")}
              >
                <FaApple className="size-5" />
                Apple
              </Button>
            </div>
            <Separator />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("sign_up.form.first_name")}
                </span>
              </div>
              <input
                type="text"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition"
                placeholder={t("sign_up.form.first_name")}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
              {errors.firstName && (
                <div
                  id="first-name-error"
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <IoAlertCircleOutline className="size-4" />
                  <span>{errors.firstName}</span>
                </div>
              )}
            </label>

            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("sign_up.form.last_name")}
                </span>
              </div>
              <input
                type="text"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none transition"
                placeholder={t("sign_up.form.last_name")}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
              {errors.lastName && (
                <div
                  id="last-name-error"
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <IoAlertCircleOutline className="size-4" />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t("common.email")}
              </span>
            </div>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
              placeholder={t("common.email")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
            />
            {errors.email && (
              <div
                id="email-error"
                className="flex items-center gap-2 text-sm text-destructive"
              >
                <IoAlertCircleOutline className="size-4" />
                <span>{errors.email}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t("common.password")}
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
                placeholder={t("common.password")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? t("login.hide_password")
                    : t("login.show_password")
                }
              >
                {showPassword ? (
                  <IoEyeOutline className="size-4" />
                ) : (
                  <IoEyeOffOutline className="size-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <div
                id="password-error"
                className="flex flex-wrap gap-x-2 text-sm text-destructive"
              >
                <IoAlertCircleOutline className="size-4" />
                <span>{errors.password}</span>
              </div>
            )}

            <label className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("common.confirm_password")}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
                  placeholder={t("common.confirm_password")}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? t("login.hide_password")
                      : t("login.show_password")
                  }
                >
                  {showConfirmPassword ? (
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

          <Button
            type="submit"
            variant="outline"
            className="w-full cursor-pointer"
            disabled={registerMutation.isLoading}
            aria-disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading
              ? t("common.loading")
              : t("common.sign_up")}
          </Button>
        </form>
      </AuthCard>
    </AuthTwoColumnLayout>
  );
};

export default UserRegistration;
