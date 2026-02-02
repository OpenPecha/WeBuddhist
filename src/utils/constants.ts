import { BsFileDiff, BsShare } from "react-icons/bs";

export const LOGGED_IN_VIA = "loggedInVia";
export const REFRESH_TOKEN = "refreshToken";
export const ACCESS_TOKEN = "accessToken";
export const RESET_PASSWORD_TOKEN = "resetPasswordToken";
export const RESET_PASSWORD = "reset-password";
export const LANGUAGE = "language";
export const LAYOUT_MODE = "layoutMode";
export const siteName = "WeBuddhist";
export const USERBACK_ID = "A-JldUwSRlsuKf8Te85bql54w7U";

//for app open banner
export const APP_SCHEME_URL = "webuddhist://home";
export const APP_PACKAGE_NAME = "org.pecha.app";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=org.pecha.app";
export const DISMISS_KEY = "wb_banner_dismissed";
export const DISMISS_TIME_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 day

export const MENU_ITEMS = [
  {
    icon: BsFileDiff,
    label: "connection_panel.compare_text",
  },
  {
    icon: BsShare,
    label: "common.share",
  },
];

export const SOURCE_TRANSLATION_OPTIONS_MAPPER = {
  source: "SOURCE",
  translation: "TRANSLATION",
  source_translation: "SOURCE_TRANSLATION",
};

export const languageMap = {
  sa: "language.sanskrit",
  bo: "language.tibetan",
  en: "language.english",
  ja: "language.japanese",
  ko: "language.korean",
  fr: "language.french",
  de: "language.german",
  bhu: "language.bhutanese",
  mo: "language.mongolian",
  sp: "language.spanish",
  it: "language.italian",
  zh: "language.chinese",
  tib: "language.tibetan",
};
