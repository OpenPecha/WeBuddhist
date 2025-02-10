import {LANGUAGE} from "../../utils/Constants.js";
import axiosInstance from "../../config/axios-config.js";
import {useQuery} from "react-query";


const fetchTopics = async () => {
  const language = localStorage.getItem(LANGUAGE) ??  "bo";
  const { data } = await axiosInstance.get("api/v1/topics", {
    params: { language }
  });
  return data;
}
const Topics = () => {
  const {data: topicsData, isLoading: topicsIsLoading} = useQuery("topics", fetchTopics,{refetchOnWindowFocus: false})

  return (
    <>
    Topics
    </>
  )
}
export default Topics