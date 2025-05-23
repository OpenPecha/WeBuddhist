import React from 'react';

export const highlightSearchMatch = (text,searchTerm,highlightClass = "highlighted-text") => {
  if (!text || !searchTerm || searchTerm.trim() === "") {
    return text;
  }

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "g"
  );

  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part === searchTerm) {
      return (
        <span key={index} className={highlightClass}>
          {part}
        </span>
      );
    }
    return part;
  });
};
