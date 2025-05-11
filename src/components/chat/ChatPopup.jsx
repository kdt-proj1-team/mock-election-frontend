import React, {useState, useEffect, useRef} from 'react';
import {FaComments} from 'react-icons/fa';
import {chatAPI} from '../../api/ChatApi';

const styles = {
    toggleButton: {
        position: 'fixed',
        bottom: '30px',
        right: '110px',
        background: '#555', // 중간 회색
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
    },
    chatBox: {
        position: 'fixed',
        bottom: '110px',
        right: '120px',
        width: '300px',
        maxHeight: '400px',
        background: '#fff', // 흰색 배경
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        border: '1px solid #ccc', // 얇은 회색 테두리
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        fontSize: '13px',
        color: '#333', // 어두운 회색 텍스트
        marginBottom: '8px',
    },
    messageItem: {
        display: 'flex',
        marginBottom: '8px',
        padding: '5px',
        borderBottom: '1px solid #eee',
    },
    input: {
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #aaa', // 중간 회색 테두리
        fontSize: '13px',
        outline: 'none',
        color: '#000', // 검정 텍스트
    },
    nickname: {
        fontWeight: 'bold',
        fontSize: '12px',
    },
    content: {
        margin: '3px 0',
        wordBreak: 'break-word',
    },
    time: {
        fontSize: '10px',
        color: '#999',
        textAlign: 'right',
    }
};

export default function ChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const stompClientRef = useRef(null); // useRef로 stompClient 참조 관리
    const messagesEndRef = useRef(null);

    // 사용자 정보 가져오기
    const userId = localStorage.getItem("userId"); 
    const nickname = localStorage.getItem("nickname"); 

    // 스크롤을 최하단으로 이동하는 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior : 'smooth' });
    }

    // 메시지가 업데이트될 때마다 스크롤 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Connect to WebSocket on component mount
    useEffect(() => {

        // 웹소켓 연결 함수
        const connect = () => {

            // chatAPI를 사용하여 Stomp 클라이언트 생성
            const client = chatAPI.createStompClient();

            client.onConnect = () => {
                setConnected(true);
                console.log('Connected to Websocket');

                // chatAPI를 사용하여 메시지 구독
                chatAPI.subscribeToMessages(client, (receivedMessage) => {
                    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
                });

                // 채팅 기록 가져오기
                fetchChatHistory();
            };

            client.onDisconnect = () => {
                setConnected(false);
                console.log('Disconnected from fucking Websocket');
            };


            client.activate();
            stompClientRef.current = client;

        };

        // 연결 실행
        connect();

        // 컴포넌트 언마운트 시 연결 해제
        return () => {
            if (stompClientRef.current) {
                try{
                    stompClientRef.current.deactivate();
                }catch (error){
                    console.error("Error disconnecting WebSocket:", error);
                }
                stompClientRef.current = null;
            }
        };
    }, []); // 빈 배열을 넣어 한 번만 실행되도록 수정

    const fetchChatHistory = async () => {
        try {
            const data = await chatAPI.getChatHistory();
            console.log("받아온 채팅 기록 : " + data);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }

    //메세지 전송 핸들러
    const handleSendMessage = (e) => {
        if (e) {
            e.preventDefault(); // e가 존재할 때만 preventDefault 호출
        }

        if (!message.trim()) return;

        const client = stompClientRef.current;
        if (!client) {
            console.warn('WebSocket not connected yet.');
            return;
        }

        // 메시지 객체 생성
        // const chatMessage = {
        //     type: 'text',
        //     content: message,
        //     userId: userId,
        //     sender_nickname: nickname,
        //     chatroomId: 1,
        //     sentAt: new Date()
        // };

        // 로컬에 즉시 반영 (화면에 바로 표시)
        // setMessages(prevMessages => [...prevMessages, chatMessage]);


        // chatAPI를 사용하여 메시지 전송
        chatAPI.sendMessage(
            client,
            message,
            userId,
            nickname
        );

        setMessage('');
    };

    // Enter 키 입력 핸들러 - 별도로 분리
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 방지
            handleSendMessage(e);
        }
    };

    return (
        <>
            {/* 채팅 버튼 */}
            <button
                style={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? '채팅 닫기' : '채팅 열기'}
            >
                <FaComments/>
            </button>

            {/* 채팅 팝업 */}
            {isOpen && (
                <div style={styles.chatBox}>
                    <div style={styles.messages}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={styles.messageItem}>
                                <div style={styles.nickname}>{msg.sender_nickname}</div>
                                <div style={styles.content}>{msg.content}</div>
                                <div style={styles.time}>
                                    {new Date(msg.sentAt).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        {/* 스크롤 위치를 위한 참조 */}
                        <div ref={messagesEndRef}></div>
                    </div>
                    <div>
                        <form onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="메시지를 입력하세요"
                                style={styles.input}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!connected}
                            />
                        </form>
                    </div>
                </div>

            )}
        </>
    );
}