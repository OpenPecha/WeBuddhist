import { useState } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  IoAlertCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslate } from "@tolgee/react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AuthCard from "../commons/auth/AuthCard";
import axiosInstance from "../../config/axios-config.ts";
import { useAuth } from "../../config/AuthContext.tsx";
import AuthTwoColumnLayout from "@/components/layout/AuthTwoColumnLayout";

const UserLogin = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { loginWithRedirect } = useAuth0();
  const { login } = useAuth() as {
    login: (accessToken: string, refreshToken: string) => void;
  };

  type LoginPayload = {
    email: string;
    password: string;
  };

  type FormErrors = Partial<LoginPayload> & { general?: string };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation(
    async (loginData: LoginPayload) => {
      const response = await axiosInstance.post("/api/v1/auth/login", loginData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        const accessToken = data.auth.access_token;
        const refreshToken = data.auth.refresh_token;
        login(accessToken, refreshToken);
        navigate("/collections");
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          t("user.validation.login_failed");
        setErrors((prev) => ({ ...prev, general: errorMsg }));
      },
    }
  );

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = (): FormErrors => {
    const validationErrors: FormErrors = {};

    if (!email) {
      validationErrors.email = t("user.validation.required");
    } else if (!emailPattern.test(email)) {
      validationErrors.email = t("user.validation.invalid_email");
    }

    if (!password) {
      validationErrors.password = t("user.validation.required");
    } else if (password.length < 8) {
      validationErrors.password = t("user.validation.invalid_password");
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
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectPath = "/collections";
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2",
          prompt: "select_account",
        },
        appState: { returnTo: redirectPath },
      });
    } catch (error: any) {
      const message =
        error?.message || t("user.validation.login_failed_google");
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  const handleAppleLogin = async () => {
    try {
      const redirectPath = "/collections";
      await loginWithRedirect({
        authorizationParams: { connection: "apple" },
        appState: { returnTo: redirectPath },
      });
    } catch (error: any) {
      const message = error?.message || t("user.validation.login_failed");
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  return (
    <AuthTwoColumnLayout>
      <AuthCard
        title={"Welcome to WeBuddhist"}
        description={t("studio.login.title")}
        footer={
          <div className="w-full text-center text-sm text-muted-foreground">
            <Link
              to="/forgot-password"
              className="text-primary transition hover:underline"
            >
              {t("login.forget_password")}
            </Link>
            <span className="mx-2">•</span>
            <Link
              to="/register"
              className="text-primary transition hover:underline"
            >
              {t("login.create_account")}
            </Link>
          </div>
        }
      >
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleLogin}
              >
                <FcGoogle className="size-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleAppleLogin}
              >
                <FaApple className="size-5" />
                Apple
              </Button>
            </div>
            <Separator />
          </div>

          <div className="space-y-4 w-full">
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
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
                  placeholder={t("common.password")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
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
            disabled={loginMutation.isLoading}
            aria-disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading
              ? t("common.loading")
              : t("login.form.button.login_in")}
          </Button>
        </form>
      </AuthCard>
    </AuthTwoColumnLayout>
  );
};

export default UserLogin;
