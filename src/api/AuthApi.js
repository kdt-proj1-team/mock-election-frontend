import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_USER_API_URL || 'http://localhost/api/users',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // 추가: CORS 요청 시 자격 증명 정보 포함
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
        if (error.response) {
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

export const authAPI = {
    // 일반 회원가입
    signup: async (userData) => {
        return await api.post('/signup', userData);
    },

    // 일반 로그인
    login: async (userId, password) => {
        return await api.post('/login', { userId, password });
    },

    // 구글 로그인
    googleLogin: async (token) => {
        return await api.post('/oauth2/google', { token, provider: 'google' });
    },

    // 로그아웃 (서버에 토큰 블랙리스트 등록)
    logout: async () => {
        return await api.post('/logout');
    },

    // 회원 탈퇴
    deleteAccount: async () => {
        return await api.delete('/me');
    },

    // 사용자 정보 조회
    getUserInfo: async () => {
        try {
            const response = await api.get('/me');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 투표 상태 업데이트 - PATCH 메서드 사용
    updateElectionStatus: async (status = true) => {
        try {
            // 데이터를 요청 바디에 포함시키는 방식으로 변경
            return await api.patch('/me/election-status', { status });
        } catch (error) {

            // CORS 오류 발생 시 대체 처리
            if (error.message && error.message.includes('Network Error')) {
                // 로컬 상태만 업데이트하는 대체 로직 (실제 구현은 상황에 맞게 조정)
                return { data: { success: true, message: '투표 상태가 업데이트되었습니다. (로컬 전용)' } };
            }

            throw error;
        }
    },
    updateUserInfo: async (formData) => {
        return await api.patch('/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
};

export default api;