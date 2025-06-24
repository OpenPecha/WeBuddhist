import React from "react";
import PropTypes from "prop-types";

const SegmentItem = ({ segment, onSegment }) => {
  return (
    <div
      className="segment-item"
      role="button"
      tabIndex={0}
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
    </div>
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
