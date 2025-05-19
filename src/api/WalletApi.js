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

// 응답 인터셉터 - 자세한 오류 로깅
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // 상세 에러 로깅
        if (error.response) {

            // 401 오류 처리 (인증 만료)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // console.error(`지갑 API 요청 오류: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.request);
        } else {
            // console.error(`지갑 API 설정 오류: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

export const walletAPI = {
    // 메타마스크 지갑 연결
    connectMetaMaskWallet: async (walletAddress) => {
        try {
            const response = await api.post('/connect/metamask', { walletAddress });

            return response;
        } catch (error) {
            throw error;
        }
    },

    // 내부 지갑 연결 (기존 connectWallet 함수)
    connectWallet: async (walletAddress) => {
        try {
            const response = await api.post('/connect', { walletAddress });

            return response;
        } catch (error) {
            throw error;
        }
    },

    // 새 지갑 생성 (내부 지갑)
    createWallet: async (walletAddress, privateKey) => {
        try {
            const response = await api.post('/create', { walletAddress, privateKey });

            return response;
        } catch (error) {
            throw error;
        }
    },

    // 지갑 상태 조회
    getWalletStatus: async () => {
        try {
            const response = await api.get('/status');

            return response;
        } catch (error) {
            throw error;
        }
    },

    // 토큰 잔액 조회
    getTokenBalance: async () => {
        try {
            const response = await api.get('/balance');

            return response;
        } catch (error) {
            throw error;
        }
    },

    // 지갑 주소 업데이트
    updateWallet: async (walletAddress) => {
        try {
            const response = await api.patch('/update', { walletAddress });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 지갑 연결 해제
    disconnectWallet: async () => {
        try {
            const response = await api.delete('/disconnect');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // 토큰 차감 요청 (내부 지갑용)
    deductToken: async (amount) => {
        try {
            const response = await api.post('/deduct', { amount });

            return response;
        } catch (error) {
            throw error;
        }
    },

    // 토큰 잔액 수동 업데이트 (메타마스크 지갑용)
    updateTokenBalance: async (tokenBalance) => {
        try {
            const response = await api.post('/update-balance', { tokenBalance });

            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default api;