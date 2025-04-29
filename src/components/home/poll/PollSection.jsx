import React, { useState } from 'react';
import styled from 'styled-components';
import { Section, Container, Title } from '../../ui/StyledComponents';

const StyledPollSection = styled(Section)`
  padding: 60px 0;
`;

const PollContainer = styled.div`
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const PollQuestion = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const PollOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const StyledPollOption = styled.label`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 10px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: background-color 0.3s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#f5f5f5' : '#e0e0e0'};
  }
  
  input {
    margin-right: 15px;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  background-color: ${props => props.$disabled ? '#aaaaaa' : '#333333'};
  color: white;
  width: 100%;
  
  &:hover {
    background-color: ${props => props.$disabled ? '#aaaaaa' : '#222222'};
  }
`;

const ResultsContainer = styled.div`
  margin-top: 30px;
`;

const ResultItem = styled.div`
  margin-bottom: 15px;
`;

const ResultLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const ResultBar = styled.div`
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
`;

const ResultProgress = styled.div`
  height: 100%;
  background-color: #555555;
  width: ${props => props.$width || '0%'};
`;

// 예시 투표 데이터
const pollData = {
  question: "귀하가 생각하는 차기 정부가 가장 우선적으로 해결해야 할 과제는 무엇입니까?",
  options: [
    { id: "경제", label: "경제 성장 및 일자리 창출", percent: 42 },
    { id: "복지", label: "복지 확대 및 사회 안전망 강화", percent: 23 },
    { id: "안보", label: "국가 안보 및 외교 관계 강화", percent: 15 },
    { id: "주거", label: "주택 정책 및 부동산 안정화", percent: 12 },
    { id: "환경", label: "기후변화 대응 및 환경정책", percent: 8 }
  ]
};

// PollOption 컴포넌트 내장
const PollOption = ({ id, label, checked, onChange, disabled }) => {
  return (
    <StyledPollOption disabled={disabled}>
      <input 
        type="radio" 
        name="poll" 
        value={id} 
        checked={checked} 
        onChange={() => onChange(id)} 
        disabled={disabled}
      /> 
      {label}
    </StyledPollOption>
  );
};

// PollResults 컴포넌트 내장
const PollResults = ({ results }) => {
  return (
    <ResultsContainer>
      <h3>현재 결과</h3>
      {results.map(result => (
        <ResultItem key={result.id}>
          <ResultLabel>
            <span>{result.label}</span>
            <span>{result.percent}%</span>
          </ResultLabel>
          <ResultBar>
            <ResultProgress width={`${result.percent}%`} />
          </ResultBar>
        </ResultItem>
      ))}
    </ResultsContainer>
  );
};

const PollSection = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState(pollData.options);

  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleVote = () => {
    if (!selectedOption) {
      alert('항목을 선택해주세요.');
      return;
    }
    
    // 투표 결과 업데이트 (실제로는 API 호출 필요)
    alert(`"${selectedOption}" 항목에 투표했습니다.`);
    setHasVoted(true);
    
    // 여기서 API 호출로 투표 결과를 서버로 전송할 수 있습니다.
    // 예시: api.vote(selectedOption).then(response => setResults(response.data));
  };

  return (
    <StyledPollSection>
      <Container>
        <Title>오늘의 질문</Title>
        <PollContainer>
          <PollQuestion>
            <p>{pollData.question}</p>
          </PollQuestion>
          
          <PollOptions>
            {pollData.options.map(option => (
              <PollOption
                key={option.id}
                id={option.id}
                label={option.label}
                checked={selectedOption === option.id}
                onChange={handleOptionChange}
                disabled={hasVoted}
              />
            ))}
          </PollOptions>
          
          <Button 
            onClick={handleVote}
            disabled={hasVoted}
          >
            {hasVoted ? "투표 완료" : "투표하기"}
          </Button>
          
          <PollResults results={results} />
        </PollContainer>
      </Container>
    </StyledPollSection>
  );
};

export default PollSection;