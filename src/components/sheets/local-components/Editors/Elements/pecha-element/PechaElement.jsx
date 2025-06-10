import { useQuery } from 'react-query';
import axiosInstance from '../../../../../../config/axios-config';
import './PechaElement.scss';
import pechaIcon from '../../../../../../assets/icons/pecha_icon.png';

const fetchSegmentDetails = async (segmentId) => {
  const { data } = await axiosInstance.get(`/api/v1/segments?segment_id=${segmentId}`);
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

  return (
    <div {...attributes}>
      <div contentEditable={false} className="pecha-content">
    
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <img src={pechaIcon} className='pecha-icon' alt="source icon" />
            <div dangerouslySetInnerHTML={{ __html: segmentData?.content }} />
            <p className='pecha-title'>The Way of the Bodhisattva</p>
          </>
        )}
     
      </div>
    </div>
  );
};

export default PechaElement;