import axios from 'axios';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost/api/chat',
    header : {
        'Content-Type' : 'application/json',
    },
    withCredentials : true // CORS 요청 시 자격 증명 정보 포함
});

// 요청 인터셉터 - 토큰이 있으면 헤더에 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - CORS 오류 로깅
api.interceptors.response.use(
    response => response,
    error => {
        if(error.response){
            console.log('API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('API Error Request:', error.request);
            // CORS 오류일 가능성이 높음
            if (error.message && error.message.includes('Network Error')) {
                console.log('Possible CORS issue');
            }
        } else {
            console.log('API Error Message:', error.message);
        }
        return Promise.reject(error);
    }
);

// WebSocket 클라이언트 생성 함수
const createStompClient = () => {
    const token = localStorage.getItem('token');

    const socket = new SockJS('http://localhost/ws', null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        withCredentials: false
    });

    const stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: token ? `Bearer ${token}` : ''
        },
        debug: (str) => {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    return stompClient;
};

export const chatAPI = {
    // 채팅 히스토리 가져오기
    getChatHistory: async (chatroomId = 1) => {
        try {
            const response = await api.get(`/history${chatroomId ? `/${chatroomId}` : ''}`);
            return response.data;
        } catch (error) {
            console.error('채팅 히스토리 조회 오류:', error);
            throw error;
        }
    },

    // WebSocket 클라이언트 생성
    createStompClient,

    // 메시지 전송 함수 (클라이언트 사용법 예시)
    sendMessage: (stompClient, message, userId, nickname, chatroomId = 1) => {
        if (!stompClient || !stompClient.connected) {
            console.error('WebSocket이 연결되어 있지 않습니다.');
            return false;
        }

        const chatMessage = {
            type: 'text',
            content: message,
            userId: userId,
            sender_nickname: nickname,
            chatroomId: chatroomId,
            sentAt: new Date().toISOString() // ISO 형식으로 변환 (서버와 형식 통일)
        };

        console.log('STOMP: 메시지 전송 시도', chatMessage);

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(chatMessage),
            headers: { 'content-type' : 'application/json'}
        });

        return true;
    },

    // 메시지 구독 함수 (클라이언트 사용법 예시)
    subscribeToMessages: (stompClient, callback) => {
        if (!stompClient || !stompClient.connected) {
            console.error('WebSocket이 연결되어 있지 않습니다.');
            return null;
        }

        return stompClient.subscribe('/topic/public', (message) => {
            try {
                const receivedMessage = JSON.parse(message.body);
                console.log('▶ receivedMessage', receivedMessage);
                callback(receivedMessage);
            } catch (error) {
                console.error('메시지 파싱 오류:', error);
            }
        });
    }
};

export default chatAPI;