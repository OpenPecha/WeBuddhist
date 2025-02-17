import { Button, Col, Container, Row } from "react-bootstrap";
import "./HomePage.scss";
import { useTranslate } from "@tolgee/react";
import axiosInstance from "../../config/axios-config.js";
import {LANGUAGE} from "../../utils/Constants.js";
import {useQuery} from "react-query";


const fetchTexts = async () => {
    const language = localStorage.getItem(LANGUAGE) ??  "bo";
    const { data } = await axiosInstance.get("api/v1/texts", {
        params: { language }
    });
    return data;
}
const HomePage = () => {
    const { t } = useTranslate();
    const {data: textData, isLoading: textsIsLoading} = useQuery("texts", fetchTexts,{refetchOnWindowFocus: false})
    return (
        <Container fluid className="homepage-container">
            <Row className="justify-content-center">
                <Col lg={7} md={8} className="left-section mb-4 mb-lg-0">
                    <div className="section-1 ">
                        <h2 className="title mt-2  browse-library-text">{ t("home.browse_text") }</h2>
                        <Button className="browse-button">
                            { t("side_nav.explore_collections") }
                        </Button>
                    </div>

                    <div className="section-2 mt-5">
                        <Row className="full-width-row flex-lg-row flex-column">
                            <Col md={10} lg={6} className="part  part-left">
                                <div className=" green-line mb-3"/>
                                <div className="subtitle part-title">{ t("content.title.words_of_buddha") } </div> 
                                <p className=" subtitle part-subtitle"> { t("content.subtitle.words_of_buddha") }</p>
                            </Col>

                            <Col md={10} lg={6} className="part part-right">
                                <div className="red-line mb-3"/>
                                <p className="subtitle part-title">{ t("content.title.liturgy") }</p>
                                <p className="subtitle part-subtitle">{ t("content.subtitle.prayers_rutuals") }</p>
                            </Col>
                        </Row>

                        <Row className="full-width-row flex-lg-row flex-column">
                            <Col md={10} lg={6}  className="part  part-left ">
                                <div className="red-line  mb-3"/>
                                <div className="subtitle part-title">{ t("content.title.Buddhavacana") }</div>
                                <p className="subtitle part-subtitle">{ t("content.subtitle.buddhavacana") }</p>
                            </Col>
                        </Row>
                    </div>
                </Col>

                <Col lg={5} md={4} className="right-section d-flex flex-column">
                    <h2 className="title right-title">{ t("side_nav.about_pecha_title") }</h2>
                    <hr className="right-divider"/>
                    <p className=" subtitle right-paragraph">
                        { t("side_nav.about_pecha_description") }
                        <span className=" learn-more"> { t("common.learn_more") }</span>
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default HomePage;
