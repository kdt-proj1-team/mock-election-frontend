// src/api/WalletApi.js
import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_WALLET_API_URL || 'http://localhost/api/wallet',
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

// 응답 인터셉터 - CORS 오류 로깅
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.log('Wallet API Error Response:', error.response.status, error.response.data);
        } else if (error.request) {
            console.log('Wallet API Error Request:', error.request);
            // CORS 오류일 가능성이 높음
            if (error.message && error.message.includes('Network Error')) {
                console.log('Possible CORS issue');
            }
        } else {
            console.log('Wallet API Error Message:', error.message);
        }
        return Promise.reject(error);
    }
);

export const walletAPI = {
    // 지갑 연결
    connectWallet: async (walletAddress) => {
        return await api.post('/connect', { walletAddress });
    },

    // 새 지갑 생성
    createWallet: async (walletAddress, privateKey) => {
        return await api.post('/create', { walletAddress, privateKey });
    },

    // 지갑 상태 조회
    getWalletStatus: async () => {
        return await api.get('/status');
    },

    // 토큰 잔액 조회
    getTokenBalance: async (walletAddress) => {
        return await api.get('/balance');
    },

    // 지갑 주소 업데이트
    updateWallet: async (walletAddress) => {
        return await api.patch('/update', { walletAddress });
    },

    // 지갑 연결 해제
    disconnectWallet: async () => {
        return await api.delete('/disconnect');
    }
};

export default api;