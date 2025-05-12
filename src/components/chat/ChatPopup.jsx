import React, {useState, useEffect, useRef} from 'react';
import {FaComments} from 'react-icons/fa';
import {chatAPI} from '../../api/ChatApi';


// 애니메이션을 위한 keyframes
const keyframesStyle = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styles = {
    toggleButton: {
        position: 'fixed',
        bottom: '30px',
        right: '110px',
        background: '#555',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '70px',
        height: '70px',
        fontSize: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        transition: 'background 0.2s, transform 0.2s',
    },
    toggleButtonHover: {
        background: '#333',
        transform: 'scale(1.05)',
    },
    chatBox: {
        position: 'fixed',
        bottom: '110px',
        right: '120px',
        width: '350px',
        height: '450px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        border: '1px solid #eee',
        animation: 'slideIn 0.3s forwards',
    },
    chatHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        padding: '0 0 10px 0',
        borderBottom: '1px solid #eee',
    },
    chatTitle: {
        margin: 0,
        fontSize: '18px',
        color: '#333',
        fontWeight: 600,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#666',
        transition: 'color 0.2s',
    },
    closeButtonHover: {
        color: '#000',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        fontSize: '14px',
        color: '#333',
        marginBottom: '12px',
        padding: '5px',
    },
    messageItem: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '12px',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: '#f8f8f8',
    },
    messageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
    },
    nickname: {
        fontWeight: 'bold',
        fontSize: '13px',
        color: '#555',
    },
    time: {
        fontSize: '11px',
        color: '#999',
    },
    content: {
        margin: '3px 0',
        wordBreak: 'break-word',
        fontSize: '14px',
        lineHeight: '1.4',
    },
    inputContainer: {
        display: 'flex',
        borderTop: '1px solid #eee',
        paddingTop: '12px',
    },
    input: {
        flex: 1,
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    inputFocus: {
        borderColor: '#555',
    },
    sendButton: {
        background: '#555',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0 15px',
        marginLeft: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    sendButtonHover: {
        background: '#333',
    },
    emptyStateMessage: {
        textAlign: 'center',
        color: '#999',
        marginTop: '20px',
        fontSize: '14px',
    }
};

export default function ChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [isHovering, setIsHovering] = useState({
        button : false,
        close : false,
        send : false,
        input : false
    });

    const stompClientRef = useRef(null); // useRef로 stompClient 참조 관리
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

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

    // 팝업이 열릴 때 입력 필드에 포커스
    useEffect(() => {
        if(isOpen){
            setTimeout(()=>{
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

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

        // chatAPI를 사용하여 메시지 전송
        chatAPI.sendMessage(
            client,
            message,
            userId,
            nickname
        );

        setMessage('');

        // 포커스 유지
        inputRef.current?.focus();
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
            {/* 애니메이션을 위한 style 태그 추가 */}
            <style>{keyframesStyle}</style>

            {/* 채팅 버튼 */}
            <button
                style={{
                    ...styles.toggleButton,
                    ...(isHovering.button ? styles.toggleButtonHover : {})
                }}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovering({...isHovering, button: true})}
                onMouseLeave={() => setIsHovering({...isHovering, button:false})}
                title={isOpen ? '채팅 닫기' : '채팅 열기'}
            >
                <FaComments/>
            </button>

            {/* 채팅 팝업 */}
            {isOpen && (
                <div style={styles.chatBox}>
                    <div style={styles.chatHeader}>
                        <h3 style={styles.chatTitle}>실시간 채팅</h3>
                        <button
                            style={{
                                ...styles.closeButton,
                                ...(isHovering.close ? styles.closeButtonHover : {})
                            }}
                            onClick={() => setIsHovering({...setIsHovering, close:true})}
                            onMouseEnter={() => setIsHovering({...isHovering, close: true})}
                            onMouseLeave={() => setIsHovering({...isHovering, close: false})}
                        >
                            ✖
                        </button>
                    </div>
                    
                    
                    
                    <div style={styles.messages}>
                        {messages.length === 0 ? (
                            <div style={styles.emptyStateMessage}>
                                아직 메시지가 없습니다. 첫 메시지를 보내보세요!
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} style={styles.messageItem}>
                                    <div style={styles.messageHeader}>
                                        <span style={styles.nickname}>{msg.sender_nickname || '익명'}</span>
                                        <span style={styles.time}>
                                            {/*{formatTime(msg.sentAt)}*/}
                                            {new Date(msg.sentAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={styles.content}>{msg.content}</div>
                                </div>
                            ))
                        )}

                        {/* 스크롤 위치를 위한 참조 */}
                        <div ref={messagesEndRef}></div>
                    </div>
                    <div>
                        <form onSubmit={handleSendMessage} style={styles.inputContainer}>
                            <input
                                type="text"
                                placeholder="메시지를 입력하세요"
                                style={styles.input}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!connected}
                            />
                            <button
                                type="submit"
                                style={{
                                    ...styles.sendButton,
                                    ...(isHovering.send ? styles.sendButtonHover : {})
                                }}
                                onMouseEnter={() => setIsHovering({...isHovering, send: true})}
                                onMouseLeave={() => setIsHovering({...isHovering, send: false})}
                                disabled={!connected || !message.trim()}
                            >
                                전송
                            </button>
                        </form>
                    </div>
                </div>

            )}
        </>
    );
}