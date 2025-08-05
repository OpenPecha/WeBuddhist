import { IoMdClose } from "react-icons/io";
import PropTypes from "prop-types";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { fetchCollections } from "../../../../../../components/collections/Collections.jsx";
import { fetchSubCollections } from "../../../../../../components/sub-collections/SubCollections.jsx";
import { fetchTableOfContents, renderTabs } from "../../../../../../components/texts/Texts.jsx";
import { getEarlyReturn, getLanguageClass, mapLanguageCode } from "../../../../../../utils/helperFunctions.jsx";
import { renderRootTexts, renderCommentaryTexts, fetchWorks, useGroupedTexts } from "../../../../../../components/works/Works.jsx";
import "./CompareTextView.scss";
import { useState } from "react";
import TableOfContents from "../../../../../../components/texts/table-of-contents/TableOfContents.jsx";

const renderCollections = (collectionsData, t, showDescriptions = true, setSelectedTitles, selectedTitles, setSelectedCollection) => {
  const renderCollectionNames = (term) => {
    const handleOnClick = () => {
      setSelectedCollection(term);
    }
    return term.has_child ?
      <button type="button" onClick={handleOnClick}>{term.title}</button> :
      term.title
  }
  return (
    <div className="collections-list-container">
      {collectionsData?.collections.map((term, index) => (
        <div className="collections" key={term.id}>
          <div className={"red-line"}></div>
            {renderCollectionNames(term)}
            {showDescriptions && <p className="content collections-description">{term.description}</p>}
        </div>
      ))}
    </div>
  );
};

const renderSubCollectionsTerms = (terms, setSelectedTerm) => {
  return (
    <div className="sub-collections-list-container">
      {terms?.map((term) =>
        <button 
          key={term.id} 
          type="button" 
          onClick={() => {
            console.log(`Term clicked: ${term.title}`);
            setSelectedTerm(term);
          }}
        >
          {term.title}
        </button>
      )}
    </div>
  );
};

const navigateRootCommentary = (rootTexts, commentaryTexts, t, getLanguageClass, setSelectedText, setActiveView) => {
  const renderRootTextButtons = () => {
    return (
      <div className="root-text-section">
        <h2 className="section-title overalltext">{t("text.type.root_text")}</h2>
        {rootTexts.length === 0 ? (
          <div className="no-content">{t("text.root_text_not_found")}</div>
        ) : (
          <div className="root-text-list">
            {rootTexts.map((text) => (
              <button
                key={text.id}
                type="button"
                onClick={() => {
                  console.log("hi");
                  setSelectedText(text);
                  setActiveView("contents");
                }}
                className={`${getLanguageClass(text.language)} root-text-button`}
              >
                {text.title}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCommentaryButtons = () => {
    return (
      <div className="commentary-section">
        <h2 className="section-title overalltext">{t("text.type.commentary")}</h2>
        {commentaryTexts.length === 0 ? (
          <div className="no-content">{t("text.commentary_text_not_found")}</div>
        ) : (
          <div className="commentary-list">
            {commentaryTexts.map((text) => (
              <button
                key={text.id}
                type="button"
                onClick={() => {
                  console.log("hi");
                  setSelectedText(text);
                  setActiveView("contents");
                }}
                className={`${getLanguageClass(text.language)} commentary-text-button`}
              >
                {text.title}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="navigate-root-commentary">
      {renderRootTextButtons()}
      {renderCommentaryButtons()}
    </div>
  );
}

const CompareTextView = ({ setIsCompareTextView }) => {
  const { t } = useTranslate();
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termView, setTermView] = useState(false);
  const [activeView, setActiveView] = useState("main");  
  const [selectedText, setSelectedText] = useState(null); 
  const [activeTab, setActiveTab] = useState('contents');
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });
  const [selectedContentItem, setSelectedContentItem] = useState(null);

  const {data: collectionsData, isLoading: collectionsIsLoading, error: collectionsError} = useQuery(
    ["collections"],
    () => fetchCollections(),
    { staleTime: 60000 }
  );

  const {data: subCollectionsData, isLoading: subCollectionsIsLoading, error: subCollectionsError} = useQuery(
    ["sub-collections", selectedCollection?.id],
    () => fetchSubCollections(selectedCollection.id),
    { staleTime: 60000, enabled: !!selectedCollection?.id }
  );

  const {data: worksData, isLoading: worksIsLoading, error: worksError} = useQuery(
    ["works", selectedTerm?.id], 
    () => fetchWorks(selectedTerm?.id), 
    {enabled: !!selectedTerm?.id && termView}
  );

  const {data: tableOfContents, isLoading: tableOfContentsIsLoading, isError: tableOfContentsIsError} = useQuery(
    ["tableOfContents", selectedText?.id],
    () => fetchTableOfContents(selectedText.id, pagination.skip, pagination.limit),
    { enabled: !!selectedText?.id }
  );

  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: collectionsIsLoading, error: collectionsError, t });
  
  const texts = worksData?.texts || [];
  const groupedTexts = useGroupedTexts(texts);
  const rootTexts = groupedTexts["root_text"] || [];
  const commentaryTexts = groupedTexts["commentary"] || [];

  const handleContentItemClick = (contentItem) => {
    setSelectedContentItem(contentItem);
    console.log("hi");
  };

  const contentsVersionView = () => {
    return (
      <div className="contents-version-view">
        {renderTabs(
          activeTab,
          setActiveTab,
          tableOfContents,
          pagination,
          setPagination,
          tableOfContentsIsError,
          tableOfContentsIsLoading,
          t,
          selectedText?.id,
          handleContentItemClick
        )}
      </div>
    );
  };

  const renderRootCommentaryView = () => {
    return (
      <div className="term-content">
        {earlyReturn || (
          <div className="term-body">
            <div className="root-text-container">{renderRootTexts(rootTexts, t, getLanguageClass)}</div>
            <div className="commentary-text-container">{renderCommentaryTexts(commentaryTexts, t, getLanguageClass)}</div>
          </div>
        )}
      </div>
    );
  };

  const renderSubCollectionView = () => {
    return (
      <div className="selected-collection-content">
        <h1 className="listtitle"></h1>
        {earlyReturn || renderSubCollectionsTerms(subCollectionsData?.collections || [], (term) => {
          setSelectedTerm(term);
          setTermView(true);
        })}
      </div>
    );
  };

  return (
    <>
      <div className="headerthing">
        <p className="mt-4 px-4 listtitle">{t("connection_panel.compare_text")}</p>
        <IoMdClose
          size={24}
          onClick={() => setIsCompareTextView("main")}
          className="close-icon"
        />
      </div>
      <div className="panel-content p-3">
        {earlyReturn || (
          <div className="collections-container compact-view">
            {activeView === "contents" ? (
              contentsVersionView()
            ) : termView ? (
              navigateRootCommentary(rootTexts, commentaryTexts, t, getLanguageClass, setSelectedText, setActiveView)
            ) : selectedCollection ? (
              renderSubCollectionView()
            ) : (
              <div className="left-section">
                {renderCollections(collectionsData, t, false, setSelectedTitles, selectedTitles, setSelectedCollection)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

CompareTextView.propTypes = {
  setIsCompareTextView: PropTypes.func.isRequired,
};

export default CompareTextView;
