// src/components/mock-voting/NoTokenComponent.jsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// 스타일 컴포넌트들
const VoteCard = styled.div`
    background-color: #f0f0f3;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
    text-align: center;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
    color: #e74c3c;
    margin-bottom: 20px;
`;

const ErrorTitle = styled.h3`
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
`;

const ErrorMessage = styled.p`
    font-size: 16px;
    color: #555;
    margin-bottom: 30px;
    line-height: 1.6;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
`;

const Button = styled.button`
    padding: 12px 25px;
    border: none;
    border-radius: 10px;
    background-color: ${props => props.$primary ? '#0073e6' : '#e0e0e0'};
    color: ${props => props.$primary ? '#ffffff' : '#333333'};
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
        background-color: ${props => props.primary ? '#0060bf' : '#d0d0d0'};
    }

    &:active {
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
    }
`;

/**
 * 토큰이 없는 사용자를 위한 컴포넌트
 */
const NoTokenComponent = ({ errorMessage, onBackClick, onShowStatsClick }) => {
    const navigate = useNavigate();

    const handleConnectWallet = () => {
        navigate('/'); // 홈으로 이동 (헤더에서 지갑 연결할 수 있도록)
    };

    return (
        <VoteCard>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>투표에 필요한 토큰이 부족합니다</ErrorTitle>
            <ErrorMessage>
                {errorMessage || '모의투표에 참여하려면 최소 1개의 토큰이 필요합니다. 지갑을 연결하고 토큰을 받으세요.'}
            </ErrorMessage>
            <ErrorMessage>
                참고: 토큰은 계정당 최초 1회만 발급됩니다.
            </ErrorMessage>
            <ButtonGroup>
                <Button onClick={onBackClick}>
                    모의투표 목록으로
                </Button>

                {/* 투표 통계 보기 버튼 추가 */}
                <Button onClick={onShowStatsClick}>
                    투표 통계 보기
                </Button>
            </ButtonGroup>
        </VoteCard>
    );
};

export default NoTokenComponent;