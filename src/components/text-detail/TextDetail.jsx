import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './TextDetail.scss';
import { FiChevronDown } from 'react-icons/fi';
import { useTranslate } from '@tolgee/react';
import Versions from "./versions/Versions.jsx";
import Content from "./content/Content.jsx";
import axiosInstance from '../../config/axios-config.js';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

const fetchTextDetail = async (text_id, skip, limit) => {
  try {
    const { data } = await axiosInstance.get(`/api/v1/texts/${text_id}/versions`, {
      params: {
        text_id,
        skip,
        limit
      }
    });
    return data;
  } catch (error) {
    console.error("Error fetching text details:", error);
    return { title: "", type: "" }; 
  }
};
const TextDetail = () => {
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const { t } = useTranslate();
  const { id } = useParams();

  const { data: textDetail, isLoading } = useQuery(
    ["textDetail", id],
    () => fetchTextDetail(id),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
      onError: (err) => {
        console.error("Query error:", err);
      }
    }
  );
  
  return (
    <div className="pecha-app">
      <main className="main-content">
        <div className="content-area">
          <div className="text-header">
            <h1 className="title">{textDetail?.text?.title|| ""}</h1>
            <div className="navbaritems subcom">{textDetail?.text?.type || ""}</div>
            <button className="continue-button navbaritems">{t("text.button.continue_reading")}</button>
          </div>

          <Tabs defaultActiveKey="contents" id="text-tabs" className="custom-tabs">
            <Tab eventKey="contents" title={t("text.contents")}>
              <Content />
            </Tab>
            <Tab eventKey="versions" title={t("common.version")}>
              <Versions />
            </Tab>
          </Tabs>
        </div>

        <aside className="sidebar navbaritems">
          <div className="download-panel">
            <p>{t("side_nav.download_text")}</p>
            <div className="select-group">
              <label>{t("side_nav.download_text.select_version")}</label>
              <div className="select-wrapper">
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                >
                  <option value="" disabled>{t("side_nav.download_text.select_version")}</option>
                  <option value="version1">Dummy</option>
                </select>
                <FiChevronDown size={16} />
              </div>
            </div>

            <div className="select-group navbaritems">
              <label>{t("side_nav.download_text.select_format")}</label>
              <div className="select-wrapper">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  <option value="" disabled>{t("side_nav.download_text.select_format")}</option>
                  <option value="textwithtag">{t("side_nav.download_text.text_with_tag")}</option>
                  <option value="textwithouttag">{t("side_nav.download_text.text_without_tag")}</option>
                  <option value="epub">{t("side_nav.download_text.json")}</option>
                  <option value="csv">{t("side_nav.download_text.csv")}</option>
                </select>
                <FiChevronDown size={16} />
              </div>
            </div>

            <button className="download-button">{t("text.download")}</button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default TextDetail;
