import { IoMdClose } from "react-icons/io";
import PropTypes from "prop-types";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { getEarlyReturn } from "../../../../../../utils/helperFunctions.jsx";
import { fetchCollections, renderCollections } from "../../../../../../components/collections/Collections.jsx";
import "../../../../../../components/collections/Collections.scss";

const CompareTextView = ({ setIsCompareTextView }) => {
  const { t } = useTranslate();
  const {data: collectionsData, isLoading: collectionsIsLoading, error: collectionsError} = useQuery(
    ["collections"],
    () => fetchCollections(),
    {refetchOnWindowFocus: false}
  );

  // ----------------------------------- helpers -----------------------------------------
  const earlyReturn = getEarlyReturn({ isLoading: collectionsIsLoading, error: collectionsError, t });

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
        {earlyReturn || renderCollections(collectionsData, t)}
      </div>
    </>
  );
};

CompareTextView.propTypes = {
  setIsCompareTextView: PropTypes.func.isRequired,
};

export default CompareTextView;
