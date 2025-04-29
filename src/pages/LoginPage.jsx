import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  Container, 
  Card, 
  Title, 
  Button, 
  ErrorMessage, 
  LoadingSpinner
} from '../components/common';
import styled from 'styled-components';

// 구글 로그인 버튼 스타일
const GoogleButton = styled(Button)`
  background-color: #ffffff;
  color: #757575;
  border: 1px solid #dddddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #cccccc;
  }
`;

// 구글 로고 컴포넌트
const GoogleLogo = () => (
  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const AppInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: #555;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { googleLogin, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 구글 로그인 처리
  // LoginPage.js의 handleGoogleLogin 함수 수정

const handleGoogleLogin = async () => {
    clearError();
    
    try {
      // Google Identity Services 스크립트가 로드되었는지 확인
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, // 환경변수 확인
          callback: handleGoogleCredentialResponse,
          ux_mode: 'popup',  // popup 모드 사용
          auto_select: false // 자동 선택 비활성화
        });
        
        // 명시적으로 버튼 렌더링
        window.google.accounts.id.renderButton(
          document.getElementById('googleLoginButton'),
          { 
            type: 'standard',
            theme: 'outline', 
            size: 'large', 
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%'
          }
        );
        
        // 원클릭 팝업 명시적 표시
        // window.google.accounts.id.prompt(); // 이 부분은 필요에 따라 주석 해제
      } else {
        console.error('Google Identity Services 스크립트가 로드되지 않았습니다.');
      }
    } catch (error) {
      console.error('구글 로그인 초기화 오류:', error);
    }
  };
  // 구글 로그인 응답 처리
  const handleGoogleCredentialResponse = async (response) => {
    if (response.credential) {
      const result = await googleLogin(response.credential);
      if (result.success) {
        navigate('/');
      }
    }
  };

  return (
    <Container fullHeight={true}>
      <Card>
        <Title>로그인</Title>
        
        <AppInfo>
          구글 계정으로 간편하게 로그인하고 서비스를 이용해보세요.
        </AppInfo>
        
        {/* 구글 로그인 버튼 */}
        <GoogleButton 
          fullWidth 
          type="button" 
          onClick={handleGoogleLogin}
          id="googleLoginButton"
        >
          <GoogleLogo />
          구글 계정으로 로그인
        </GoogleButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {isLoading && <LoadingSpinner />}
      </Card>
    </Container>
  );
};

export default LoginPage;