import React from 'react';
import styled from 'styled-components';

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
  width: ${props => props.width || '0%'};
`;

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

export default PollResults;