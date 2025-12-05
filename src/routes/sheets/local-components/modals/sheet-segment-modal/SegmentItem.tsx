
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


export default SegmentItem;
