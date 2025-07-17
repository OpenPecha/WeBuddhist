import { useSearchParams } from "react-router-dom"
import ContentsChapter from "./chapter/ContentsChapter"

const Chapters = () => {
const [searchParams]=useSearchParams()
const textId=searchParams.get('text_id')
const contentId=searchParams.get('content_id')
const segmentId=searchParams.get('segment_id')


return (
  <ContentsChapter textId={textId} contentId={contentId} segmentId={segmentId} />
)

}
export default Chapters