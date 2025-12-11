import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useAuth } from "./AuthContext.tsx";
import { Navigate } from "react-router-dom";
import { LOGGED_IN_VIA } from "../utils/constants.ts";
import { useTranslate } from "@tolgee/react";

export const AuthenticationGuard = ({
  component,
}: {
  component: React.ComponentType;
}) => {
  const { isLoggedIn } = useAuth() as { isLoggedIn: boolean };
  const { isAuthenticated } = useAuth0();
  const { t } = useTranslate();
  const ViaSocialLogin = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="page-layout listsubtitle">{t("common.loading")} </div>
    ),
  });

  const ViaPechaLogin = () => {
    const Component = component;
    return isLoggedIn || localStorage.getItem(LOGGED_IN_VIA) ? (
      <Component />
    ) : (
      <Navigate to="/login" />
    );
  };

  return <>{isAuthenticated ? <ViaSocialLogin /> : <ViaPechaLogin />}</>;
};
