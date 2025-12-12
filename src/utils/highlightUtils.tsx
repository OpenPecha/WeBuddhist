const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const highlightSearchMatch = (
  text: string,
  searchTerm: string,
  highlightClass = "highlighted-text",
) => {
  if (!text || !searchTerm || searchTerm.trim() === "") {
    return text;
  }

  const escaped = escapeRegex(searchTerm);
  const isLatinQuery = /^[\p{Script=Latin}\d\s'’.:\-]+$/u.test(searchTerm);

  if (isLatinQuery) {
    const wordRegex = new RegExp(`(^|\\P{L})(${escaped})(?=\\P{L}|$)`, "giu");
    return text.replace(wordRegex, (_, separator, match) => {
      return `${separator}<span class="${highlightClass}">${match}</span>`;
    });
  }

  const subRegex = new RegExp(escaped, "giu");
  return text.replace(
    subRegex,
    (match) => `<span class="${highlightClass}">${match}</span>`,
  );
};
