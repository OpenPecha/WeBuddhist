import {
  BsFileDiff,
  BsFileEarmarkPlus,
  BsShare,
  BsStickies,
} from "react-icons/bs";

export const LOGGED_IN_VIA = "loggedInVia";
export const REFRESH_TOKEN = "refreshToken";
export const ACCESS_TOKEN = "accessToken";
export const RESET_PASSWORD_TOKEN = "resetPasswordToken";
export const RESET_PASSWORD = "reset-password";
export const LANGUAGE = "language";
export const siteName = "WeBuddhist";
export const USERBACK_ID = "A-JldUwSRlsuKf8Te85bql54w7U";
export const MENU_ITEMS = [
  {
    label: "connection_panel.tools",
    isHeader: true,
  },
  {
    icon: BsFileEarmarkPlus,
    label: "sheet.add_to_sheet",
    isHeader: false,
  },
  {
    icon: BsFileDiff,
    label: "connection_panel.compare_text",
    isHeader: false,
  },
  {
    icon: BsStickies,
    label: "connection_panel.notes",
    isHeader: false,
  },
  {
    icon: BsShare,
    label: "common.share",
    isHeader: false,
  },
];

export const SOURCE_TRANSLATION_OPTIONS_MAPPER = {
  source: "SOURCE",
  translation: "TRANSLATION",
  source_translation: "SOURCE_TRANSLATION",
};
