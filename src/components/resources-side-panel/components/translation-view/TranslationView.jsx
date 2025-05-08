import { IoMdClose } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import { getLanguageClass } from "../../../../utils/Constants.js";
import { GoLinkExternal } from "react-icons/go";
import "./TranslationView.scss";
import { useQuery } from "react-query";
import axiosInstance from "../../../../config/axios-config.js";
import { usePanelContext } from "../../../../context/PanelContext.jsx";

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
  expandedTranslations, 
  setExpandedTranslations, 
  setVersionId, 
  versionId,
  addChapter,
  sectionindex
}) => {
  const { t } = useTranslate();
  const {closeResourcesPanel} = usePanelContext();
  const {data: sidePanelTranslationsData} = useQuery(
    ["sidePanelTranslations",segmentId],
    () => fetchTranslationsData(segmentId), //send segmentId later todo
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
    const translationKey = `${language}-${index}`;
    const isExpanded = expandedTranslations[translationKey] || false;
    const hasContent = !!translation.content?.length;
    return (
      <div key={index} className="translation-item">
      <span className={`translation-content ${getLanguageClass(translation.language)}`}>
        <div
          className={`translation-text ${isExpanded ? 'expanded' : 'collapsed'}`}
          dangerouslySetInnerHTML={{ __html: translation.content }}
        />
        {hasContent && (
          <button
            className="expand-button"
            onClick={() => setExpandedTranslations(prev => ({
              ...prev,
              [translationKey]: !isExpanded,
            }))}
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
              {t("connection_panel.menuscript.source")}: {translation.source}
            </p>
          )}

          <p className="textgreat review navbaritems">
            {t("text.versions.information.review_history")}
          </p>

          <div className="linkselect navbaritems">
            <div
              className="linkicons"
              onClick={() => {
                addChapter({ 
                  contentId: "", 
                  versionId: "", 
                  textId: translation.text_id, 
                  segmentId: translation.segment_id,
                  // contentIndex: sectionindex !== null ? sectionindex : 0
                  contentIndex: 0 //todo : change this to above when pagination on version is added
                });
                closeResourcesPanel();
              }}
              >
              <GoLinkExternal />
              {sectionindex}
              {t("text.translation.open_text")}
            </div>

            <p
              onClick={() => setVersionId(translation.text_id)}
              className="selectss navbaritems"
            >
              {translation.text_id === versionId
                ? t("text.translation.current_selected")
                : t("common.select")}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
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
