import { GoLinkExternal } from "react-icons/go";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import axiosInstance from "../../../../../../config/axios-config.ts";
import { usePanelContext } from "../../../../../../context/PanelContext.tsx";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.tsx";
import TextExpand from "../../../../../commons/expandtext/TextExpand.tsx";
import ResourceHeader from "../common/ResourceHeader.tsx";

export const fetchCommentaryData = async (
  segment_id: string,
  skip = 0,
  limit = 10,
) => {
  const { data } = await axiosInstance.get(
    `/api/v1/segments/${segment_id}/commentaries`,
    {
      params: {
        skip,
        limit,
      },
    },
  );
  return data;
};
const CommentaryView = ({
  segmentId,
  setIsCommentaryView,
  addChapter,
  currentChapter,
  handleNavigate,
}: any) => {
  const { t } = useTranslate();
  const { closeResourcesPanel } = usePanelContext() as any;
  const { data: segmentCommentaries } = useQuery(
    ["relatedTexts", segmentId],
    () => fetchCommentaryData(segmentId),
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ResourceHeader
        title={`${t("text.commentary")}${segmentCommentaries?.commentaries?.length ? ` (${segmentCommentaries.commentaries.length})` : ""}`}
        onBack={handleNavigate}
        onClose={() => setIsCommentaryView("main")}
      />
      <div className="flex-1 overflow-y-auto text-left p-4 text-gray-900">
        {segmentCommentaries?.commentaries?.length > 0 && (
          <div className="space-y-4">
            {segmentCommentaries.commentaries.map((commentary: any) => {
              const textId = commentary.text_id;
              return (
                <div key={textId}>
                  <h3
                    className={` my-2 border-b-2 border-red-700 pb-3 text-lg font-semibold  text-gray-800 ${getLanguageClass(
                      commentary.language,
                    )}`}
                  >
                    {commentary.title}
                    {commentary.count && `(${commentary.count})`}
                  </h3>
                  {commentary.segments && (
                    <div className="space-y-4">
                      {commentary.segments &&
                        commentary.segments.map((item: any, idx: number) => (
                          <div key={`${textId}-${idx}`}>
                            <TextExpand
                              language={commentary.language}
                              maxLength={250}
                            >
                              {item.content}
                            </TextExpand>
                            <div className="flex">
                              <button
                                type="button"
                                className="flex space-x-2 items-center text-sm text-gray-600 transition hover:text-red-700 cursor-pointer"
                                onClick={() => {
                                  addChapter(
                                    {
                                      textId: textId,
                                      segmentId: item.segment_id,
                                    },
                                    currentChapter,
                                  );
                                  closeResourcesPanel();
                                }}
                              >
                                <GoLinkExternal />
                                <span>{t("text.translation.open_text")}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentaryView;
