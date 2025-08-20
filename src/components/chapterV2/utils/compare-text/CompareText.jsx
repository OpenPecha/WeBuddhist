import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import Collections from "../../../collections/Collections";
import SubCollections from "../../../sub-collections/SubCollections";
import Works from "../../../works/Works";
import Texts from "../../../texts/Texts";
import PropTypes from "prop-types";

const CompareText = ({ setIsCompareTextView }) => {
    const [renderer, setRenderer] = useState("collections");
    const [requiredId, setRequiredId] = useState("");
    const { t } = useTranslate();

    const renderPanelHeader = () => (
        <div className="headerthing">
            <p className='mt-4 px-4 listtitle'>{t('connection_panel.compare_text')}</p>
            <IoMdClose
                size={24}
                onClick={() => setIsCompareTextView("main")}
                className="close-icon"
            />
        </div>
    );

    const renderView = () => {
        switch (renderer){
            case "collections": 
                return <Collections 
                    requiredInfo={{ from: "compare-text" }} 
                    setRequiredInfo={() => {}} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId} 
                    showDescription={false}
                />;
            case "sub-collections": 
                return <SubCollections 
                    from={"compare-text"} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId} 
                    parent_id={requiredId}
                />;
            case "works":
                return <Works
                    requiredInfo={{ from: "compare-text" }} 
                    setRequiredInfo={() => {}} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId}
                    collection_id={requiredId}
                />;
            case "texts":
                return <Texts
                    requiredInfo={{ from: "compare-text" }} 
                    setRequiredInfo={() => {}} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId}
                    collection_id={requiredId}
                />;
        }
    }
    
    return (
        <div className="compare-text-container">
            {renderPanelHeader()}
            <div className="compare-text-content">
                {renderView()}
            </div>
        </div>
    );
}

CompareText.propTypes = {
    setIsCompareTextView: PropTypes.func.isRequired
};

export default CompareText