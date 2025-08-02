import { IoMdClose } from "react-icons/io";
import PropTypes from "prop-types";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { fetchCollections } from "../../../../../../components/collections/Collections.jsx";
import { fetchSubCollections } from "../../../../../../components/sub-collections/SubCollections.jsx";
import { getEarlyReturn, getLanguageClass, mapLanguageCode } from "../../../../../../utils/helperFunctions.jsx";
import { renderRootTexts, renderCommentaryTexts, fetchWorks, useGroupedTexts } from "../../../../../../components/works/Works.jsx";
import "./CompareTextView.scss";
import { useState } from "react";

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
      {collectionsData?.terms.map((term, index) => (
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

const CompareTextView = ({ setIsCompareTextView }) => {
  const { t } = useTranslate();
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termView, setTermView] = useState(false);
  const {data: collectionsData, isLoading: collectionsIsLoading, error: collectionsError} = useQuery(
    ["collections"],
    () => fetchCollections(),
    {refetchOnWindowFocus: false}
  );

  const {data: subCollectionsData, isLoading: subCollectionsIsLoading, error: subCollectionsError} = useQuery(
    ["sub-collections", selectedCollection?.id],
    () => fetchSubCollections(selectedCollection?.id),
    {
      refetchOnWindowFocus: false,
      enabled: !!selectedCollection?.id
    }
  );

  const {data: worksData, isLoading: worksIsLoading, error: worksError} = useQuery(
    ["works", selectedTerm?.id],
    () => fetchWorks(selectedTerm?.id),
    {
      refetchOnWindowFocus: false,
      enabled: !!selectedTerm?.id && termView
    }
  );

  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: collectionsIsLoading, error: collectionsError, t });
  
  const texts = worksData?.texts || [];
  const groupedTexts = useGroupedTexts(texts);
  const rootTexts = groupedTexts["root_text"] || [];
  const commentaryTexts = groupedTexts["commentary"] || [];

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
        {earlyReturn || renderSubCollectionsTerms(subCollectionsData?.terms || [], (term) => {
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
            {termView ? (
              renderRootCommentaryView()
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
