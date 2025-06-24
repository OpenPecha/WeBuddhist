import React from "react";
import PropTypes from "prop-types";

const SegmentItem = ({ segment, onSegment }) => {
  return (
    <button
      className="segment-item"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSegment?.(segment);
        }
      }}
      onClick={() => onSegment?.(segment)}
    >
      <div
        className="segment-content"
        dangerouslySetInnerHTML={{ __html: segment.content }}
      />
    </button>
  );
};

SegmentItem.propTypes = {
  segment: PropTypes.shape({
    segment_id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  onSegment: PropTypes.func.isRequired,
};

export default SegmentItem;
