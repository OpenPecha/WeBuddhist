import { useQuery } from 'react-query';
import axiosInstance from '../../../../../../config/axios-config';
import './PechaElement.scss';
import pechaIcon from '../../../../../../assets/icons/pecha_icon.png';
import { getLanguageClass  } from '../../../../../../utils/Constants';
import { removeFootnotes } from '../../../../sheet-utils/Constant';

const fetchSegmentDetails = async (segmentId) => {
  const { data } = await axiosInstance.get(`/api/v1/segments/${segmentId}`, {
    params: {
      text_details: true
    }
  });
  return data;
};

const PechaElement = props => {
  const { attributes, children, element } = props;
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
      <div contentEditable={false} className="pecha-content">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className={`${getLanguageClass(segmentData.text.language)}`}>
            <img src={pechaIcon} className='pecha-icon' alt="source icon" />
            <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
            <p className={`pecha-title`}>{segmentData.text.title}</p>
          </div>
        )}
     
      </div>
    </div>
  );
};

export default PechaElement;