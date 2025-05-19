import axios from 'axios';

// API 인스턴스 생성 - 경로는 기존 그대로 유지
const api = axios.create({
    baseURL: process.env.REACT_APP_ADMIN_API_URL || 'http://localhost/api/admins',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // CORS 요청 시 자격 증명 정보 포함
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

export const adminAPI = {
    // 사용자 전체 목록 조회 (관리자용)
    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 활성화 상태 토글 (수정)
    // 서버가 값을 반대로 처리하므로, 여기서 의도와 반대 값을 보냄
    toggleUserActive: async (userId, targetStatus) => {
        try {
            // 중요: 서버가 값을 반대로 토글하므로, 여기서 의도한 것의 반대를 전송
            const response = await api.patch(
                `/${userId}/toggle-active`,
                null,
                { params: { targetStatus: !targetStatus } }  // 반대 값을 보냄
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 역할 변경 (수정)
    // 서버가 값을 반대로 처리하므로, 여기서 의도와 반대 값을 보냄
    updateUserRole: async (userId, targetRole) => {
        try {
            // 중요: 서버가 값을 반대로 처리하므로, 여기서 반대 값을 보냄
            const oppositeRole = targetRole === 'ADMIN' ? 'USER' : 'ADMIN';
            const response = await api.patch(
                `/${userId}/role`,
                null,
                { params: { targetRole: oppositeRole } }  // 반대 역할을 보냄
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

// 추가: 사용자 통계 데이터 조회
    getUserStats: async () => {
        try {
            const response = await api.get('/stats');

            return response.data;
        } catch (error) {
            throw error;
        }
    }



};

export default api;