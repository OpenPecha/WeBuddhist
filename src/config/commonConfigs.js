const fontConfig = {
  en: {
    title: {
      fontSize: "30px",
      fontFamily: "EBGaramond-Regular",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Inter",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Inter",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Inter",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "Inter",
    },
    collectionfont: {
      fontSize: "16px",
      fontFamily: "Inter",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "Inter",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "Inter",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "EBGaramond-Regular",
    },
  },
  "bo-IN": {
    title: {
      fontSize: "30px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
    collectionfont: {
      fontSize: "16px",
      fontFamily: "Jomolhari-Regular",
    },
    content: {
      fontSize: "20px",
      fontFamily: "Jomolhari-Regular",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "NotoSerifTibetan-Medium",
    },
  },
};

export const setFontVariables = (language) => {
  const root = document.getElementById("root");
  const fonts = fontConfig[language] || fontConfig["en"];
  Object.entries(fonts).forEach(([key, styles]) => {
    root?.style.setProperty(`--${key}-font-size`, styles.fontSize);
    root?.style.setProperty(`--${key}-font-family`, styles.fontFamily);
  });
};
