import YoutubeEmbed from 'react-youtube'
import PropTypes from "prop-types";
const YoutubeElement = props => {
  // eslint-disable-next-line no-unused-vars
    const {attributes,children,element} = props
    const {youtubeId} = element
    return (
      <div {...attributes}>
        <div contentEditable={false}>
          <YoutubeEmbed videoId={youtubeId} />
        </div>

      </div>
    )
  }
  
  export default YoutubeElement
  YoutubeElement.propTypes = {
    attributes: PropTypes.object.isRequired, 
    children: PropTypes.node.isRequired, 
    element: PropTypes.shape({
      youtubeId: PropTypes.string
    }).isRequired
  }