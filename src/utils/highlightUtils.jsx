import React from 'react';

export const highlightSearchMatch = (text, searchTerm, highlightClass = "highlighted-text") => {
  if (!text || !searchTerm || searchTerm.trim() === "") {
    return text;
  }

  const regex = new RegExp(
    `\\b(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return `<span class="${highlightClass}">${part}</span>`;
    }
    return part;
  }).join('');
};
