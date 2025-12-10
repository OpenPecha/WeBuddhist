import { useQuery } from "react-query";
import axiosInstance from "../../../../../../config/axios-config.ts";
import pechaIcon from "../../../../../../assets/icons/pecha_icon.png";
import { removeFootnotes } from "../../../../sheet-utils/Constant.ts";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.tsx";

type PechaElementProps = {
  attributes: any;
  element: {
    src?: string;
  };
};

type SegmentData = {
  content?: string;
  text: {
    language: string;
    title: string;
  };
};

export const fetchSegmentDetails = async (
  segmentId: string,
): Promise<SegmentData> => {
  const { data } = await axiosInstance.get(`/api/v1/segments/${segmentId}`, {
    params: {
      text_details: true,
    },
  });
  return data;
};

const PechaElement = ({ attributes, element }: PechaElementProps) => {
  const segmentId = element.src;
  const segmentKey = segmentId || "";

  const { data: segmentData, isLoading } = useQuery<SegmentData>(
    ["segment", segmentKey],
    () => fetchSegmentDetails(segmentKey),
    {
      enabled: !!segmentId,
      refetchOnWindowFocus: false,
    },
  );

  if (!segmentId) return null;
  const cleanContent = segmentData?.content
    ? removeFootnotes(segmentData.content)
    : "";

  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        className="my-2 rounded border border-dashed border-[#d7d7d7] p-4"
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div
            className={`${getLanguageClass(segmentData?.text.language ?? "")}`}
          >
            <img
              src={pechaIcon}
              className="mb-2.5 h-12 w-12"
              alt="source icon"
            />
            <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
            <p className="mt-2.5 text-[1.1rem] font-semibold text-[#A9080E]">
              {segmentData?.text.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PechaElement;
