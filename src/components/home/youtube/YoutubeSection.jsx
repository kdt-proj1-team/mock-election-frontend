import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { YoutubeAPI } from '../../../api/YoutubeApi';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styled from 'styled-components';
import { Section, Container } from '../../ui/StyledComponents';

const YoutubeContainer = styled(Section)`
    background: #ffffff;
    color: #333;
    padding: 60px 0;
    text-align: center;
`;

const SectionTitle = styled.h2`
    font-size: 32px;
    margin-bottom: 30px;
    color: #333;
`;

const SectionText = styled.p`
    font-size: 18px;
    margin-bottom: 40px;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    color: #555;
`;

const VideoContainer = styled.div`
    margin: 0 auto;
    max-width: 1200px;
    width: 100%;
`;

const SliderContainer = styled.div`
    background: #e0e5ec;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff;
    width: 100%;
`;

const VideoCard = styled.div`
    padding: 20px;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;

    &:hover {
        transform: translateY(-5px);
    }
`;

const VideoThumbnail = styled.img`
    width: 100%;
    border-radius: 15px;
    box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 8px 8px 15px #94a3b8, -8px -8px 15px #ffffff;
    }
`;

const VideoTitle = styled.p`
    color: #333;
    font-weight: 600;
    margin-top: 15px;
    padding: 10px;
    font-size: 16px;
    min-height: 80px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: center;
`;

const VideoLink = styled.a`
    text-decoration: none;
    color: inherit;
    display: block;
    width: 100%;
`;

const CustomSliderStyles = styled.div`
    .slick-prev, .slick-next {
        font-size: 0;
        width: 40px;
        height: 40px;
        background: #e0e5ec;
        border-radius: 50%;
        box-shadow: 5px 5px 10px #a3b1c6, -5px -5px 10px #ffffff;
        z-index: 1;

        &:hover, &:focus {
            background: #e0e5ec;
            box-shadow: inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff;
        }

        &:before {
            color: #555;
            opacity: 0.8;
        }
    }

    .slick-prev {
        left: -25px;
    }

    .slick-next {
        right: -25px;
    }

    .slick-dots li button:before {
        color: #555;
    }

    .slick-dots li.slick-active button:before {
        color: #333;
    }

    @media (max-width: 768px) {
        .slick-prev {
            left: -25px;
        }

        .slick-next {
            right: -25px;
        }
    }
`;

function YoutubeSection() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        YoutubeAPI.fetchYoutubeVideos('대선토론')
            .then(data => {
                setVideos(data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2, slidesToScroll: 1 }
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1, slidesToScroll: 1 }
            }
        ]
    };

    return (
        <YoutubeContainer>
            <Container>
                <SectionTitle>토론 영상 목록</SectionTitle>
                <SectionText>
                    최신 대선 토론 및 관련 영상을 확인하고 후보들의 정책과 비전을 비교해보세요.
                </SectionText>

                <VideoContainer>
                    <SliderContainer>
                        {loading ? (
                            <p>영상 로딩 중...</p>
                        ) : (
                            <CustomSliderStyles>
                                <Slider {...settings}>
                                    {videos.map(video => (
                                        <VideoCard key={video.id.videoId}>
                                            <VideoLink
                                                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <VideoThumbnail
                                                    src={video.snippet.thumbnails.medium.url}
                                                    alt={video.snippet.title}
                                                />
                                                <VideoTitle>
                                                    {video.snippet.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'")}
                                                </VideoTitle>
                                            </VideoLink>
                                        </VideoCard>
                                    ))}
                                </Slider>
                            </CustomSliderStyles>
                        )}
                    </SliderContainer>
                </VideoContainer>
            </Container>
        </YoutubeContainer>
    );
}

export default YoutubeSection;