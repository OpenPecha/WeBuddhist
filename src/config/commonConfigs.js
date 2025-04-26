const fontConfig = {
  en: {
    title: {
      fontSize: "30px",
      fontFamily: "Inter",
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
      fontFamily: "Inter",
    },
  },
  "bo-IN": {
    title: {
      fontSize: "30px",
      fontFamily: "Monlam Uni OuChan2",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Monlam Uni OuChan2",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Monlam Uni OuChan2",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Monlam Uni OuChan2",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "Monlam Uni OuChan2",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "Monlam Uni OuChan2",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "Monlam Uni OuChan2",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "Monlam Uni OuChan2",
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
