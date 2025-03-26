const fontConfig = {
  en: {
    title: {
      fontSize: "30px",
      fontFamily: "Roboto",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Roboto",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Roboto",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Roboto",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "Roboto",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "Roboto",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "Roboto",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "Roboto",
    },
  },
  "bo-IN": {
    title: {
      fontSize: "30px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "Monlam-bodyig-regular-woff",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "Monlam-bodyig-regular-woff",
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
