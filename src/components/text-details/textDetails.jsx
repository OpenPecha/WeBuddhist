import { useEffect, useRef, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './textDetails.scss';
import axiosInstance from "../../config/axios-config.js";

const TextDetails = () => {
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef(null);

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

    return (
        <Container fluid className="p-0">
            <div
                ref={ containerRef }
                className="tibetan-text-container"
                style={ {
                    height: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                    padding: '20px 50px'
                } }
            >
                { segments.map((segment) => (
                    <div key={ segment.id } className="text-segment mb-4">
                        <div
                            className="tibetan-text"
                            dangerouslySetInnerHTML={ { __html: segment.content } }
                        />
                    </div>
                )) }

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
        </Container>
    );
};

export default TextDetails;
