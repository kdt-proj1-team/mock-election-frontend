import React from 'react';
import styled from 'styled-components';

const NewsCard = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
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

const SideNewsCard = ({ newsItems }) => {
  // 기본값 설정
  const defaultNewsItems = [
    {
      id: 1,
      title: '선관위, 투표소 운영 시간 확대 검토',
      date: '2025.04.27',
      imageUrl: null
    },
    {
      id: 2,
      title: '국민 관심사 1위는 \'경제\', 2위는?',
      date: '2025.04.26',
      imageUrl: null
    },
    {
      id: 3,
      title: '20대 투표율, 역대 최고 기록 가능성',
      date: '2025.04.25',
      imageUrl: null
    }
  ];

  const items = newsItems || defaultNewsItems;

  return (
    <NewsCard>
      {items.map(item => (
        <SideNewsItem key={item.id}>
          <SideNewsImg src={item.imageUrl} />
          <SideNewsContent>
            <h4>{item.title}</h4>
            <span>{item.date}</span>
          </SideNewsContent>
        </SideNewsItem>
      ))}
    </NewsCard>
  );
};

export default SideNewsCard;