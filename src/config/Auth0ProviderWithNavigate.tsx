import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { LOGGED_IN_VIA } from "../utils/constants.js";
import { useQuery } from "react-query";
import axiosInstance from "./axios-config.js";
import { useTranslate } from "@tolgee/react";

export const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const redirectUri = window.location.origin;

  const { data: auth0Provider, isLoading: auth0ProvideIsLoading } = useQuery(
    ["auth0Provider"],
    async () => {
      const { data } = await axiosInstance.get("/api/v1/props");
      return data;
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      onError: () => {
        navigate("/");
      },
    },
  );

  const onRedirectCallback = (appState) => {
    localStorage.setItem(LOGGED_IN_VIA, "okta");
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <>
      {!auth0ProvideIsLoading && (
        <Auth0Provider
          domain={auth0Provider?.domain}
          clientId={auth0Provider?.client_id}
          authorizationParams={{
            redirect_uri: redirectUri,
          }}
          onRedirectCallback={onRedirectCallback}
          useRefreshTokens={true}
          cacheLocation={"localstorage"}
        >
          {children}
        </Auth0Provider>
      )}
    </>
  );
};
