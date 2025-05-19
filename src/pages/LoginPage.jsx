import React, { useEffect, useState } from 'react';
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
import personIcon from '../assets/images/person-icon.png';

// 카드 스타일 개선
const StyledCard = styled(Card)`
    max-width: 400px;
    width: 100%;
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    }
`;

// 제목 스타일 개선
const StyledTitle = styled(Title)`
    font-size: 28px;
    margin-bottom: 24px;
    text-align: center;
    color: #333;
    font-weight: 600;
`;

// 구글 로그인 버튼 스타일 개선
const GoogleButton = styled(Button)`
    background-color: #ffffff;
    color: #3c4043;
    border: 1px solid #dadce0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

    &:hover {
        background-color: #f5f5f5;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
`;

// 구글 로고 컴포넌트
const GoogleLogo = () => (
    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
);

// 앱 정보 스타일 개선
const AppInfo = styled.div`
    text-align: center;
    margin-bottom: 32px;
    color: #5f6368;
    font-size: 16px;
    line-height: 1.5;
`;

// 앱 로고 컴포넌트 추가
const AppLogo = styled.div`
    text-align: center;
    margin-bottom: 24px;
`;

const LogoImage = styled.img`
    width: 64px;
    height: 64px;
`;

// Flaticon 출처 표시
const Attribution = styled.div`
    font-size: 10px;
    color: #999;
    text-align: center;
    margin-top: 20px;
`;

// 로그인 컨테이너 스타일
const LoginContainer = styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
`;

// 에러 메시지 스타일 개선
const StyledErrorMessage = styled(ErrorMessage)`
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    background-color: rgba(211, 47, 47, 0.1);
    border-left: 4px solid #d32f2f;
`;

// 구글 버튼 컨테이너 스타일
const GoogleButtonContainer = styled.div`
    width: 100%;
    min-height: 48px;
    margin-bottom: 20px;
    display: block;
`;

const LoginPage = () => {
    const navigate = useNavigate();
    const { googleLogin, isLoading, error, clearError, isAuthenticated } = useAuthStore();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // 이미 로그인된 경우 홈으로 리다이렉트
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // 구글 스크립트 로드
    useEffect(() => {
        // 구글 스크립트가 이미 로드되었는지 확인
        if (window.google && window.google.accounts) {
            console.log("Google 스크립트가 이미 로드되어 있습니다.");
            setScriptLoaded(true);
            initializeGoogleButton();
            return;
        }

        // 스크립트가 이미 추가되었는지 확인
        const existingScript = document.getElementById('google-identity-script');
        if (existingScript) {
            console.log("Google 스크립트가 이미 추가되어 있습니다.");
            return;
        }

        console.log("Google 스크립트 로드 중...");
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-identity-script';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log("Google 스크립트 로드 완료");
            setScriptLoaded(true);
            initializeGoogleButton();
        };

        script.onerror = () => {
            console.error("Google 스크립트 로드 실패");
        };

        document.body.appendChild(script);

        // 컴포넌트 언마운트 시 스크립트 제거
        return () => {
            // 스크립트 제거는 필요한 경우에만 수행
        };
    }, []);

    // 구글 로그인 버튼 초기화
    const initializeGoogleButton = () => {
        if (!window.google || !window.google.accounts) {
            console.error("Google API가 로드되지 않았습니다.");
            return;
        }

        try {
            console.log("구글 버튼 초기화 중...");
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleGoogleCredentialResponse,
                ux_mode: 'popup',
                auto_select: false
            });

            // 버튼 렌더링
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
            console.log("구글 버튼 렌더링 완료");
        } catch (error) {
            console.error("구글 버튼 초기화 오류:", error);
        }
    };

    // 구글 로그인 응답 처리
    const handleGoogleCredentialResponse = async (response) => {
        if (response.credential) {
            console.log('구글 로그인 응답 수신:', response);
            try {
                const result = await googleLogin(response.credential);
                if (result.success) {
                    // 로그인 성공 처리
                    console.log('로그인 성공, 홈으로 이동');
                    navigate('/');
                } else {
                    console.error('로그인 실패:', result);
                }
            } catch (error) {
                console.error('로그인 처리 중 오류:', error);
            }
        } else {
            console.error('구글 자격 증명이 없습니다');
        }
    };

    return (
        <LoginContainer fullHeight={true}>
            <StyledCard>
                <AppLogo>
                    <LogoImage src={personIcon} alt="Person Icon" />
                </AppLogo>

                <StyledTitle>환영합니다</StyledTitle>

                <AppInfo>
                    구글 계정으로 간편하게 로그인하고<br />
                    다양한 서비스를 이용해보세요.
                </AppInfo>

                {/* 구글 버튼이 로드되지 않은 경우 커스텀 버튼 표시 */}
                {!scriptLoaded && (
                    <GoogleButton fullWidth type="button" disabled={true}>
                        <GoogleLogo />
                        구글 로그인 준비 중...
                    </GoogleButton>
                )}

                {/* 구글 로그인 버튼 컨테이너 */}
                <GoogleButtonContainer id="googleLoginButton" />

                {error && <StyledErrorMessage>{error}</StyledErrorMessage>}

                {isLoading && <LoadingSpinner />}
            </StyledCard>
        </LoginContainer>
    );
};

export default LoginPage;