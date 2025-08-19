import { useState } from "react";
import Collections from "../../../collections/Collections";
import SubCollections from "../../../sub-collections/SubCollections"

const CompareText = () => {
    const [renderer, setRenderer] = useState("collections")
    const [requiredId, setRequiredId] = useState("")

    const renderView = () => {
        switch (renderer){
            case "collections": 
                return <Collections 
                    requiredInfo={{ from: "compare-text" }} 
                    setRequiredInfo={() => {}} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId} 
                />;
            case "sub-collections": 
                return <SubCollections 
                    from={"compare-text"} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId} 
                    parent_id={requiredId}
                />;
            default:
                return <Collections 
                    requiredInfo={{ from: "compare-text" }} 
                    setRequiredInfo={() => {}} 
                    setRenderer={setRenderer} 
                    setRequiredId={setRequiredId} 
                />;
        }
    }
    
    return renderView();
}

export default CompareText