const SegmentItem = ({ segment, onSegment }: any) => {
  return (
    <button
      type="button"
      className="relative w-full border-0 border-l-4 cursor-pointer border-l-[#A9080E] bg-white p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9080E]/60 focus-visible:ring-offset-2"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSegment?.(segment);
        }
      }}
      onClick={() => onSegment?.(segment)}
    >
      <div
        className=" space-y-1 pl-1 text-[0.95rem] leading-6"
        dangerouslySetInnerHTML={{ __html: segment.content }}
      />
    </button>
  );
};

export default SegmentItem;
