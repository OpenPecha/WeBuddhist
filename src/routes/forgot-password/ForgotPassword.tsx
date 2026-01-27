import { useState } from "react";
import { useMutation } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import { IoAlertCircleOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import AuthCard from "../commons/auth/AuthCard";
import axiosInstance from "../../config/axios-config.ts";
import AuthTwoColumnLayout from "@/components/layout/AuthTwoColumnLayout";
import { isEmail } from "@/utils/helperFunctions.tsx";

const ForgotPassword = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();

  type FormErrors = {
    email?: string;
    general?: string;
  };

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const forgotPasswordMutation = useMutation(
    async (payload: { email: string }) => {
      const response = await axiosInstance.post(
        "api/v1/auth/request-reset-password",
        payload,
      );
      return response.data;
    },
    {
      onSuccess: () => {
        alert(t("common.forgot_password.reset.success"));
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setErrors({ email: t("user.validation.required") });
      return;
    }

    if (!isEmail(email)) {
      setErrors({ email: t("user.validation.invalid_email") });
      return;
    }

    setErrors({});
    forgotPasswordMutation.mutate({ email });
  };

  return (
    <AuthTwoColumnLayout>
      <AuthCard
        title={t("common.forgot_password.reset.title")}
        description={t("user.forgot_password")}
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
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {t("common.email")}
              </span>
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive/30"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
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
            disabled={forgotPasswordMutation.isLoading}
            aria-disabled={forgotPasswordMutation.isLoading}
          >
            {forgotPasswordMutation.isLoading
              ? t("common.loading")
              : t("common.button.submit")}
          </Button>
        </form>
      </AuthCard>
    </AuthTwoColumnLayout>
  );
};

export default ForgotPassword;
