import { IoMdClose } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import { GoLinkExternal } from "react-icons/go";
import "./TranslationView.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../../../../../config/axios-config.js";
import {usePanelContext} from "../../../../../../context/PanelContext.jsx";
import {getLanguageClass} from "../../../../../../utils/helperFunctions.jsx";
import PropTypes from "prop-types";
import { useState } from "react";
export const fetchTranslationsData=async(segment_id, skip=0, limit=10)=>{
  const {data} = await axiosInstance.get(`/api/v1/segments/${segment_id}/translations`, {
    params: {
      segment_id,
      skip,
      limit
    }
  });
  return data;
}

const TranslationView = ({
  segmentId,
  setIsTranslationView, 
  addChapter,
}) => {
  const { t } = useTranslate();
  const {closeResourcesPanel} = usePanelContext();
  const {data: sidePanelTranslationsData} = useQuery(
    ["sidePanelTranslations",segmentId],
    () => fetchTranslationsData(segmentId),
    {
      refetchOnWindowFocus: false,
    }
  );
  const languageMap = {
    "sa": "language.sanskrit",
    "bo": "language.tibetan",
    "en": "language.english",
    "ja": "language.japanese",
    "ko": "language.korean",
    "fr": "language.french",
    "de": "language.german",
    "bhu":"language.bhutanese",
    "mo":"language.mongolian",
    "sp":"language.spanish"
  }
  const groupedTranslations = sidePanelTranslationsData?.translations?.reduce((acc, translation) => {
    if (!acc[translation.language]) {
      acc[translation.language] = [];
    }
    acc[translation.language].push(translation);
    return acc;
  }, {});

  const renderTranslationItem = (translation, language, index) => {
    const [isExpanded, setIsExpanded] = useState(false);    
    const hasContent = !!translation.content?.length;
    return (
      <div key={index} className="translation-item">
      <span className={`translation-content  ${getLanguageClass(language)}`}>
        <div
          className={`translation-text ${isExpanded ? 'expanded' : 'collapsed'}`}
          dangerouslySetInnerHTML={{ __html: translation.content }}
        />
        {hasContent && (
          <button
            className="expand-button navbaritems"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? t('panel.showless') : t('panel.showmore')}
          </button>
        )}
      </span>

        <div className={`belowdiv ${getLanguageClass(translation.language)}`}>
          {translation.title && (
            <p className="titles">{translation.title}</p>
          )}
          {translation.source && (
            <p className="navbaritems">
              {t("connection_panel.menuscript.source")}:<span className={`${getLanguageClass("en")} source`}> {translation.source}</span>
            </p>
          )}

          <p className="textgreat review navbaritems">
            {t("text.versions.information.review_history")}
          </p>

          <div className="linkselect navbaritems">
            {addChapter && (
              <button
                className="linkicons"
                onClick={() => {
                  addChapter({ 
                    contentId: "", 
                    versionId: "", 
                    textId: translation.text_id, 
                    segmentId: translation.segment_id,
                  });
                  closeResourcesPanel();
                }}
              >
                <GoLinkExternal />
                {t("text.translation.open_text")}
              </button>
            )}
            <button
              className="selectss navbaritems"
            >
              {translation.text_id === "dummy"
                ? t("text.translation.current_selected")
                : t("common.select")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="translation-view">
      <div className="headerthing">
        <p className="mt-4 px-4 listtitle">
          {t('connection_pannel.translations')}
        </p>
        <IoMdClose
          size={24}
          onClick={() => setIsTranslationView("main")}
          className="close-icon"
        />
      </div>

      <div className="translation-content p-4">
        <div className="translations-list">
          {groupedTranslations &&
            Object.entries(groupedTranslations).map(([language, translations]) => (
              <div key={language} className="language-group">
                <h3 className="language-title navbaritems">
                  {t(languageMap[language])}
                  <span className="translation-count">({translations.length})</span>
                </h3>
                {translations.map((translation, index) =>
                  renderTranslationItem(translation, language, index)
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

};

export default TranslationView;
TranslationView.propTypes = {
  segmentId: PropTypes.string.isRequired, 
  setIsTranslationView: PropTypes.func.isRequired, 
  addChapter: PropTypes.func, 
}
