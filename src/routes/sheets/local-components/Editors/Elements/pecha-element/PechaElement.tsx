import { useQuery } from 'react-query';
import axiosInstance from '../../../../../../config/axios-config.ts';
import './PechaElement.scss';
import pechaIcon from '../../../../../../assets/icons/pecha_icon.png';
import { removeFootnotes } from '../../../../sheet-utils/Constant.ts';
import {getLanguageClass} from "../../../../../../utils/helperFunctions.tsx";

export const fetchSegmentDetails = async (segmentId) => {
  const { data } = await axiosInstance.get(`/api/v1/segments/${segmentId}`, {
    params: {
      text_details: true
    }
  });
  return data;
};

const PechaElement = props => {
  const { attributes, element } = props;
  const segmentId = element.src;

  const { data: segmentData, isLoading } = useQuery(
    ['segment', segmentId],
    () => fetchSegmentDetails(segmentId),
    {
      enabled: !!segmentId,
      refetchOnWindowFocus: false
    }
  );

  if (!segmentId) return null;
  const cleanContent = segmentData?.content ? removeFootnotes(segmentData.content) : '';

  return (
    <div {...attributes}>
      <div contentEditable={false} className="webuddhist-content">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className={`${getLanguageClass(segmentData.text.language)}`}>
            <img src={pechaIcon} className='webuddhist-icon' alt="source icon" />
            <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
            <p className={`webuddhist-title`}>{segmentData.text.title}</p>
          </div>
        )}
     
      </div>
    </div>
  );
};

export default PechaElement;