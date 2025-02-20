export const LOGGED_IN_VIA = "loggedInVia";
export const REFRESH_TOKEN = "refreshToken";
export const ACCESS_TOKEN = "accessToken";
export const RESET_PASSWORD_TOKEN = "resetPasswordToken";
export const RESET_PASSWORD = "reset-password";
export const LANGUAGE = "language";

const ALPHABETS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  "bo-IN": "ཀཁགངཅཆཇཉཏཐདནཔཕབམཙཚཛཝཞཟའཡརལཤསཧཨ".split(""),
};

const DEFAULT_LANGUAGE = "bo-IN";

export const getAlphabet = (language) => {
  return ALPHABETS[language] || ALPHABETS[DEFAULT_LANGUAGE];
};
