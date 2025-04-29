import styled from 'styled-components';

// 버튼 컴포넌트
export const Button = styled.button.attrs(props => ({
    // 여기서 DOM에 전달할 속성들만 지정
    type: props.type || 'button'
  }))`
    background-color: ${(props) => (props.secondary ? '#ffffff' : '#1877f2')};
    color: ${(props) => (props.secondary ? '#1877f2' : '#ffffff')};
    padding: 10px 15px;
    border-radius: 5px;
    border: ${(props) => (props.secondary ? '1px solid #1877f2' : 'none')};
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: ${(props) => (props.fullWidth ? '100%' : 'auto')};
    margin: 5px 0;
    
    &:hover {
      background-color: ${(props) => (props.secondary ? '#f0f2f5' : '#166fe5')};
    }
    
    &:disabled {
      background-color: #e4e6eb;
      color: #bcc0c4;
      cursor: not-allowed;
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
    border-color: #1877f2;
  }
`;

// 폼 컴포넌트
export const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

// 컨테이너 컴포넌트
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${(props) => (props.fullHeight ? '100vh' : 'auto')};
  padding: 20px;
`;

// 카드 컴포넌트
export const Card = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 500px;
`;

// 제목 컴포넌트
export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

// 서브타이틀 컴포넌트
export const Subtitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 15px;
`;

// 에러 메시지 컴포넌트
export const ErrorMessage = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 10px;
`;

// 링크 컴포넌트
export const Link = styled.a`
  color: #1877f2;
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

// 로딩 인디케이터 컴포넌트
export const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1877f2;
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

// 플렉스 컨테이너
export const Flex = styled.div`
  display: flex;
  flex-direction: ${(props) => props.direction || 'row'};
  justify-content: ${(props) => props.justify || 'flex-start'};
  align-items: ${(props) => props.align || 'stretch'};
  flex-wrap: ${(props) => props.wrap || 'nowrap'};
  gap: ${(props) => props.gap || '0'};
  width: ${(props) => props.width || 'auto'};
`;