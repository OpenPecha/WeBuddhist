import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './Pages.scss';
import { FiChevronDown } from 'react-icons/fi';
import { useTranslate } from '@tolgee/react';
import Versions from "./versions/Versions.jsx";
import Content from "./content/Content.jsx";
import {useParams, Link, useSearchParams} from 'react-router-dom';
import { getLanguageClass } from '../../utils/Constants';

const Pages = () => {
  const [selectedVersion, setSelectedVersion] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [contentId, setContentId] = useState('');
  const [searchParams] = useSearchParams();
  
  const titleInformation = {
    title: searchParams.get('title') || "",
    language: searchParams.get('language') || "",
    type: searchParams.get('type') || ""
  };
  
  const { t } = useTranslate();
  const { id } = useParams();

  return (
    <div className="pecha-app">
      <main className="main-content">
        <div className="content-area">
          <div className="text-header">
            <h3 className={` ${getLanguageClass(titleInformation?.language)}`}>{titleInformation?.title || ""}</h3>
            <div className="navbaritems subcom">
              {titleInformation?.type ? t(`text.type.${titleInformation.type}`) : ""}
            </div>
            <Link
            to={`/texts/text-details?text_id=${id}&contentId=${contentId}&versionId=&contentIndex=${0}`}
              className="continue-button navbaritems"
            >
              {t("text.button.continue_reading")}
            </Link>
          </div>

          <Tabs
            defaultActiveKey="contents"
            id="text-tabs"
            className="custom-tabs listsubtitle"
          >
            <Tab eventKey="contents" title={t("text.contents")}>
              <Content setContentId={setContentId}/>
            </Tab>
            <Tab eventKey="versions" title={t("common.version")}>
              <Versions contentId={contentId} />
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
                  <option value="" disabled>
                    {t("side_nav.download_text.select_version")}
                  </option>
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
                  <option value="" disabled>
                    {t("side_nav.download_text.select_format")}
                  </option>
                  <option value="textwithtag">
                    {t("side_nav.download_text.text_with_tag")}
                  </option>
                  <option value="textwithouttag">
                    {t("side_nav.download_text.text_without_tag")}
                  </option>
                  <option value="epub">
                    {t("side_nav.download_text.json")}
                  </option>
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

export default Pages;
