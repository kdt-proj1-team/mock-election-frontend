import React from 'react';
import styled from 'styled-components';
import {Section, Container, Title} from '../../ui/StyledComponents';
import {useNewsData} from "../../../hooks/NewsData";

const StyledNewsSection = styled(Section)`
    background-color: #f5f5f5;
    padding: 60px 0;
`;

const NewsContainer = styled.div`
    display: flex;
    gap: 30px;
    margin-top: 30px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const NewsMain = styled.div`
    flex: 2;
`;

const NewsSide = styled.div`
    flex: 1;
`;

const NewsCard = styled.div`
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
`;

const NewsImg = styled.div`
    height: 200px;
    background-color: #e0e0e0;
    background-image: ${props => props.src ? `url(${props.src})` : 'none'};
    background-size: cover;
    background-position: center;
`;

const NewsContent = styled.div`
    padding: 20px;
`;

const NewsDate = styled.div`
    color: #888;
    font-size: 14px;
    margin-bottom: 5px;
`;

const SideNewsItem = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }
`;

const SideNewsImg = styled.div`
    width: 60px;
    height: 60px;
    background-color: #e0e0e0;
    background-image: ${props => props.src ? `url(${props.src})` : 'none'};
    background-size: cover;
    background-position: center;
    margin-right: 15px;
    border-radius: 5px;
`;

const SideNewsContent = styled.div`
    flex: 1;
`;

const CustomButton = styled.button`
    padding: 8px 16px;
    background-color: #333333;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background-color: #222222;
    }
`;

const NewsSection = () => {
    const {mainNews, sideNews, isLoading, error} = useNewsData();
    if (isLoading) return <div>뉴스 불러오는 중...</div>;
    if (error) return <div>{error}</div>;

    // 샘플 뉴스 데이터
    // const mainNews = {
    //   link: '2025년 4월 28일',
    //   title: '대선 후보 첫 TV토론, 주요 쟁점은?',
    //   content: '어제 열린 첫 대선 후보 TV토론에서는 경제, 안보, 복지 등 다양한 이슈에 대한 치열한 논쟁이 벌어졌습니다. 이번 토론에서는 특히 청년 일자리와 주거 문제에 대한 각 후보들의 대책이...',
    //   imageUrl: null
    // };
    //
    // const sideNews = [
    //   {
    //     id: 1,
    //     title: '선관위, 투표소 운영 시간 확대 검토',
    //     link: '2025.04.27',
    //     imageUrl: null
    //   },
    //   {
    //     id: 2,
    //     title: '국민 관심사 1위는 \'경제\', 2위는?',
    //     link: '2025.04.26',
    //     imageUrl: null
    //   },
    //   {
    //     id: 3,
    //     title: '20대 투표율, 역대 최고 기록 가능성',
    //     link: '2025.04.25',
    //     imageUrl: null
    //   }
    // ];

    return (
        <StyledNewsSection>
            <Container>
                <Title>선거 뉴스</Title>
                <NewsContainer>
                    <NewsMain>
                        <NewsCard>
                            <NewsImg src={mainNews.imageUrl}/>
                            <NewsContent>
                                <h3>{mainNews.title}</h3>
                                <p>{mainNews.content}</p>
                                <a href={mainNews.link} target="_blank" rel="noopener noreferrer">
                                    <CustomButton>자세히 보기</CustomButton>
                                </a>
                            </NewsContent>
                        </NewsCard>
                    </NewsMain>
                    <NewsSide>
                        <NewsCard>
                            {sideNews.map(item => (
                                <SideNewsItem key={item.id}>
                                    <SideNewsImg src={item.imageUrl}/>
                                    <SideNewsContent>
                                        <h4>{item.title}</h4>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                                            <CustomButton>자세히 보기</CustomButton>
                                        </a>
                                    </SideNewsContent>
                                </SideNewsItem>
                            ))}
                        </NewsCard>
                    </NewsSide>
                </NewsContainer>
            </Container>
        </StyledNewsSection>
    );
};

export default NewsSection;