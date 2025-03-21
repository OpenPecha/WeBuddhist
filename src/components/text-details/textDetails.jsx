import { useEffect, useRef, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './textDetails.scss';
import axiosInstance from "../../config/axios-config.js";
import { IoMdClose } from 'react-icons/io';
import { useTranslate } from '@tolgee/react';
import { LANGUAGE, mapLanguageCode, menuItems } from '../../utils/Constants.js';
import { IoLanguage, IoNewspaperOutline } from "react-icons/io5";
import { BsWindowFullscreen } from "react-icons/bs";
import { FiInfo, FiList } from "react-icons/fi";
import { BiBook, BiSearch } from 'react-icons/bi';
import { useQuery } from 'react-query';

export const fetchTextsInfo = async (text_id) => {
    const storedLanguage = localStorage.getItem(LANGUAGE);
    const language = (storedLanguage ? mapLanguageCode(storedLanguage) : "bo");
    const { data } = await axiosInstance.get(`api/v1//texts/${text_id}/infos`, {
      params: {
        language,
        text_id
      }
    });
    return data;
  }
const TextDetails = () => {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showPanel, setShowPanel] = useState(false);
    const containerRef = useRef(null);
    const id="12" //will be coming as a param
    const { data: sidetextData } = useQuery(
        ["texts", id],
        () => fetchTextsInfo(id),
        {
          refetchOnWindowFocus: false,
          staleTime: 1000 * 60 * 20
        }
      );
    const { t } = useTranslate();
    // This could be your API endpoint
    const fetchData = async (pageNum) => {
        try {
            setLoading(true);
            // const response = await axios.get(`/api/texts/segments?page=${pageNum}&size=10`);
            await axiosInstance.get("/api/v1/users/info");

            const response = {
                segments: [
                    {
                        id: Math.random(),
                        text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                        content: "<span class=\"text-quotation-style\">དང་པོ་ནི་</span><span class=\"text-citation-style\">ཧོ་སྣང་སྲིད་</span>སོགས་ཚིག་རྐང་དྲུག་གིས་བསྟན།<span class=\"text-citation-style\">ཧོ༵་</span>ཞེས་པ་འཁྲུལ་བས་དབང་མེད་དུ་བྱས་ཏེ་མི་འདོད་པའི་ཉེས་རྒུད་དྲག་པོས་རབ་ཏུ་གཟིར་བའི་འཁོར་བའི་སེམས་ཅན་རྣམས་ལ་དམིགས་མེད་བརྩེ་བའི་རྣམ་པར་ཤར་ཏེ་འཁྲུལ་སྣང་རང་སར་དག་པའི་ཉེ་ལམ་ཟབ་མོ་འདིར་བསྐུལ་བའི་ཚིག་ཏུ་བྱས་པ་སྟེ།"
                    },
                    {
                        id: Math.random(),
                        text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                        content: "འདི་ལྟར་བློའི་ཡུལ་དུ་བྱ་རུང་བའི་ཆོས་རང་ངོས་ནས་བདེན་པར་མ་གྲུབ་པས་<span class=\"text-citation-style\">སྣང༵་</span>བ་ཙམ་དུ་ཟད་ཅིང་།གང་སྣང་ཐ་སྙད་ཙམ་དུ་བསླུ་བ་མེད་པར་གནས་པས་སྣང་ཙམ་དུ་<span class=\"text-citation-style\">སྲི༵ད་</span>ཅིང་ཡོད་པའི་མ་དག་ཀུན་ཉོན་འཁྲུལ་བའི་<span class=\"text-citation-style\">འཁོ༵ར་</span>བའི་སྣོད་བཅུད་རྒྱུ་འབྲས་ཀྱི་སྒྱུ་འཕྲུལ་སྣ་ཚོགས་ཀྱི་བཀོད་པ་འདི་དང་།དག་པ་རྣམ་བྱང་མྱང་<span class=\"text-citation-style\">འད༵ས་</span>ཀྱི་གྲོལ་བ་ཐར་པའི་ཡེ་ཤེས་ཡོན་ཏན་ཕྲིན་ལས་ཀྱི་རོལ་གར་བསམ་ལས་འདས་པའི་འཁྲུལ་གྲོལ་གྱི་ཆོས་འདི་<span class=\"text-citation-style\">ཐམ༵ས་</span><span class=\"text-citation-style\">ཅ༵ད་</span><span class=\"text-citation-style\">ཀུན༵</span>།"
                    },
                    {
                        id: Math.random(),
                        text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                        content: "འབྱུང་ཞིང་མཆེད་པའི་འབྱུང་གཞི།ཐིམ་ཞིང་སྡུད་པའི་སྡུད་གཞི།མཐར་ཐུག་ནི་སེམས་ཅན་རང་ཉིད་ཀྱི་སེམས་ཀྱི་གཤིས་ལུགས་ཕྲ་བ་གཉུག་མ་སེམས་ཀྱི་རྡོ་རྗེ་བྱང་ཆུབ་ཀྱི་སེམས་ངོ་བོའི་ཆ་ནས་སྟོང་ཞིང་ཀ་ནས་དག་པས།དངོས་པོ་རང་མཚན་གྱི་སྤྲོས་པའི་ཕྱོགས་ཀུན་དང་བྲལ་བ།རང་བཞིན་ཆ་ནས་གཏིང་གསལ་འགགས་པ་མེད་པའི་རང་བཞིན་ལྷུན་གྲུབ་ཀྱི་ཡོན་ཏན་འདུ་འབྲལ་སྤང་བས།"
                    },
                    {
                        id: Math.random(),
                        text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                        content: "<span class=\"text-quotation-style\">དང་པོ་ནི་</span><span class=\"text-citation-style\">ཧོ་སྣང་སྲིད་</span>སོགས་ཚིག་རྐང་དྲུག་གིས་བསྟན།<span class=\"text-citation-style\">ཧོ༵་</span>ཞེས་པ་འཁྲུལ་བས་དབང་མེད་དུ་བྱས་ཏེ་མི་འདོད་པའི་ཉེས་རྒུད་དྲག་པོས་རབ་ཏུ་གཟིར་བའི་འཁོར་བའི་སེམས་ཅན་རྣམས་ལ་དམིགས་མེད་བརྩེ་བའི་རྣམ་པར་ཤར་ཏེ་འཁྲུལ་སྣང་རང་སར་དག་པའི་ཉེ་ལམ་ཟབ་མོ་འདིར་བསྐུལ་བའི་ཚིག་ཏུ་བྱས་པ་སྟེ།"
                    },
                    {
                        id: Math.random(),
                        text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                        content: "འདི་ལྟར་བློའི་ཡུལ་དུ་བྱ་རུང་བའི་ཆོས་རང་ངོས་ནས་བདེན་པར་མ་གྲུབ་པས་<span class=\"text-citation-style\">སྣང༵་</span>བ་ཙམ་དུ་ཟད་ཅིང་།གང་སྣང་ཐ་སྙད་ཙམ་དུ་བསླུ་བ་མེད་པར་གནས་པས་སྣང་ཙམ་དུ་<span class=\"text-citation-style\">སྲི༵ད་</span>ཅིང་ཡོད་པའི་མ་དག་ཀུན་ཉོན་འཁྲུལ་བའི་<span class=\"text-citation-style\">འཁོ༵ར་</span>བའི་སྣོད་བཅུད་རྒྱུ་འབྲས་ཀྱི་སྒྱུ་འཕྲུལ་སྣ་ཚོགས་ཀྱི་བཀོད་པ་འདི་དང་།དག་པ་རྣམ་བྱང་མྱང་<span class=\"text-citation-style\">འད༵ས་</span>ཀྱི་གྲོལ་བ་ཐར་པའི་ཡེ་ཤེས་ཡོན་ཏན་ཕྲིན་ལས་ཀྱི་རོལ་གར་བསམ་ལས་འདས་པའི་འཁྲུལ་གྲོལ་གྱི་ཆོས་འདི་<span class=\"text-citation-style\">ཐམ༵ས་</span><span class=\"text-citation-style\">ཅ༵ད་</span><span class=\"text-citation-style\">ཀུན༵</span>།"
                    },
                    {
                        id: Math.random(),
                        text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                        content: "འབྱུང་ཞིང་མཆེད་པའི་འབྱུང་གཞི།ཐིམ་ཞིང་སྡུད་པའི་སྡུད་གཞི།མཐར་ཐུག་ནི་སེམས་ཅན་རང་ཉིད་ཀྱི་སེམས་ཀྱི་གཤིས་ལུགས་ཕྲ་བ་གཉུག་མ་སེམས་ཀྱི་རྡོ་རྗེ་བྱང་ཆུབ་ཀྱི་སེམས་ངོ་བོའི་ཆ་ནས་སྟོང་ཞིང་ཀ་ནས་དག་པས།དངོས་པོ་རང་མཚན་གྱི་སྤྲོས་པའི་ཕྱོགས་ཀུན་དང་བྲལ་བ།རང་བཞིན་ཆ་ནས་གཏིང་གསལ་འགགས་པ་མེད་པའི་རང་བཞིན་ལྷུན་གྲུབ་ཀྱི་ཡོན་ཏན་འདུ་འབྲལ་སྤང་བས།"
                    }
                ]
            };
            const newSegments = response.segments;

            if (newSegments.length === 0) {
                setHasMore(false);
            } else {
                setSegments(prevSegments => [...prevSegments, ...newSegments]);
                setPage(pageNum + 1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, []);

    const loadInitialData = () => {
        let initialData = {
            segments: [
                {
                    id: Math.random(),
                    text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                    content: "<span class=\"text-quotation-style\">དང་པོ་ནི་</span><span class=\"text-citation-style\">ཧོ་སྣང་སྲིད་</span>སོགས་ཚིག་རྐང་དྲུག་གིས་བསྟན།<span class=\"text-citation-style\">ཧོ༵་</span>ཞེས་པ་འཁྲུལ་བས་དབང་མེད་དུ་བྱས་ཏེ་མི་འདོད་པའི་ཉེས་རྒུད་དྲག་པོས་རབ་ཏུ་གཟིར་བའི་འཁོར་བའི་སེམས་ཅན་རྣམས་ལ་དམིགས་མེད་བརྩེ་བའི་རྣམ་པར་ཤར་ཏེ་འཁྲུལ་སྣང་རང་སར་དག་པའི་ཉེ་ལམ་ཟབ་མོ་འདིར་བསྐུལ་བའི་ཚིག་ཏུ་བྱས་པ་སྟེ།"
                },
                {
                    id: Math.random(),
                    text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                    content: "འདི་ལྟར་བློའི་ཡུལ་དུ་བྱ་རུང་བའི་ཆོས་རང་ངོས་ནས་བདེན་པར་མ་གྲུབ་པས་<span class=\"text-citation-style\">སྣང༵་</span>བ་ཙམ་དུ་ཟད་ཅིང་།གང་སྣང་ཐ་སྙད་ཙམ་དུ་བསླུ་བ་མེད་པར་གནས་པས་སྣང་ཙམ་དུ་<span class=\"text-citation-style\">སྲི༵ད་</span>ཅིང་ཡོད་པའི་མ་དག་ཀུན་ཉོན་འཁྲུལ་བའི་<span class=\"text-citation-style\">འཁོ༵ར་</span>བའི་སྣོད་བཅུད་རྒྱུ་འབྲས་ཀྱི་སྒྱུ་འཕྲུལ་སྣ་ཚོགས་ཀྱི་བཀོད་པ་འདི་དང་།དག་པ་རྣམ་བྱང་མྱང་<span class=\"text-citation-style\">འད༵ས་</span>ཀྱི་གྲོལ་བ་ཐར་པའི་ཡེ་ཤེས་ཡོན་ཏན་ཕྲིན་ལས་ཀྱི་རོལ་གར་བསམ་ལས་འདས་པའི་འཁྲུལ་གྲོལ་གྱི་ཆོས་འདི་<span class=\"text-citation-style\">ཐམ༵ས་</span><span class=\"text-citation-style\">ཅ༵ད་</span><span class=\"text-citation-style\">ཀུན༵</span>།"
                },
                {
                    id: Math.random(),
                    text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                    content: "འབྱུང་ཞིང་མཆེད་པའི་འབྱུང་གཞི།ཐིམ་ཞིང་སྡུད་པའི་སྡུད་གཞི།མཐར་ཐུག་ནི་སེམས་ཅན་རང་ཉིད་ཀྱི་སེམས་ཀྱི་གཤིས་ལུགས་ཕྲ་བ་གཉུག་མ་སེམས་ཀྱི་རྡོ་རྗེ་བྱང་ཆུབ་ཀྱི་སེམས་ངོ་བོའི་ཆ་ནས་སྟོང་ཞིང་ཀ་ནས་དག་པས།དངོས་པོ་རང་མཚན་གྱི་སྤྲོས་པའི་ཕྱོགས་ཀུན་དང་བྲལ་བ།རང་བཞིན་ཆ་ནས་གཏིང་གསལ་འགགས་པ་མེད་པའི་རང་བཞིན་ལྷུན་གྲུབ་ཀྱི་ཡོན་ཏན་འདུ་འབྲལ་སྤང་བས།"
                },
                {
                    id: Math.random(),
                    text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                    content: "<span class=\"text-quotation-style\">དང་པོ་ནི་</span><span class=\"text-citation-style\">ཧོ་སྣང་སྲིད་</span>སོགས་ཚིག་རྐང་དྲུག་གིས་བསྟན།<span class=\"text-citation-style\">ཧོ༵་</span>ཞེས་པ་འཁྲུལ་བས་དབང་མེད་དུ་བྱས་ཏེ་མི་འདོད་པའི་ཉེས་རྒུད་དྲག་པོས་རབ་ཏུ་གཟིར་བའི་འཁོར་བའི་སེམས་ཅན་རྣམས་ལ་དམིགས་མེད་བརྩེ་བའི་རྣམ་པར་ཤར་ཏེ་འཁྲུལ་སྣང་རང་སར་དག་པའི་ཉེ་ལམ་ཟབ་མོ་འདིར་བསྐུལ་བའི་ཚིག་ཏུ་བྱས་པ་སྟེ།"
                },
                {
                    id: Math.random(),
                    text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                    content: "འདི་ལྟར་བློའི་ཡུལ་དུ་བྱ་རུང་བའི་ཆོས་རང་ངོས་ནས་བདེན་པར་མ་གྲུབ་པས་<span class=\"text-citation-style\">སྣང༵་</span>བ་ཙམ་དུ་ཟད་ཅིང་།གང་སྣང་ཐ་སྙད་ཙམ་དུ་བསླུ་བ་མེད་པར་གནས་པས་སྣང་ཙམ་དུ་<span class=\"text-citation-style\">སྲི༵ད་</span>ཅིང་ཡོད་པའི་མ་དག་ཀུན་ཉོན་འཁྲུལ་བའི་<span class=\"text-citation-style\">འཁོ༵ར་</span>བའི་སྣོད་བཅུད་རྒྱུ་འབྲས་ཀྱི་སྒྱུ་འཕྲུལ་སྣ་ཚོགས་ཀྱི་བཀོད་པ་འདི་དང་།དག་པ་རྣམ་བྱང་མྱང་<span class=\"text-citation-style\">འད༵ས་</span>ཀྱི་གྲོལ་བ་ཐར་པའི་ཡེ་ཤེས་ཡོན་ཏན་ཕྲིན་ལས་ཀྱི་རོལ་གར་བསམ་ལས་འདས་པའི་འཁྲུལ་གྲོལ་གྱི་ཆོས་འདི་<span class=\"text-citation-style\">ཐམ༵ས་</span><span class=\"text-citation-style\">ཅ༵ད་</span><span class=\"text-citation-style\">ཀུན༵</span>།"
                },
                {
                    id: Math.random(),
                    text_id: "5894c3b8-4c52-4964-b0d1-9498a71fd1e1",
                    content: "འབྱུང་ཞིང་མཆེད་པའི་འབྱུང་གཞི།ཐིམ་ཞིང་སྡུད་པའི་སྡུད་གཞི།མཐར་ཐུག་ནི་སེམས་ཅན་རང་ཉིད་ཀྱི་སེམས་ཀྱི་གཤིས་ལུགས་ཕྲ་བ་གཉུག་མ་སེམས་ཀྱི་རྡོ་རྗེ་བྱང་ཆུབ་ཀྱི་སེམས་ངོ་བོའི་ཆ་ནས་སྟོང་ཞིང་ཀ་ནས་དག་པས།དངོས་པོ་རང་མཚན་གྱི་སྤྲོས་པའི་ཕྱོགས་ཀུན་དང་བྲལ་བ།རང་བཞིན་ཆ་ནས་གཏིང་གསལ་འགགས་པ་མེད་པའི་རང་བཞིན་ལྷུན་གྲུབ་ཀྱི་ཡོན་ཏན་འདུ་འབྲལ་སྤང་བས།"
                }
            ]
        };
        setSegments(initialData.segments);
    };

    useEffect(() => {
        loadInitialData();//todo - where to make init call
    }, []);

    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const scrollPosition = (scrollTop + clientHeight) / scrollHeight;

        if (scrollPosition >= 0.75 && !loading && hasMore) {
            fetchData(page);
        }
    };

    useEffect(() => {
        const currentContainer = containerRef.current;
        if (currentContainer) {
            currentContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [page, loading, hasMore]);


    const renderSidePanel = () => {
        return (
            <div className={`right-panel navbaritems ${showPanel ? 'show' : ''}`}>
                <div>
                    <div className="headerthing">
                        <p className='mt-4 px-4 listtitle'>{t('panel.resources')}</p>
                        <IoMdClose 
                            size={24} 
                            onClick={() => setShowPanel(false)}
                            className="close-icon"
                        />
                    </div>
                    <div className="panel-content p-3">
                        <p><FiInfo className="m-2"/> {t("side_nav.about_text")}</p>
                        <p><FiList className='m-2'/>{t("text.table_of_contents")}</p>
                        <p><BiSearch className='m-2'/>{t("connection_panel.search_in_this_text")}</p>
                        
                        {sidetextData?.translations > 0 && (
                            <p>
                                <IoLanguage className="m-2"/>
                                {`${t("connection_pannel.translations")} (${sidetextData.translations})`}
                            </p>
                        )}
                        
                        {sidetextData?.related_texts?.length > 0 && (
                            <>
                                <p className='textgreat'>{t("text.related_texts")}</p>
                                <p>
                                    {sidetextData.related_texts.map((data, index) => (
                                        <span key={index}>
                                            <BiBook className="m-2"/>
                                            {`${data.title} (${data.count})`}
                                        </span>
                                    ))}
                                </p>
                            </>
                        )}
                        
                        {sidetextData?.sheets > 0 && (
                            <>
                                <p className='textgreat'>{t("panel.resources")}</p>
                                <p>
                                    <IoNewspaperOutline className="m-2"/>
                                    {` ${t("common.sheets")} (${sidetextData.sheets})`}
                                </p>
                            </>
                        )}

                        {sidetextData?.web_pages > 0 && (
                            <p>
                                <BsWindowFullscreen className="m-2"/>
                                {` ${t("text.web_pages")} (${sidetextData.web_pages})`}
                            </p>
                        )}

                        {menuItems.map((item) => (
                            <div 
                                key={item.label}
                                className={item.isHeader ? 'textgreat' : ' '}
                            >
                                <p>
                                    {item.icon && <item.icon className='m-2' />}
                                    {t(`${item.label}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Container fluid className="p-0">
            <div
                ref={ containerRef }
                className="tibetan-text-container"
            >
                {segments.map((segment) => (
                    <div 
                        key={segment.id} 
                        className="text-segment mb-4"
                        onClick={() => setShowPanel(true)}
                    >
                        <div
                            className="tibetan-text"
                            dangerouslySetInnerHTML={{ __html: segment.content }}
                        />
                    </div>
                ))}
                
                { loading && (
                    <div className="text-center my-4">
                        <Spinner animation="border" role="output">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) }

                { !hasMore && segments.length > 0 && (
                    <div className="text-center text-muted my-4">
                        End of content
                    </div>
                ) }
            </div>
            {renderSidePanel()}
        </Container>
    );
};

export default TextDetails;
