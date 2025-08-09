import React from 'react'

export const useDynamicTabTitle = (title) => {
    React.useEffect(() => {
      if (title) {
        document.title = title + " | " + "Webuddhist";
      }
      return () => {
        document.title = "Webuddhist - Buddhism in your own words";
      };
    }, [title]);
  };
  