import { useTranslate } from "@tolgee/react";
import { GoLinkExternal } from "react-icons/go";
import { useQuery } from "react-query";
import axiosInstance from "../../../../../../config/axios-config.ts";
import { usePanelContext } from "../../../../../../context/PanelContext.tsx";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.tsx";
import TextExpand from "../../../../../commons/expandtext/TextExpand.tsx";
import ResourceHeader from "../common/ResourceHeader.tsx";
import { languageMap } from "@/utils/constants.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

export const fetchTranslationsData = async (
  segment_id: string,
  skip = 0,
  limit = 10,
) => {
  const { data } = await axiosInstance.get(
    `/api/v1/segments/${segment_id}/translations`,
    {
      params: {
        segment_id,
        skip,
        limit,
      },
    },
  );
  return data;
};

const TranslationView = ({
  segmentId,
  setIsTranslationView,
  addChapter,
  currentChapter,
  setVersionId,
  handleNavigate,
}: any) => {
  const { t } = useTranslate();
  const { closeResourcesPanel } = usePanelContext() as any;

  const { data: sidePanelTranslationsData } = useQuery(
    ["sidePanelTranslations", segmentId],
    () => fetchTranslationsData(segmentId),
    {
      refetchOnWindowFocus: false,
    },
  );

  const groupedTranslations = sidePanelTranslationsData?.translations?.reduce(
    (acc: any, translation: any) => {
      if (!acc[translation.language]) {
        acc[translation.language] = [];
      }
      acc[translation.language].push(translation);
      return acc;
    },
    {},
  );

  const renderTranslationItem = (
    translation: any,
    _language: string,
    index: number,
  ) => {
    return (
      <div key={index} className="mb-2 rounded-md">
        <div className="flex items-center justify-between">
          {translation.title && (
            <p
              className={` py-4 font-semibold ${getLanguageClass(translation.language)}`}
            >
              {translation.title}
            </p>
          )}
          <Badge
            asChild
            variant="outline"
            className=" cursor-pointer text-xs rounded-sm "
          >
            <Button
              variant="ghost"
              className="flex items-center text-blue-500 "
              onClick={() => setVersionId(translation.text_id)}
            >
              {translation.text_id === sessionStorage.getItem("versionId")
                ? t("text.translation.current_selected")
                : t("common.select")}
            </Button>
          </Badge>
        </div>

        <TextExpand language={translation.language} maxLength={250}>
          {translation.content}
        </TextExpand>
        <div
          className={`text-sm space-y-1 ${getLanguageClass(
            translation.language,
          )}`}
        >
          {translation.source && (
            <p className="navbaritems">
              {t("connection_panel.menuscript.source")}:
              <span className={`${getLanguageClass("en")} text-sm`}>
                {translation.source}
              </span>
            </p>
          )}
          <div className="flex min-h-10 items-center justify-between navbaritems">
            {addChapter && (
              <Button
                variant="secondary"
                onClick={() => {
                  addChapter(
                    {
                      textId: translation.text_id,
                      segmentId: translation.segment_id,
                    },
                    currentChapter,
                  );
                  closeResourcesPanel();
                }}
              >
                <GoLinkExternal />
                {t("text.translation.open_text")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <ResourceHeader
        title={t("connection_pannel.translations")}
        onBack={handleNavigate}
        onClose={() => setIsTranslationView("main")}
      />

      <div className=" flex-1 overflow-y-auto p-4 text-left text-black">
        <div className="space-y-4">
          {groupedTranslations &&
            Object.entries(groupedTranslations).map(
              ([language, translations]: any) => (
                <div key={language}>
                  <h3 className="navbaritems mb-3 flex items-center gap-1 border-b-2 border-[#C74444] text-[#7d7d7d]">
                    {t(languageMap[language as keyof typeof languageMap])}
                    <span className="ml-1 text-sm text-[#718096]">
                      ({translations.length})
                    </span>
                  </h3>
                  {translations.map((translation: any, index: number) =>
                    renderTranslationItem(translation, language, index),
                  )}
                </div>
              ),
            )}
        </div>
      </div>
    </div>
  );
};

export default TranslationView;
