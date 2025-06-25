import {LANGUAGE, mapLanguageCode} from "../../../utils/Constants.js";
import axiosInstance from "../../../config/axios-config.js";


export const fetchTextContent = async (text_id, skip, pagination) => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
  const {data} = await axiosInstance.get(`/api/v1/texts/${text_id}/contents`, {
    params: {
      language,
      limit: pagination.limit,
      skip: skip
    }
  });
  return data;
};

const Content = () => {

}

export default React.memo(Content)