// src/pages/ChatbotPage.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Chatbot from '../components/chatbot/Chatbot';
import { checkHealth } from '../api/ChatbotApi';

const ChatbotPageContainer = styled.div`
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
`;

const StatusIndicator = styled.div`
    padding: 8px 15px;
    border-radius: 20px;
    display: inline-flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 14px;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.7);

    ${props => props.$isOnline
            ? `
      background-color: #e6f7e6;
      color: #2e7d32;
    `
            : `
      background-color: #ffebee;
      color: #c62828;
    `
    }
`;

const StatusDot = styled.span`
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;

    ${props => props.$isOnline
            ? `
      background-color: #4caf50;
    `
            : `
      background-color: #f44336;
    `
    }
`;

const InfoBox = styled.div`
    background-color: #35353e;
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 25px;
    color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

    p {
        font-size: 15px;
        line-height: 1.7;
        margin: 12px 0;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 300;
    }

    ul {
        margin: 14px 0;
        padding-left: 18px;
    }

    li {
        margin-bottom: 8px;
        position: relative;
        font-size: 14px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.8);

        &::before {
            content: '';
            position: absolute;
            left: -18px;
            top: 8px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
        }
    }
`;

const InfoTitle = styled.h3`
    color: white;
    font-weight: 600;
    font-size: 20px;
    margin-top: 0;
    margin-bottom: 16px;
    position: relative;
    padding-bottom: 10px;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%);
    }
`;

const ChatbotPage = () => {
    const [isServerOnline, setIsServerOnline] = useState(false);
    const [serverInfo, setServerInfo] = useState(null);

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const healthData = await checkHealth();
                setIsServerOnline(healthData.status === 'ok');
                setServerInfo(healthData);
            } catch (error) {
                setIsServerOnline(false);
            }
        };

        checkServerStatus();
    }, []);


    return (
        <ChatbotPageContainer>
            <StatusIndicator $isOnline={isServerOnline}>
                <StatusDot $isOnline={isServerOnline} />
                {isServerOnline ? '챗봇 서버가 온라인 상태입니다' : '챗봇 서버가 오프라인 상태입니다'}
            </StatusIndicator>

            <InfoBox>
                <InfoTitle>정치 정보 챗봇에 대하여</InfoTitle>
                <p>
                    이 챗봇은 후보자 정보, 정당 정책, 정치 관련 기사 등의 데이터를 활용하여 선거와 정치에 관한 질문에 답변합니다.
                    Elasticsearch 기반의 RAG(Retrieval-Augmented Generation) 기술을 사용하여 정확하고 최신의 정보를 제공합니다.
                </p>
                <p>
                    질문 예시:
                </p>
                <ul>
                    <li>이번 선거 투표 방법은 어떻게 되나요?</li>
                    <li>A당과 B당의 경제 정책 차이점은 무엇인가요?</li>
                    <li>OO 후보의 주요 공약은 무엇인가요?</li>
                    <li>비례대표제란 무엇인가요?</li>
                </ul>
            </InfoBox>

            <Chatbot />
        </ChatbotPageContainer>
    );
};

export default ChatbotPage;