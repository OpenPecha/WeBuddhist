
import pechaIcon from "../../../../../assets/icons/pecha_icon.png";
import SegmentItem from "./SegmentItem.js";
import {getLanguageClass} from "../../../../../utils/helperFunctions.js";

const SourceItem = ({ source, onSegment }) => {
  return (
    <div className={`source-item ${getLanguageClass(source.text.language)}`}>
      <div className="source-title-container">
        <p className="source-title">{source.text.title}</p>
        <img src={pechaIcon} alt="source icon" />
      </div>
      <div className="segment-matches">
        {source.segment_matches.map((segment) => (
          <SegmentItem
            key={segment.segment_id}
            segment={segment}
            onSegment={onSegment}
          />
        ))}
      </div>
    </div>
  );
};


export default SourceItem;
