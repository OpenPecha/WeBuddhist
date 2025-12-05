import { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useTranslate } from "@tolgee/react";
import Collections from "../../../collections/Collections";
import SubCollections from "../../../sub-collections/SubCollections";
import Works from "../../../works/Works";
import Texts from "../../../texts/Texts";
import { IoChevronBackSharp } from "react-icons/io5";

const CompareText = ({ setIsCompareTextView, addChapter, currentChapter, handleNavigate }) => {
    const [rendererInfo, setRendererInfo] = useState({renderer: "collections", requiredId: ""});
    const historyRef = useRef([]);

    const { t } = useTranslate();

    const handleSetRendererInfo = (updater) => {
        setRendererInfo(prev => {
            historyRef.current.push(prev);
            return updater(prev);
        });
    };

    const handleBack = () => {
        if (rendererInfo.renderer === "collections") {
            handleNavigate();
            return;
        }
        if (historyRef.current.length === 0) {
            handleNavigate();
            return;
        }
        const previous = historyRef.current.pop();
        setRendererInfo(previous);
    };

    const renderPanelHeader = () => (
        <div className="headerthing">
            <IoChevronBackSharp size={24} onClick={handleBack} className="back-icon" />
            <p className='mt-4 px-4 listtitle'>{t('connection_panel.compare_text')}</p>
            <IoMdClose
                size={24}
                onClick={() => setIsCompareTextView("main")}
                className="close-icon"
            />
        </div>
    );

    const renderView = () => {
        switch (rendererInfo.renderer){
            case "collections": 
                return <Collections 
                    setRendererInfo={handleSetRendererInfo} 
                    showDescription={false}
                />;
            case "sub-collections": 
                return <SubCollections 
                    from={"compare-text"} 
                    setRendererInfo={handleSetRendererInfo} 
                    parent_id={rendererInfo.requiredId}
                />;
            case "works":
                return <Works
                    requiredInfo={{ from: "compare-text" }} 
                    setRendererInfo={handleSetRendererInfo}
                    collection_id={rendererInfo.requiredId}
                />;
            case "texts":
                return <Texts
                    requiredInfo={{ from: "compare-text" }} 
                    setRendererInfo={handleSetRendererInfo}
                    collection_id={rendererInfo.requiredId}
                    addChapter={addChapter}
                    currentChapter={currentChapter}
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
export default CompareText