import React from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/StyledComponents';

const NewsCard = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
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

const MainNewsCard = ({ news }) => {
  // 기본값 설정
  const defaultNews = {
    date: '2025년 4월 28일',
    title: '대선 후보 첫 TV토론, 주요 쟁점은?',
    content: '어제 열린 첫 대선 후보 TV토론에서는 경제, 안보, 복지 등 다양한 이슈에 대한 치열한 논쟁이 벌어졌습니다. 이번 토론에서는 특히 청년 일자리와 주거 문제에 대한 각 후보들의 대책이...',
    imageUrl: null
  };

  const { date, title, content, imageUrl } = news || defaultNews;

  return (
    <NewsCard>
      <NewsImg src={imageUrl} />
      <NewsContent>
        <NewsDate>{date}</NewsDate>
        <h3>{title}</h3>
        <p>{content}</p>
        <Button $primary>자세히 보기</Button>
      </NewsContent>
    </NewsCard>
  );
};

export default MainNewsCard;
