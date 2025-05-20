// src/components/chatbot/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { sendMessage } from '../../api/ChatbotApi';
import './Chatbot.css';

const ChatbotContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    max-width: 1000px;
    margin: 20px auto;
    border-radius: 15px;
    overflow: hidden;
    background-color: #f0f0f3;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.7);
`;

const ChatHeader = styled.div`
    padding: 20px;
    background-color: #f0f0f3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ChatTitle = styled.h2`
    margin: 0;
    color: #333;
    font-weight: 600;
`;

const ChatOptions = styled.div`
    display: flex;
    gap: 10px;
`;

const OptionButton = styled.button`
    background-color: transparent;
    border: none;
    color: #555;
    font-size: 14px;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
`;

const ChatMessages = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    scrollbar-width: thin;
    scrollbar-color: #d0d0d5 #f0f0f3;
`;

const MessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    animation: ${props => props.$isUser ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out forwards;
    max-width: 85%;
    ${props => props.$isUser ? 'margin-left: auto;' : 'margin-right: auto;'}
`;

const MessageBubble = styled.div`
    max-width: 100%;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
    position: relative;
    margin-bottom: 3px;
    white-space: pre-wrap;
    word-break: break-word;

    ${props => props.$isUser ? `
    background-color: #e0e0e3;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
    color: #333;
    border-bottom-right-radius: 4px;
  ` : `
    background-color: #ffffff;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.7);
    color: #333;
    border-bottom-left-radius: 4px;
  `}
`;

const TimestampText = styled.span`
    font-size: 10px;
    color: #888;
    margin-left: ${props => props.$isUser ? 'auto' : '0'};
    margin-right: ${props => props.$isUser ? '0' : 'auto'};
    display: block;
`;

const SourcesContainer = styled.div`
    margin-top: 5px;
    font-size: 12px;
    color: #666;
    padding-left: 5px;
    max-width: 100%;
`;

const SourceItem = styled.div`
    margin-left: 10px;
    margin-top: 2px;
`;

const InputContainer = styled.div`
    display: flex;
    padding: 15px;
    background-color: #f0f0f3;
    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.05);
`;

const MessageInput = styled.input`
    flex: 1;
    padding: 12px 15px;
    border-radius: 24px;
    border: none;
    font-size: 14px;
    outline: none;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.7);
    background-color: #f0f0f3;

    &:focus {
        box-shadow: inset 3px 3px 7px rgba(0, 0, 0, 0.15), inset -3px -3px 7px rgba(255, 255, 255, 0.9);
    }
`;

const SendButton = styled.button`
    margin-left: 10px;
    padding: 0 20px;
    border-radius: 24px;
    border: none;
    background-color: #e0e0e3;
    color: #333;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1), -2px -2px 6px rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
        background-color: #d5d5d8;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15), -2px -2px 6px rgba(255, 255, 255, 0.9);
    }

    &:active {
        box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.45), inset -1px -1px 3px rgba(255, 255, 255, 0.6);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TypingIndicator = styled.div`
    align-self: flex-start;
    padding: 10px 16px;
    border-radius: 18px;
    background-color: #f8f8f8;
    margin-bottom: 10px;
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.7);
    border-bottom-left-radius: 4px;

    span {
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #bbb;
        border-radius: 50%;
        animation: typing 1s infinite ease-in-out;
        margin: 0 2px;

        &:nth-child(1) {
            animation-delay: 0s;
        }

        &:nth-child(2) {
            animation-delay: 0.2s;
        }

        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
`;

// 예시 질문 컴포넌트
const SuggestedQuestions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 15px;
`;

const QuestionChip = styled.button`
    padding: 6px 12px;
    background-color: #f0f0f3;
    border: none;
    border-radius: 16px;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1), -2px -2px 5px rgba(255, 255, 255, 0.7);
    transition: all 0.2s;

    &:hover {
        box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.15), -3px -3px 6px rgba(255, 255, 255, 0.9);
    }

    &:active {
        box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.45), inset -1px -1px 3px rgba(255, 255, 255, 0.6);
    }
