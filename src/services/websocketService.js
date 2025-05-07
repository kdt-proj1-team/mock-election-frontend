// src/services/websocketService.js
let socket = null;

// WebSocket 연결 함수
export const connectWebSocket = (nickname, roomId, onMessageReceived, onConnectionChange) => {
    if (socket !== null) {
        disconnectWebSocket();
    }

    // Spring Boot WebSocket 엔드포인트에 연결
    // SockJS 없이 순수 WebSocket 사용
    socket = new WebSocket(`ws://localhost:80/ws`);

    // 연결 성공 시
    socket.onopen = (event) => {
        console.log('WebSocket 연결 성공');
        onConnectionChange(true);

        // 입장 메시지 전송
        const joinMessage = {
            type: 'JOIN',
            roomId: roomId,
            sender: nickname,
            content: `${nickname}님이 입장하셨습니다.`,
            timestamp: new Date()
        };

        sendMessage(joinMessage);
    };

    // 메시지 수신 시
    socket.onmessage = (event) => {
        try {
            const receivedMessage = JSON.parse(event.data);
            onMessageReceived(receivedMessage);
        } catch (error) {
            console.error('메시지 파싱 에러:', error);
        }
    };

    // 오류 발생 시
    socket.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        onConnectionChange(false);
    };

    // 연결 종료 시
    socket.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason);
        onConnectionChange(false);

        // 자동 재연결 (선택 사항)
        if (event.code !== 1000) { // 정상 종료가 아닌 경우
            console.log('5초 후 재연결 시도...');
            setTimeout(() => {
                connectWebSocket(nickname, roomId, onMessageReceived, onConnectionChange);
            }, 5000);
        }
    };

    // 연결 해제 함수 반환
    return () => {
        disconnectWebSocket();
    };
};

// WebSocket 연결 종료
export const disconnectWebSocket = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        // 퇴장 메시지 전송
        const leaveMessage = {
            type: 'LEAVE',
            content: '채팅방을 나갔습니다.'
        };

        socket.send(JSON.stringify(leaveMessage));
        socket.close();
    }
    socket = null;
};

// 메시지 전송 함수
export const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket이 연결되어 있지 않습니다.');
    }
};

// 채팅 기록 가져오기
export const fetchChatHistory = async (roomId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/chat/${roomId}/history`);
        if (!response.ok) {
            throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        return await response.json();
    } catch (error) {
        console.error('채팅 기록 가져오기 오류:', error);
        return [];
    }
};