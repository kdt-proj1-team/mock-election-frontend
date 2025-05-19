import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost/api/policyQuestion',
    headers: {
        'Content-Type': 'application/json',
    },
});

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
// 응답 인터셉터 설정 - 오류 처리 자동화
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 인증 관련 오류 (401 Unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // 필요시 로그인 페이지로 리다이렉트
            // window.location.href = '/login';
        }

        // 오류 메시지 커스터마이징
        const errorMessage =
            (error.response && error.response.status === 401) ? '인증이 필요합니다. 다시 로그인해주세요.' :
                (error.response && error.response.status === 403) ? '이 작업을 수행할 권한이 없습니다.' :
                    (error.response && error.response.data && error.response.data.message) ? error.response.data.message :
                        '서버와 통신 중 오류가 발생했습니다.';

        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.status = error.response ? error.response.status : null;

        return Promise.reject(enhancedError);
    }
);

export const PolicyQuestionAPI = {
    // 최신 정책 질문 조회
    getLatestQuestion: async () => {
        const response = await api.get('/latest');
        return response.data;
    },

    // 특정 ID의 정책 질문 조회
    getQuestionById: async (id) => {
        const response = await api.get(`/${id}`);
        return response.data;
    },

    // 투표하기 (이전 선택이 있는 경우 포함)
    vote: async (optionId, questionId, previousOptionId = null) => {
        const payload = { optionId, questionId };

        // 이전 선택이 있는 경우 (투표 변경 시)
        if (previousOptionId) {
            payload.previousOptionId = previousOptionId;
        }

        const response = await api.post('/vote', payload);
        return response.data;
    },

    // 사용자의 선택 조회
    getUserSelection: async (questionId) => {
        try {
            const response = await api.get(`/user-selection/${questionId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
};