`;

const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);

    // 예시 질문들 (수정된 버전)
    const suggestedQuestions = [
        "이번 대선 후보는 누구야?",
        "여행가서 투표할 수 있어?",
        "국민의당 공약을 알려줘",
        "더불어민주당 경제 정책은?",
        "사전투표는 어떻게 하나요?"
    ];

    // 초기 메시지 설정 (수정된 버전)
    useEffect(() => {
        const initialMessage = {
            id: Date.now(),
            text: '안녕하세요! 선견지표 챗봇입니다. 대한민국 정치 정보에 대해 궁금하신 것을 물어보세요. 선거, 후보자, 정당 정책, 투표 방법 등에 대해 답변드릴 수 있습니다.',
            isUser: false,
            timestamp: new Date()
        };
        setMessages([initialMessage]);

        // 세션 ID 생성
        setSessionId(`session_${Date.now()}`);
    }, []);

    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (text = inputText) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: text,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputText('');
        setIsLoading(true);
        setShowSuggestions(false); // 질문 후에는 추천 질문 숨기기

        try {
            const response = await sendMessage(text, sessionId);

            const botMessage = {
                id: Date.now() + 1,
                text: response.answer, // 서버 응답 구조에 맞게 변경됨
                isUser: false,
                timestamp: new Date(),
                sources: response.sources || []
            };

            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: '죄송합니다. 메시지를 처리하는 동안 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    // 대화 내용 초기화
    const clearChat = () => {
        if (window.confirm('대화 내용을 모두 지우시겠습니까?')) {
            const initialMessage = {
                id: Date.now(),
                text: '안녕하세요! 선견지표 챗봇입니다. 대한민국 정치 정보에 대해 궁금하신 것을 물어보세요. 선거, 후보자, 정당 정책, 투표 방법 등에 대해 답변드릴 수 있습니다.',
                isUser: false,
                timestamp: new Date()
            };
            setMessages([initialMessage]);
            setSessionId(`session_${Date.now()}`);
            setShowSuggestions(true);
        }
    };

    // 추천 질문 클릭
    const handleSuggestedQuestion = (question) => {
        handleSendMessage(question);
    };

    return (
        <ChatbotContainer>
            <ChatHeader>
                <ChatTitle>선견지표 정치 정보 챗봇</ChatTitle>
                <ChatOptions>
                    <OptionButton onClick={clearChat}>대화 초기화</OptionButton>
                </ChatOptions>
            </ChatHeader>

            <ChatMessages className="chatbot-messages">
                {messages.map(message => (
                    <MessageContainer
                        key={message.id}
                        $isUser={message.isUser}
                        className={message.isUser ? 'user-message-container' : 'bot-message-container'}
                    >
                        <MessageBubble
                            $isUser={message.isUser}
                            className={message.isUser ? 'user-message' : 'bot-message'}
                        >
                            {message.text}
                        </MessageBubble>
                        <TimestampText $isUser={message.isUser}>
                            {formatTimestamp(message.timestamp)}
                        </TimestampText>

                        {!message.isUser && message.sources && message.sources.length > 0 && (
                            <SourcesContainer>
                                <div>출처:</div>
                                {message.sources.map((source, i) => (
                                    <SourceItem key={i}>
                                        - {source.name ? source.name :
                                        source.jd_name ? source.jd_name :
                                            source.party_name ? source.party_name :
                                                source.title ? source.title :
                                                    '정치 정보 데이터베이스'}
                                    </SourceItem>
                                ))}
                            </SourcesContainer>
                        )}
                    </MessageContainer>
                ))}

                {showSuggestions && messages.length === 1 && (
                    <SuggestedQuestions>
                        {suggestedQuestions.map((question, index) => (
                            <QuestionChip
                                key={index}
                                onClick={() => handleSuggestedQuestion(question)}
                            >
                                {question}
                            </QuestionChip>
                        ))}
                    </SuggestedQuestions>
                )}

                {isLoading && (
                    <MessageContainer $isUser={false}>
                        <TypingIndicator>
                            <span></span>
                            <span></span>
                            <span></span>
                        </TypingIndicator>
                    </MessageContainer>
                )}

                <div ref={messagesEndRef} />
            </ChatMessages>

            <InputContainer>
                <MessageInput
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                />
                <SendButton onClick={() => handleSendMessage()} disabled={isLoading || !inputText.trim()}>
                    전송
                </SendButton>
            </InputContainer>
        </ChatbotContainer>
    );
};

export default Chatbot;