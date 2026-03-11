import { useTranslate } from "@tolgee/react";
import { useNavigate } from "react-router-dom";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";

type TitleResult = {
  text_id: string;
  title: string;
  author: string;
  language: string;
};

const MOCK_RESULTS: TitleResult[] = [
  {
    text_id: "1",
    title: "བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པ།",
    author: "ཞི་བ་ལྷ།",
    language: "bo",
  },
  {
    text_id: "2",
    title: "The Way of the Bodhisattva",
    author: "Shantideva",
    language: "en",
  },
  {
    text_id: "3",
    title: "རྒྱལ་པོ་ལུགས་ཀྱི་བསྟན་བཅོས།",
    author: "ས་སྐྱ་པཎ་ཌི་ཏ།",
    language: "bo",
  },
];

const TitleSearch = ({
  query,
  mode = "all",
}: {
  query: string;
  mode?: "all" | "title" | "author";
}) => {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const results = MOCK_RESULTS;

  const renderResult = (result: TitleResult) => {
    if (mode === "title") {
      return (
        <h4 className="m-0 text-lg font-semibold text-gray-900">
          {result.title}
        </h4>
      );
    }
    if (mode === "author") {
      return (
        <h4 className="m-0 text-lg font-semibold text-gray-900">
          {result.author}
        </h4>
      );
    }
    return (
      <>
        <h4 className="m-0 text-lg font-semibold text-gray-900">
          {result.title}
        </h4>
        <span className="block text-sm text-gray-500">{result.author}</span>
      </>
    );
  };

  if (!results || results.length === 0) {
    return (
      <div className="overalltext">
        {t("search.zero_result", "No results to display.")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {mode !== "all" && (
        <div className="text-sm font-medium text-gray-700">
          <p>
            {t("sheet.search.total")} : {results.length}
          </p>
        </div>
      )}

      {results.map((result: TitleResult) => (
        <div
          key={result.text_id}
          className={`mb-4 space-y-2 ${getLanguageClass(result.language)}`}
        >
          <button
            type="button"
            className="relative w-full border-0 bg-transparent pl-4 text-left cursor-pointer before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-full before:bg-[hsl(9,82%,36%)] before:content-[''] hover:bg-gray-50"
            onClick={() => {
              navigate(`/chapter?text_id=${result.text_id}`);
            }}
          >
            {renderResult(result)}
          </button>
        </div>
      ))}
    </div>
  );
};

export default TitleSearch;
