import { useSearchParams } from "react-router-dom"
import ContentsChapter from "./chapter/ContentsChapter"
import VersionsChapter from "./chapter/VersionsChapter"

const Chapters = () => {
const [searchParams]=useSearchParams()
const textId=searchParams.get('text_id')
const contentId=searchParams.get('content_id')
const segmentId=searchParams.get('segment_id')


return (
  segmentId ?
  <ContentsChapter textId={textId} contentId={contentId} segmentId={segmentId} />
  :
  <VersionsChapter textId={textId} contentId={contentId} />

)

}
export default Chapters