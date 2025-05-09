// src/api/WalletApi.js
import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost/api/wallet',
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

// 응답 인터셉터 - 자세한 오류 로깅
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.log('API Error Response:', error.response.status, error.response.data);
            // 401 오류 처리 (인증 만료)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            console.log('API Error Request:', error.request);
        } else {
            console.log('API Error Message:', error.message);
        }
        return Promise.reject(error);
    }
);

export const walletAPI = {
    // 지갑 연결
    connectWallet: async (walletAddress) => {
        try {
            console.log('지갑 연결 요청:', walletAddress);
            const response = await api.post('/connect', { walletAddress });
            console.log('지갑 연결 응답:', response.data);
            return response;
        } catch (error) {
            console.error('지갑 연결 API 호출 오류:', error);
            throw error;
        }
    },

    // 새 지갑 생성
    createWallet: async (walletAddress, privateKey) => {
        try {
            console.log('지갑 생성 요청:', walletAddress);
            const response = await api.post('/create', { walletAddress, privateKey });
            console.log('지갑 생성 응답:', response.data);
            return response;
        } catch (error) {
            console.error('지갑 생성 API 호출 오류:', error);
            throw error;
        }
    },

    // 지갑 상태 조회
    getWalletStatus: async () => {
        return await api.get('/status');
    },

    // 토큰 잔액 조회
    getTokenBalance: async () => {
        return await api.get('/balance');
    },

    // 지갑 주소 업데이트
    updateWallet: async (walletAddress) => {
        return await api.patch('/update', { walletAddress });
    },

    // 지갑 연결 해제
    disconnectWallet: async () => {
        return await api.delete('/disconnect');
    },

    // 토큰 차감 요청
    deductToken: async (amount) => {
        return await api.post('/deduct', { amount });
    },

    // 최초 토큰 발급 요청
    issueInitialToken: async (walletAddress, privateKey) => {
        try {
            console.log('토큰 발급 요청:', walletAddress);
            const response = await api.post('/issue-token', { walletAddress, privateKey });
            console.log('토큰 발급 응답:', response.data);
            return response;
        } catch (error) {
            console.error('토큰 발급 API 호출 오류:', error);
            throw error;
        }
    }
};

export default api;