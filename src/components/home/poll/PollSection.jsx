import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Section, Container, Title } from '../../ui/StyledComponents';
import { PolicyQuestionAPI } from '../../../api/PolicyQuestionApi';

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

const ChangeVoteButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #333333;
  border-radius: 5px;
  cursor: pointer;
  background-color: white;
  color: #333333;
  margin-top: 15px;
  transition: all 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const UserSelectionMessage = styled.div`
  margin-top: 10px;
  font-size: 15px;
  color: #555;
  font-style: italic;
  text-align: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 30px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
  margin-bottom: 20px;
`;

// PollOption 컴포넌트 내장
const PollOption = ({ id, options, checked, onChange, disabled }) => {
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
        {options}
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
                <span>{result.options}</span>
                <span>{result.percent}%</span>
              </ResultLabel>
              <ResultBar>
                <ResultProgress $width={`${result.percent}%`} />
              </ResultBar>
            </ResultItem>
        ))}
      </ResultsContainer>
  );
};

const PollSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollData, setPollData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userSelection, setUserSelection] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [changeMode, setChangeMode] = useState(false);

  // 페이지 로드 시 로컬 스토리지에서 투표 여부 확인 (서버 데이터 로드 전 초기 상태)
  useEffect(() => {
    try {
      const votedQuestions = JSON.parse(localStorage.getItem('votedQuestions') || '{}');
      // 로컬 스토리지에 투표 기록이 있는지 확인 (pollData가 로드된 후)
      if (pollData && pollData.id && votedQuestions[pollData.id]) {
        setSelectedOption(votedQuestions[pollData.id]);
        setUserSelection(votedQuestions[pollData.id]);
        setHasVoted(true);
      }
    } catch (err) {
      console.error('Failed to read from local storage:', err);
    }
  }, [pollData]);

  // 최신 정책 질문 데이터 및 사용자 선택 로드
  useEffect(() => {
    const fetchLatestQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PolicyQuestionAPI.getLatestQuestion();
        setPollData(data);

        // 백엔드에서 반환된 사용자 선택 정보 확인
        if (data && data.userSelectedOptionId) {
          // 서버에서 사용자의 선택 정보가 이미 전달됨
          setUserSelection(data.userSelectedOptionId);
          setSelectedOption(data.userSelectedOptionId);
          setHasVoted(true);
          console.log('User has already voted for option:', data.userSelectedOptionId);
        } else if (data && data.id) {
          // 백업: 서버에서 userSelectedOptionId가 제공되지 않은 경우 별도 API 호출
          try {
            const userSelectionData = await PolicyQuestionAPI.getUserSelection(data.id);
            if (userSelectionData && userSelectionData.selectOptionId) {
              setUserSelection(userSelectionData.selectOptionId);
              setSelectedOption(userSelectionData.selectOptionId);
              setHasVoted(true);
              console.log('Got user selection from API:', userSelectionData.selectOptionId);
            }
          } catch (selectionErr) {
            console.error('Failed to fetch user selection:', selectionErr);
            // 사용자 선택을 가져오는데 실패해도 치명적인 오류는 아님
          }
        }
      } catch (err) {
        console.error('Failed to fetch policy question:', err);
        setError('정책 질문을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestQuestion();
  }, []);

  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId);
  };

  const toggleChangeMode = () => {
    setChangeMode(!changeMode);
    if (changeMode) {
      // 변경 모드 취소 시 사용자의 기존 선택으로 되돌리기
      setSelectedOption(userSelection);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      alert('항목을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      const requestData = {
        optionId: selectedOption,
        questionId: pollData.id
      };

      // 기존 선택이 있고 변경 모드인 경우, 이전 선택 정보도 포함
      if (changeMode && userSelection) {
        requestData.previousOptionId = userSelection;
      }

      // 투표 요청에 질문 ID와 변경 여부 포함
      const updatedData = await PolicyQuestionAPI.vote(
          selectedOption,
          pollData.id,
          changeMode ? userSelection : null
      );

      setPollData(updatedData);
      setHasVoted(true);
      setUserSelection(selectedOption);
      setChangeMode(false);

      // 로컬 스토리지에 투표 상태 저장 (새로고침 대비)
      try {
        const votedQuestions = JSON.parse(localStorage.getItem('votedQuestions') || '{}');
        votedQuestions[pollData.id] = selectedOption;
        localStorage.setItem('votedQuestions', JSON.stringify(votedQuestions));
      } catch (storageErr) {
        console.error('Failed to save vote to local storage:', storageErr);
      }

    } catch (err) {
      console.error('Failed to vote:', err);
      setError('투표 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중 상태 표시
  if (loading && !pollData) {
    return (
        <StyledPollSection>
          <Container>
            <Title>오늘의 질문</Title>
            <PollContainer>
              <LoadingMessage>정책 질문을 불러오고 있습니다...</LoadingMessage>
            </PollContainer>
          </Container>
        </StyledPollSection>
    );
  }

  // 오류 표시
  if (error && !pollData) {
    return (
        <StyledPollSection>
          <Container>
            <Title>오늘의 질문</Title>
            <PollContainer>
              <ErrorMessage>{error}</ErrorMessage>
              <Button onClick={() => window.location.reload()}>다시 시도</Button>
            </PollContainer>
          </Container>
        </StyledPollSection>
    );
  }

  // 데이터가 없는 경우
  if (!pollData) {
    return (
        <StyledPollSection>
          <Container>
            <Title>오늘의 질문</Title>
            <PollContainer>
              <LoadingMessage>현재 활성화된 정책 질문이 없습니다.</LoadingMessage>
            </PollContainer>
          </Container>
        </StyledPollSection>
    );
  }

  return (
      <StyledPollSection>
        <Container>
          <Title>오늘의 질문</Title>
          <PollContainer>
            {loading && <LoadingMessage>처리 중...</LoadingMessage>}
            {error && <ErrorMessage>{error}</ErrorMessage>}

            <PollQuestion>
              <p>{pollData.question}</p>
            </PollQuestion>

            <PollOptions>
              {pollData.options && pollData.options.map(option => (
                  <PollOption
                      key={option.id}
                      id={option.id}
                      options={option.options}
                      checked={selectedOption === option.id}
                      onChange={handleOptionChange}
                      disabled={hasVoted && !changeMode}
                  />
              ))}
            </PollOptions>

            {/* 이미 투표한 경우 선택 표시 */}
            {hasVoted && userSelection && !changeMode && (
                <UserSelectionMessage>
                  회원님은 이 설문에 참여하셨습니다.
                </UserSelectionMessage>
            )}

            {/* 투표 버튼 또는 변경 버튼 표시 */}
            {hasVoted && !changeMode ? (
                <ChangeVoteButton onClick={toggleChangeMode}>
                  투표 변경하기
                </ChangeVoteButton>
            ) : (
                <Button
                    onClick={handleVote}
                    $disabled={loading}
                    disabled={loading}
                >
                  {changeMode ? "투표 변경하기" : "투표하기"}
                </Button>
            )}

            {changeMode && (
                <ChangeVoteButton
                    onClick={toggleChangeMode}
                    style={{ marginTop: "10px" }}
                >
                  취소
                </ChangeVoteButton>
            )}

            {pollData.options && <PollResults results={pollData.options} />}
          </PollContainer>
        </Container>
      </StyledPollSection>
  );
};

export default PollSection;