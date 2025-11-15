const fontConfig = {
  en: {
    title: {
      fontSize: "30px",
      fontFamily: "Times New Roman",
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
      fontFamily: "Times New Roman",
    },
  },
  "bo-IN": {
    title: {
      fontSize: "30px",
      fontFamily: "MonlamUniOuChan2",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "MonlamUniOuChan2",
    },
    content: {
      fontSize: "17px",
      fontFamily: "MonlamUniOuChan2",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "MonlamUniOuChan2",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "MonlamUniOuChan2",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "MonlamUniOuChan2",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "MonlamUniOuChan2",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "MonlamUniOuChan2",
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
