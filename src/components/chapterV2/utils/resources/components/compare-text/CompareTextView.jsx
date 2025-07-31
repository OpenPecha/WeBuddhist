import { IoMdClose } from "react-icons/io";
import PropTypes from "prop-types";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { fetchCollections } from "../../../../../../components/collections/Collections.jsx";
import { fetchSubCollections, renderSubCollections } from "../../../../../../components/sub-collections/SubCollections.jsx";
import { getEarlyReturn } from "../../../../../../utils/helperFunctions.jsx";
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

const CompareTextView = ({ setIsCompareTextView }) => {
  const { t } = useTranslate();
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const {data: collectionsData, isLoading: collectionsIsLoading, error: collectionsError} = useQuery(
    ["collections"],
    () => fetchCollections(),
    {refetchOnWindowFocus: false}
  );

  // Fetch subcollections data when a collection is selected
  const {data: subCollectionsData, isLoading: subCollectionsIsLoading, error: subCollectionsError} = useQuery(
    ["sub-collections", selectedCollection?.id],
    () => fetchSubCollections(selectedCollection?.id),
    {
      refetchOnWindowFocus: false,
      enabled: !!selectedCollection?.id
    }
  );

  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: collectionsIsLoading, error: collectionsError, t });
  
  const subCollectionsEarlyReturn = getEarlyReturn({ 
    isLoading: subCollectionsIsLoading, 
    error: subCollectionsError, 
    t 
  });

  const renderSubCollectionView = () => {
    return (
      <div className="selected-collection-view">
        <button 
          type="button" 
          className="back-button"
          onClick={() => setSelectedCollection(null)}
        >
          {t("common.back")}
        </button>
        <div className="selected-collection-content">
          <h1 className="listtitle">{selectedCollection?.title}</h1>
          {subCollectionsEarlyReturn || renderSubCollections(subCollectionsData)}
        </div>
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
            {selectedCollection ? (
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
