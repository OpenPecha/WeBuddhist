const fontConfig = {
  en: {
    title: {
      fontSize: "30px",
      fontFamily: "Poppins",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "Poppins",
    },
    content: {
      fontSize: "17px",
      fontFamily: "Poppins",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "Poppins",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "Poppins",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "Poppins",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "Poppins",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "Poppins",
    },
  },
  "bo-IN": {
    title: {
      fontSize: "30px",
      fontFamily: "MonlamTBslim",
    },
    subtitle: {
      fontSize: "20px",
      fontFamily: "MonlamTBslim",
    },
    content: {
      fontSize: "17px",
      fontFamily: "MonlamTBslim",
    },
    subcontent: {
      fontSize: "14px",
      fontFamily: "MonlamTBslim",
    },
    listtitle: {
      fontSize: "20px",
      fontFamily: "MonlamTBslim",
    },
    listsubtitle: {
      fontSize: "14px",
      fontFamily: "MonlamTBslim",
    },
    navbaritems: {
      fontSize: "16px",
      fontFamily: "MonlamTBslim",
    },
    overalltext: {
      fontSize: "22px",
      fontFamily: "MonlamTBslim",
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
