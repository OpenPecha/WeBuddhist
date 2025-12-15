const fontConfig = {
  en: {
    content: {
      fontFamily: "Inter",
    },
    overalltext: {
      fontFamily: "EBGaramond-Regular",
    },
  },
  "bo-IN": {
    content: {
      fontFamily: "Atisha",
    },
    overalltext: {
      fontFamily: "NotoSerifTibetan-Medium",
    },
  },
};

export const setFontVariables = (language: string) => {
  const root = document.getElementById("root");
  const fonts =
    fontConfig[language as keyof typeof fontConfig] || fontConfig["en"];
  Object.entries(fonts).forEach(([key, styles]) => {
    root?.style.setProperty(`--${key}-font-family`, styles.fontFamily);
  });
};
