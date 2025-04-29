import React, { useState } from 'react';
import styled from 'styled-components';
import { Section, Container, Title } from '../../ui/StyledComponents';

const StyledKeywordsSection = styled(Section)`
  padding: 60px 0;
  background-color: #f5f5f5;
`;

const KeywordCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
`;

const KeywordItem = styled.div`
  padding: 10px 20px;
  background-color: ${props => {
    if (props.selected) return '#666666';
    if (props.size === 'large') return '#333333';
    if (props.size === 'medium') return '#999999';
    return 'white';
  }};
  color: ${props => {
    if (props.selected || props.size === 'large' || props.size === 'medium') return 'white';
    return '#333333';
  }};
  border-radius: 30px;
  font-weight: 500;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
  font-size: ${props => {
    if (props.size === 'large') return '18px';
    if (props.size === 'medium') return '16px';
    if (props.size === 'small') return '14px';
    return '16px';
  }};
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
`;

// 내장 Keyword 컴포넌트
const Keyword = ({ id, text, size, selected, onClick }) => {
  return (
    <KeywordItem 
      size={size} 
      selected={selected}
      onClick={onClick}
    >
      {text}
    </KeywordItem>
  );
};

// 키워드 데이터
const keywordsData = [
  { id: 1, text: '경제성장', size: 'large' },
  { id: 2, text: '청년일자리', size: 'medium' },
  { id: 3, text: '부동산정책', size: 'normal' },
  { id: 4, text: '최저임금', size: 'medium' },
  { id: 5, text: '연금개혁', size: 'normal' },
  { id: 6, text: '육아지원', size: 'medium' },
  { id: 7, text: '기후변화', size: 'normal' },
  { id: 8, text: '국가안보', size: 'large' },
  { id: 9, text: '디지털전환', size: 'normal' },
  { id: 10, text: '공정경쟁', size: 'normal' },
  { id: 11, text: '교육개혁', size: 'medium' },
  { id: 12, text: '지역균형', size: 'normal' },
  { id: 13, text: '신재생에너지', size: 'normal' },
  { id: 14, text: '의료보험', size: 'small' },
  { id: 15, text: '고령화', size: 'small' }
];

const KeywordsSection = () => {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  
  const handleKeywordClick = (keywordId) => {
    setSelectedKeyword(keywordId);
    console.log(`Keyword ${keywordId} clicked`);
    // 여기에 키워드 클릭 시 수행할 작업을 추가할 수 있습니다
    // 예: 관련 뉴스 표시, 필터링 등
  };

  return (
    <StyledKeywordsSection>
      <Container>
        <Title>핫이슈 키워드</Title>
        <KeywordCloud>
          {keywordsData.map(keyword => (
            <Keyword
              key={keyword.id}
              id={keyword.id}
              text={keyword.text}
              size={keyword.size}
              selected={selectedKeyword === keyword.id}
              onClick={() => handleKeywordClick(keyword.id)}
            />
          ))}
        </KeywordCloud>
      </Container>
    </StyledKeywordsSection>
  );
};

export default KeywordsSection;