import pechaIcon from "@/assets/icons/pecha_icon.png";
import SegmentItem from "./SegmentItem.tsx";
import { getLanguageClass } from "@/utils/helperFunctions.tsx";

const SourceItem = ({ source, onSegment }: any) => {
  return (
    <div
      className={`${getLanguageClass(source.text.language)} rounded-lg border border-dashed border-gray-200 p-4`}
    >
      <div className=" mb-3 flex items-center justify-between gap-2.5">
        <p className="m-0 text-base font-medium leading-tight text-[#A9080E]">
          {source.text.title}
        </p>
        <img
          src={pechaIcon}
          alt="source icon"
          className="h-8 w-11 object-contain"
        />
      </div>
      <div className="flex flex-col gap-3">
        {source.segment_matches.map((segment: any) => (
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
