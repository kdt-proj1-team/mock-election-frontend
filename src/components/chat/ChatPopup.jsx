import React, {useState, useEffect, useRef} from 'react';
import {FaComments, FaUsers, FaTimes } from 'react-icons/fa';
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
        // width: '350px',
        // height: '450px',
        width: '80vw',
        height: '70vh',
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
    headerButtons: {
        display: 'flex',
        alignItems: 'center',
    },
    iconButton: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#666',
        transition: 'color 0.2s',
        marginLeft: '15px',
    },
    iconButtonHover: {
        color: '#000',
    },
    chatContent: {
        display: 'flex',
        flex: 1,
        height: 'calc(100% - 70px)',
    },
    roomList: {
        width: '25%',
        borderRight: '1px solid #eee',
        overflowY: 'auto',
        padding: '8px',
    },
    roomItem: {
        padding: '10px',
        margin: '4px 0',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.2s',
    },
    activeRoom: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
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
    },
    // 참여자 패널 스타일
    participantsPanel: {
        width: '25%',
        borderLeft: '1px solid #eee',
        padding: '10px',
        overflowY: 'auto',
    },
    participantsHeader: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#555',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px',
    },
    participantItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #f5f5f5',
    },
    participantIcon: {
        fontSize: '16px',
        marginRight: '8px',
        color: '#666',
    },
    participantName: {
        fontSize: '14px',
    },
    participantRole: {
        fontSize: '11px',
        color: '#999',
        marginLeft: '5px',
    },
};

