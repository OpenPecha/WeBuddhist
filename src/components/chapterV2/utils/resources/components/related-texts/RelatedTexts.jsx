import { IoMdClose } from "react-icons/io";
import { IoChevronBackSharp } from "react-icons/io5";
// import { IoAddCircleOutline, IoShareSocialSharp } from "react-icons/io5";
import { GoLinkExternal } from "react-icons/go";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import "./RelatedTexts.scss";
import axiosInstance from "../../../../../../config/axios-config.js";
import {usePanelContext} from "../../../../../../context/PanelContext.jsx";
import {getLanguageClass} from "../../../../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";
import TextExpand from "../../../../../commons/expandtext/TextExpand.jsx";

export const fetchCommentaryData = async (segment_id, skip = 0, limit = 10) => {
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/commentaries`, {
    params: {
      skip,
      limit
    }
  });
  return data;
}
const CommentaryView = ({ segmentId, setIsCommentaryView, addChapter, currentChapter, handleNavigate }) => {
  const { t } = useTranslate();
  const { closeResourcesPanel } = usePanelContext();
  const {data: segmentCommentaries} = useQuery(
    ["relatedTexts", segmentId],
    () => fetchCommentaryData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
      <div className="headerthing">
        <IoChevronBackSharp size={24} onClick={() => handleNavigate()} className="back-icon" />
        <p className="mt-4 px-4 listtitle">
          {t("text.commentary")}
          {segmentCommentaries?.commentaries?.length > 0 ? 
            ` (${segmentCommentaries.commentaries.length})` : ''}
        </p>
        <IoMdClose
          size={24}
          onClick={() => setIsCommentaryView("main")}
          className="close-icon"
        />
      </div>
      <div className="translation-content p-4">
        <div className="commentaries-list">
          {segmentCommentaries?.commentaries?.length > 0 && (
            <div>
              {segmentCommentaries.commentaries.map((commentary) => {
                const textId = commentary.text_id;
                return (
                  <div key={textId} className="commentary-list-item">
                    <h3 className={`commentary-title ${getLanguageClass(commentary.language)}`}>
                      {commentary.title} {commentary.count && `(${commentary.count})`}
                    </h3>
                    
                    {commentary.segments && (
                      <div className="commentary-container">
                        {commentary.segments && commentary.segments.map((item, idx) => (
                          <div key={`${textId}-${idx}`}>
                          <TextExpand language={commentary.language} maxLength={250}>
                            {item.content}
                          </TextExpand>
                          <div className="commentary-buttons">
                            <button className="commentary-button"
                                 onClick={() => {
                                   addChapter({
                                     textId: textId, 
                                     segmentId: item.segment_id,
                                   }, currentChapter);
                                   closeResourcesPanel();
                                 }}>
                              <GoLinkExternal size={14} className="mr-1"/>
                              <span>{t("text.translation.open_text")}</span>
                            </button>

                            {/* <div className="commentary-button">
                              <IoAddCircleOutline size={14} className="mr-1"/>
                              <span>{t("sheet.add_to_sheet")}</span>
                            </div> */}

                            {/* <div className="commentary-button">
                              <IoShareSocialSharp size={14} className="mr-1"/>
                              <span>{t("common.share")}</span>
                            </div> */}
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
    </div>
  );
};

export default CommentaryView;
CommentaryView.propTypes = {
  segmentId: PropTypes.string.isRequired, 
  setIsCommentaryView: PropTypes.func.isRequired, 
  addChapter: PropTypes.func, 
  currentChapter: PropTypes.object,
  handleNavigate: PropTypes.func.isRequired,
}