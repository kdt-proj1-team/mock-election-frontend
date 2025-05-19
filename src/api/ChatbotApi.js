// python과 통신합니다..! 참고하지 마세요!
import axios from 'axios';

const API_URL = 'https://42ac-221-150-27-169.ngrok-free.app';  // FastAPI 서버 주소

export const sendMessage = async (message, sessionId = null) => {
    try {
        const response = await axios.post(`${API_URL}/chat`, {
            message,
            session_id: sessionId,
            user_id: "anonymous"  // 비로그인 사용자는 anonymous로 설정
        });

        // 응답 구조 확인 및 변환
        const data = response.data;

        // FastAPI 서버의 응답 구조에 맞게 조정
        // schemas.py의 ChatResponse 모델 구조에 맞춤
        return {
            answer: data.response,  // 'response' 필드를 'answer'로 매핑
            sources: data.sources || [],
            processing_time: data.processing_time || 0
        };
    } catch (error) {
        console.error('챗봇 API 요청 오류:', error);
        throw error;
    }
};

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${API_URL}/healthcheck`);
        return response.data;
    } catch (error) {
        console.error('챗봇 서버 상태 확인 오류:', error);
        throw error;
    }
};