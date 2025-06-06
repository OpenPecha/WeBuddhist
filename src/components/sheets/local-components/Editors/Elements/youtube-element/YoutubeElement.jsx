import YoutubeEmbed from 'react-youtube'

const YoutubeElement = props => {
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