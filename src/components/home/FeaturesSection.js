import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  padding: 60px 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 40px;
  font-size: 36px;
  color: #333333;
`;

const FeatureCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.div`
  height: 160px;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  color: #333333;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 22px;
`;

const CardText = styled.p`
  color: #666;
  margin-bottom: 15px;
`;

const Button = styled.button`
  padding: 10px 15px;
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

// 특징 데이터 배열
const featuresData = [
  {
    id: 1,
    icon: '🔍',
    title: '후보 비교',
    description: '각 후보들의 정책, 경력, 공약을 한눈에 비교해보세요.',
    buttonText: '자세히 보기'
  },
  {
    id: 2,
    icon: '🗳️',
    title: '가상 투표',
    description: '실제 투표를 경험해보고 익명으로 통계 결과를 확인하세요.',
    buttonText: '체험하기'
  },
  {
    id: 3,
    icon: '📍',
    title: '투표소 찾기',
    description: '내 위치에서 가장 가까운 투표소를 쉽게 찾아보세요.',
    buttonText: '위치 확인'
  },
  {
    id: 4,
    icon: '🧩',
    title: '정책 퀴즈',
    description: '재미있는 퀴즈로 정책을 이해하고 나의 성향을 파악해보세요.',
    buttonText: '퀴즈 풀기'
  }
];

// 내장된 FeatureCard 컴포넌트
const FeatureCard = ({ icon, title, description, buttonText, onClick }) => {
  return (
    <Card>
      <CardImage>{icon}</CardImage>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardText>{description}</CardText>
        <Button onClick={onClick}>{buttonText}</Button>
      </CardContent>
    </Card>
  );
};

const FeaturesSection = () => {
  const handleFeatureClick = (id) => {
    console.log(`Feature ${id} clicked`);
    // 여기에 각 기능을 클릭했을 때의 동작을 구현할 수 있습니다.
  };

  return (
    <Section>
      <Container>
        <Title>핵심 기능</Title>
        <FeatureCards>
          {featuresData.map(feature => (
            <FeatureCard 
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              buttonText={feature.buttonText}
              onClick={() => handleFeatureClick(feature.id)}
            />
          ))}
        </FeatureCards>
      </Container>
    </Section>
  );
};

export default FeaturesSection;