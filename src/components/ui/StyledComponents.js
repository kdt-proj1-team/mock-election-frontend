import styled from 'styled-components';

// 공통 섹션 컴포넌트
export const Section = styled.section`
  padding: 60px 0;
  ${props => props.background && `background: ${props.background};`}
  ${props => props.color && `color: ${props.color};`}
`;

// 컨테이너 컴포넌트
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

// 제목 컴포넌트
export const Title = styled.h2`
  text-align: center;
  margin-bottom: 40px;
  font-size: 36px;
  color: #333333;
`;

// 버튼 컴포넌트
export const Button = styled.button`
  padding: ${props => props.small ? '8px 16px' : '12px 24px'};
  font-size: ${props => props.small ? '14px' : '16px'};
  font-weight: 600;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  background-color: ${props => {
    if (props.disabled) return '#aaaaaa';
    if (props.primary) return '#333333';
    if (props.secondary) return '#666666';
    if (props.accent) return '#999999';
    return '#333333';
  }};
  
  color: ${props => {
    if (props.accent) return '#222222';
    return 'white';
  }};
  
  &:hover {
    background-color: ${props => {
      if (props.disabled) return '#aaaaaa';
      if (props.primary) return '#222222';
      if (props.secondary) return '#555555';
      if (props.accent) return '#888888';
      return '#222222';
    }};
  }
`;

// 입력 필드 컴포넌트
export const Input = styled.input`
  width: 100%;
  padding: 10px 15px;
  border-radius: 5px;
  border: 1px solid #dddfe2;
  font-size: 16px;
  margin-bottom: 10px;
  
  &:focus {
    outline: none;
    border-color: #333333;
  }
`;

// 카드 컴포넌트
export const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  padding: ${props => props.padding || '0'};
  margin-bottom: ${props => props.marginBottom || '0'};
`;

// 플렉스 컨테이너
export const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  gap: ${props => props.gap || '0'};
  width: ${props => props.width || 'auto'};
`;

// 오류 메시지 컴포넌트
export const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 10px;
`;

// 로딩 인디케이터 컴포넌트
export const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #333333;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;