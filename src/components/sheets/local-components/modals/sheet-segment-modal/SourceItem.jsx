import React from "react";
import PropTypes from "prop-types";
import { getLanguageClass } from "../../../../../utils/Constants";
import pechaIcon from "../../../../../assets/icons/pecha_icon.png";
import SegmentItem from "./SegmentItem";

const SourceItem = ({ source, onSegment }) => {
  return (
    <div className={`source-item ${getLanguageClass(source.text.language)}`}>
      <div className="source-title-container">
        <p className="source-title">{source.text.title}</p>
        <img src={pechaIcon} alt="source icon" />
      </div>
      <div className="segment-matches">
        {source.segment_match.map((segment) => (
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

SourceItem.propTypes = {
  source: PropTypes.shape({
    text: PropTypes.shape({
      text_id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      language: PropTypes.string.isRequired,
    }).isRequired,
    segment_match: PropTypes.arrayOf(
      PropTypes.shape({
        segment_id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onSegment: PropTypes.func,
};

export default SourceItem;
