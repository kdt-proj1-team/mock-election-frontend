// src/components/chat/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { connectWebSocket, disconnectWebSocket, sendMessage, fetchChatHistory } from '../../services/websocketService';
import useChatStore from '../../store/chatStore';

function Chat() {
    const { messages, activeRoom, nickname, connected, addMessage, setMessages, setConnected } = useChatStore();
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    // 컴포넌트 마운트 시 WebSocket 연결 및 이전 메시지 로드
    useEffect(() => {
        // 채팅 기록 로드
        const loadChatHistory = async () => {
            const history = await fetchChatHistory(activeRoom);
            setMessages(history);
        };

        loadChatHistory();

        // WebSocket 연결 설정
        const cleanup = connectWebSocket(
            nickname,
            activeRoom,
            (receivedMessage) => {
                addMessage(receivedMessage);
            },
            (isConnected) => {
                setConnected(isConnected);
            }
        );

        // 컴포넌트 언마운트 시 연결 해제
        return () => {
            cleanup();
        };
    }, [activeRoom, nickname, addMessage, setMessages, setConnected]);

    // 메시지 목록이 변경될 때마다 스크롤 최하단으로 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 메시지 전송 버튼 클릭 시 실행되는 함수
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!messageInput.trim()) return;

        const chatMessage = {
            type: 'CHAT',
            roomId: activeRoom,
            sender: nickname,
            content: messageInput,
            isIcon: false,
            timestamp: new Date()
        };

        sendMessage(chatMessage);
        setMessageInput('');
    };

    // 아이콘 클릭 시 아이콘 메시지를 전송하는 함수
    const handleSendIcon = (icon) => {
        const chatMessage = {
            type: 'CHAT',
            roomId: activeRoom,
            sender: nickname,
            content: icon,
            isIcon: true,
            timestamp: new Date()
        };

        sendMessage(chatMessage);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{activeRoom === 'policy' ? '정책 토론' : '자유 주제'}</h2>
                <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                    {connected ? '연결됨' : '연결 끊김'}
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === nickname ? 'my-message' : ''}`}>
                        <div className="message-header">
                            <span className="sender">{msg.sender}</span>
                            <span className="time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
                        </div>
                        {msg.isIcon ? (
                            <div className="icon-content">{msg.content}</div>
                        ) : (
                            <div className="text-content">{msg.content}</div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-form">
                <form onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        disabled={!connected}
                    />
                    <button type="submit" disabled={!connected}>전송</button>
                </form>
                <div className="icon-panel">
                    <button onClick={() => handleSendIcon('👍')} disabled={!connected}>👍</button>
                    <button onClick={() => handleSendIcon('❤️')} disabled={!connected}>❤️</button>
                    <button onClick={() => handleSendIcon('😊')} disabled={!connected}>😊</button>
                    <button onClick={() => handleSendIcon('👋')} disabled={!connected}>👋</button>
                    <button onClick={() => handleSendIcon('🎉')} disabled={!connected}>🎉</button>
                </div>
            </div>
        </div>
    );
}

export default Chat;