export default function ChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [chatrooms, setChatrooms] = useState([]);
    const [connected, setConnected] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [isHovering, setIsHovering] = useState({
        button : false,
        close : false,
        send : false,
        input : false
    });

    // 임시 참여자 데이터 (실제로는 API에서 가져와야 함)
    const [participants, SetParticipants] = useState([
        {id:1, name:'홍길동', role: 'admin'},
        { id: 2, name: '김철수', role: 'user' },
        { id: 3, name: '이영희', role: 'user' },
        { id: 4, name: '박지민', role: 'user' },
        { id: 5, name: '최영수', role: 'user' },
    ]);

    const stompClientRef = useRef(null); // useRef로 stompClient 참조 관리
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const subscriptionRef = useRef(null);

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


    // 채팅방 목록 로드
    useEffect(() => {
        const loadChatRooms = async () => {
            try{

                // 실제로는 API를 호출해야 함
                const rooms = await chatAPI.getChatrooms();

                // const rooms = [
                //     { id: 1, name: '정책 토론', createdAt: '2025-05-08 11:21:21' },
                //     { id: 2, name: '자유 주제', createdAt: '2025-05-08 11:21:31' }
                // ];
                setChatrooms(rooms);

                // 첫 번째 채팅방을 기본 선택
                if (rooms.length > 0 && !activeRoom){
                    setActiveRoom(rooms[0].id);
                }

            }catch (error) {
                console.log('채팅방 목록 로드 오류 : ', error);
            }
        };

        if(isOpen){
            loadChatRooms();
        }
    }, [isOpen]);

    // WebSocket 연결
    useEffect(() => {

        // 웹소켓 연결 함수
        const connect = () => {

            // chatAPI를 사용하여 Stomp 클라이언트 생성
            const client = chatAPI.createStompClient();

            client.onConnect = () => {
                setConnected(true);
                console.log('Connected to Websocket');

                // 활성 채팅방이 있으면 바로 구독
                if (activeRoom){
                    subscribeToRoom(client, activeRoom);
                }
            };

            client.onDisconnect = () => {
                setConnected(false);
                console.log('Disconnected from Websocket');
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
                    if(subscriptionRef.current){
                        subscriptionRef.current.unsubscribe();
                    }
                    stompClientRef.current.deactivate();
                }catch (error){
                    console.error("Error disconnecting WebSocket:", error);
                }
                stompClientRef.current = null;
            }
        };
    }, [isOpen]); // 빈 배열을 넣어 한 번만 실행되도록 수정

    // 채팅방 변경 시 구독 변경
    useEffect(() => {
        if (connected && stompClientRef.current && activeRoom){
            // 채팅 히스토리 로드
            fetchChatHistory(activeRoom);
            // 채팅방 구독
            subscribeToRoom(stompClientRef.current, activeRoom);
        }
    }, [activeRoom, connected]);

    // 채팅방 구독 함수
    const subscribeToRoom = (client, roomId) => {
        // 기존 구독 해제
        if (subscriptionRef.current){
            subscriptionRef.current.unsubscribe();
        }

        // 새 채팅방 구독
        subscriptionRef.current = chatAPI.subscribeToMessages(
            client,
            roomId,
            (receivedMessage) => {
                setMessages(prev => [...prev, receivedMessage]);
            }
        );
    }

    // 채팅 기록 조회
    const fetchChatHistory = async (roomId) => {
        try {
            // 실제로는 roomId를 포함한 API 호출 필요
            const data = await chatAPI.getChatHistory(roomId);
            console.log("받아온 채팅 기록 : " + data);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }

    // 채팅방 선택 핸들러
    const handleRoomSelect = (roomId) => {
        if (roomId === activeRoom) return;
        setActiveRoom(roomId);
    }

    // 참여자 패널 토글 핸들러
    const toggleParticipantsPanel = () => {
        setShowParticipants(!showParticipants);
    };


    //메세지 전송 핸들러
    const handleSendMessage = (e) => {
        if (e) {
            e.preventDefault(); // e가 존재할 때만 preventDefault 호출
        }

        if (!message.trim() || !activeRoom) return;

        const client = stompClientRef.current;
        if (!client) {
            console.warn('WebSocket not connected yet.');
            return;
        }

        // 현재 활성 채팅방 ID로 메시지 전송
        chatAPI.sendMessage(
            client,
            message,
            userId,
            nickname,
            activeRoom
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

    // 현재 활성 채팅방 정보 가져오기
    const getCurrentRoom = () => {
        return chatrooms.find(room => room.id === activeRoom) || {};
    }

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
                    {/* 채팅 헤더 */}
                    <div style={styles.chatHeader}>
                        <h3 style={styles.chatTitle}>실시간 채팅</h3>
                        <div style={styles.headerButtons}>
                            {/* 참여자 목록 버튼 */}
                            <button
                                style={{
                                    ...styles.iconButton,
                                    ...(isHovering.users ? styles.iconButtonHover : {})
                                }}
                                onClick={toggleParticipantsPanel}
                                onMouseEnter={() => setIsHovering({...isHovering, users:true})}
                                onMouseLeave={() => setIsHovering({...isHovering, users:false})}
                                title="참여자 목록"
                            >
                                <FaUsers></FaUsers>
                            </button>
                            {/* 닫기 버튼  */}
                            <button
                                style={{
                                    ...styles.closeButton,
                                    ...(isHovering.close ? styles.closeButtonHover : {})
                                }}
                                onClick={() => setIsOpen(!isOpen)}
                                onMouseEnter={() => setIsHovering({...isHovering, close: true})}
                                onMouseLeave={() => setIsHovering({...isHovering, close: false})}
                            >
                                ✖
                            </button>
                        </div>

                    </div>


                    {/* 채팅 콘텐츠 영역 */}
                    <div style={styles.chatContent}>

                        {/* 채팅방 목록 */}
                        <div style={styles.roomList}>
                            {chatrooms.map(room => (
                                <div
                                    key={room.id}
                                    style={{
                                        ...styles.roomItem,
                                        ...(activeRoom === room.id? styles.activeRoom : {})
                                    }}
                                    onClick={() => handleRoomSelect(room.id)}
                                >
                                    {room.name}
                                </div>
                            ))}
                        </div>

                        {/* 메시지 영역 */}
                        <div style={styles.messages}>
                            {activeRoom ? (
                                messages.length === 0 ? (
                                    <div style={styles.emptyStateMessage}>
                                        아직 메시지가 없습니다. 첫 메시지를 보내보세요!
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={idx} style={styles.messageItem}>
                                            <div style={styles.messageHeader}>
                                                <span style={styles.nickname}>{msg.sender_nickname || '익명'}</span>
                                                <span style={styles.time}>
                                                    {new Date(msg.sentAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div style={styles.content}>{msg.content}</div>
                                        </div>
                                    ))
                                )
                            ) : (
                                // 채팅방을 선택하지 않았을 때 안내 메시지
                                <div style={styles.emptyStateMessage}>
                                    채팅방을 선택해주세요.
                                </div>
                            )}

                            {/* 스크롤 위치를 위한 참조 */}
                            <div ref={messagesEndRef}></div>
                        </div>

                        {/* 참여자 패널 (조건부 렌더링) */}
                        {showParticipants && (
                            <div style={styles.participantsPanel}>
                                <div style={styles.participantsHeader}>
                                    참여자 ({participants.length})
                                </div>
                                {participants.map(participant => (
                                    <div key={participant.id} style={styles.participantItem}>
                                        <span style={styles.participantIcon}>👤</span>
                                        <span style={styles.participantName}>
                                            {participant.name}
                                            {participant.role === 'admin' && (
                                                <span style={styles.participantRole}>(관리자)</span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}





                        {/* 메시지 입력 영역 */}
                        <div>
                            <form onSubmit={handleSendMessage} style={styles.inputContainer}>
                                <input
                                    type="text"
                                    placeholder={activeRoom ? "메시지를 입력하세요" : "채팅방을 선택해주세요"}
                                    style={styles.input}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={!connected || !activeRoom}
                                    ref={inputRef}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        ...styles.sendButton,
                                        ...(isHovering.send ? styles.sendButtonHover : {})
                                    }}
                                    onMouseEnter={() => setIsHovering({...isHovering, send: true})}
                                    onMouseLeave={() => setIsHovering({...isHovering, send: false})}
                                    disabled={!connected || !activeRoom || !message.trim()}
                                >
                                    전송
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

            )}
        </>
    );
}