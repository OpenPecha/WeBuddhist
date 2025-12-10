import React, { useMemo, useState, useEffect } from "react";
import Editor from "./local-components/Editors/EditorWrapper.tsx";
import ProfileCard from "./local-components/UserProfileCard/ProfileCard.tsx";
import { useTranslate } from "@tolgee/react";
import { useDebounce } from "use-debounce";
import { useParams } from "react-router-dom";
import { fetchSheetData } from "./view-sheet/SheetDetailPage.tsx";
import { useQuery } from "react-query";
import { convertSegmentsToSlate } from "./sheet-utils/Constant.ts";

const defaultValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
    align: "left",
  },
];

const Sheets = () => {
  const { t } = useTranslate();
  const { id } = useParams();
  const shouldFetch = id !== "new";
  const { data: sheetData } = useQuery({
    queryKey: ["sheetData", id],
    queryFn: () => fetchSheetData(id ?? ""),
    enabled: shouldFetch,
  });

  const [title, setTitle] = useState("");
  const [debouncedTitle] = useDebounce(title, 1000);
  const [titleError, setTitleError] = useState<string | null>(null);
  useEffect(() => {
    if (sheetData && !title) {
      setTitle(sheetData.sheet_title || "");
    }
  }, [sheetData]);

  const handleTitleError = (error: string) => {
    setTitleError(error);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    sessionStorage.setItem("sheet-title", e.target.value);
    if (titleError) {
      setTitleError(null);
    }
  };
  const initialValue = useMemo(
    () =>
      (sheetData && convertSegmentsToSlate(sheetData?.content?.segments)) ||
      defaultValue,
    [],
  );
  return (
    <div className=" h-screen p-5 w-1/2 mx-auto flex flex-col">
      <div className=" w-full mb-3">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className={` text-2xl w-full py-3 serif-title-text outline-none bg-transparent placeholder:text-gray-400 placeholder:opacity-70`}
          placeholder={t("sheet.title.placeholder")}
        />
        {titleError && (
          <div className="text-sm text-red-600 font-medium text-left mt-1">
            {titleError}
          </div>
        )}
      </div>
      <ProfileCard />
      <Editor
        title={debouncedTitle || sheetData?.sheet_title}
        initialValue={initialValue}
        onTitleError={handleTitleError}
      >
        <Editor.Input />
      </Editor>
    </div>
  );
};

export default Sheets;
