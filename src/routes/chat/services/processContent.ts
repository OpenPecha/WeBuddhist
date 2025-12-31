interface ProcessContentResult {
  content: string;
  usedSources: Array<{ number: number; source: any }>;
  citationMap: Record<number, any>;
}

interface ProcessContentParams {
  message: any;
  isUser: boolean;
}

export const processContent = ({
  message,
  isUser,
}: ProcessContentParams): ProcessContentResult => {
  if (
    isUser ||
    !message.searchResults ||
    message.searchResults.length === 0 ||
    !message.isComplete
  ) {
    return { content: message.content, usedSources: [], citationMap: {} };
  }

  let processedContent = message.content;
  const usedSources: Array<{ number: number; source: any }> = [];
  const idToNumber: Record<string, number> = {};
  const citationMap: Record<number, any> = {};
  let citationCount = 0;

  const getNumberForId = (id: string) => {
    const trimmedId = id.trim();
    if (!trimmedId) return null;
    if (idToNumber[trimmedId]) return idToNumber[trimmedId];

    const source = message.searchResults?.find((s: any) => s.id === trimmedId);
    if (source) {
      citationCount++;
      idToNumber[trimmedId] = citationCount;
      usedSources.push({ number: citationCount, source });
      citationMap[citationCount] = source;
      return citationCount;
    }
    return null;
  };

  const citationRegex = /\[([a-zA-Z0-9\-_,\s]{15,})\]/g;
  let citationIndex = 0;

  processedContent = processedContent.replaceAll(
    citationRegex,
    (_match: string, idContent: string) => {
      const ids = idContent
        .split(/[,\s]+/)
        .filter((id: string) => id.trim().length > 0);
      const numbers = ids
        .map((id: string) => getNumberForId(id))
        .filter((n: number | null) => n !== null);

      if (numbers.length > 0) {
        const currentIndex = citationIndex++;
        return `<cite data-citations="${numbers.join(",")}" data-cite-index="${currentIndex}">${numbers.join(",")}</cite>`;
      }
      return _match;
    },
  );

  return {
    content: processedContent,
    usedSources: [...usedSources].sort((a, b) => a.number - b.number),
    citationMap,
  };
};
