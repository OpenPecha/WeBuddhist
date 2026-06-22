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
import { isEmail } from "@/utils/helperFunctions.tsx";

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation(
    async (loginData: LoginPayload) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/login",
        loginData,
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        const accessToken = data.auth.access_token;
        const refreshToken = data.auth.refresh_token;
        login(accessToken, refreshToken);
        navigate("/");
      },
      onError: (error: any) => {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          t("user.validation.login_failed");
        setErrors((prev) => ({ ...prev, general: errorMsg }));
      },
    },
  );

  const getEmailError = (): string | undefined => {
    if (!email) return t("user.validation.required");
    if (!isEmail(email)) return t("user.validation.invalid_email");
    return undefined;
  };

  const getPasswordError = (password: string): string | undefined => {
    if (!password) return t("user.validation.required");
    if (password.length < 8) return t("user.validation.invalid_password");
    return undefined;
  };

  const validateForm = (password: string): FormErrors => {
    const emailError = getEmailError();
    const passwordError = getPasswordError(password);

    return {
      ...(emailError && { email: emailError }),
      ...(passwordError && { password: passwordError }),
    };
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const validationErrors = validateForm(password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    loginMutation.mutate({ email, password });
  };

  const handleSocialLogin = async (connection: "google-oauth2" | "apple") => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection,
          ...(connection === "google-oauth2" && { prompt: "select_account" }),
        },
        appState: { returnTo: "/" },
      });
    } catch (error: any) {
      const message =
        error?.message ||
        t(
          connection === "google-oauth2"
            ? "user.validation.login_failed_google"
            : "user.validation.login_failed",
        );
      setErrors((prev) => ({ ...prev, general: message }));
    }
  };

  const renderFieldError = (
    error: string | undefined,
    id: string,
    className: string,
  ) =>
    error ? (
      <div id={id} className={className}>
        <IoAlertCircleOutline className="size-4" />
        <span>{error}</span>
      </div>
    ) : null;

  const socialButtons = [
    {
      connection: "google-oauth2" as const,
      icon: <FcGoogle className="size-5" />,
      label: "Google",
    },
    {
      connection: "apple" as const,
      icon: <FaApple className="size-5" />,
      label: "Apple",
    },
  ];

  const passwordInputType = showPassword ? "text" : "password";

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
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              {socialButtons.map(({ connection, icon, label }) => (
                <Button
                  key={connection}
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleSocialLogin(connection)}
                >
                  {icon}
                  {label}
                </Button>
              ))}
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
            {renderFieldError(
              errors.email,
              "email-error",
              "flex items-center gap-2 text-sm text-destructive",
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t("common.password")}
              </span>
            </div>
            <div className="relative">
              <input
                type={passwordInputType}
                name="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-12 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
                placeholder={t("common.password")}
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
            {renderFieldError(
              errors.password,
              "password-error",
              "flex flex-wrap gap-x-2 text-sm text-destructive",
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
