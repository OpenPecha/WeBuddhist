// import ChapterHeader from "../utils/header/ChapterHeader.jsx";
// import React, {useState} from "react";
// import {VIEW_MODES} from "../utils/header/view-selector/ViewSelector.jsx";
// import UseChapterHook from "./helpers/UseChapterHook.jsx";
// import axiosInstance from "../../../config/axios-config.js";
// import {useQuery} from "react-query";
// import {useSearchParams} from "react-router-dom";
//
// // section id <-> contentId
// const fetchContentDetails = async (textId, skip, limit, sectionId) => {
//   const {data} = await axiosInstance.post(`/api/v1/texts/${textId}/details`, {
//     content_id: sectionId,
//     limit,
//     skip
//   });
//   return data;
// }
// const ContentsChapter = () => {
//   const [viewMode, setViewMode] = useState(VIEW_MODES.SOURCE)
//   const [showTableOfContents, setShowTableOfContents] = useState(false)
//   const [searchParams] = useSearchParams();
//   const textId = searchParams.get('text_id');
//   const {data: contentsData, isLoading: contentsDataLoading} = useQuery(
//     ["content", textId, sectionId, skip],
//     () => fetchContentDetails(textId, skip, 1, sectionId),
//     {
//       refetchOnWindowFocus: false,
//       enabled: true
//     }
//   )
//   // ------------------------ renderers ----------------------
//   const renderChapterHeader = () => {
//     const propsForChapterHeader = {viewMode, setViewMode, showTableOfContents, setShowTableOfContents}
//     return <ChapterHeader {...propsForChapterHeader}/>
//   }
//   const renderChapter = () => {
//     const propsForUseChapterHookComponent = {showTableOfContents}
//     return <UseChapterHook {...propsForUseChapterHookComponent} />
//   }
//   return (
//     <div className="contents-chapter-container">
//       {renderChapterHeader()}
//       {renderChapter()}
//
//     </div>
//   )
// }
//
// export  default React.memo(ContentsChapter)