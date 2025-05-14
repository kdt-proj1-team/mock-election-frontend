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
        // 디버깅 로그 추가
        console.log(`지갑 API 요청: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 자세한 오류 로깅
api.interceptors.response.use(
    response => {
        // 디버깅 로그 추가
        console.log(`지갑 API 응답: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    error => {
        // 상세 에러 로깅
        if (error.response) {
            console.error(`지갑 API 오류 응답: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response.status,
                data: error.response.data
            });

            // 401 오류 처리 (인증 만료)
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            console.error(`지갑 API 요청 오류: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.request);
        } else {
            console.error(`지갑 API 설정 오류: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

export const walletAPI = {
    // 메타마스크 지갑 연결
    connectMetaMaskWallet: async (walletAddress) => {
        try {
            console.log('메타마스크 지갑 연결 요청:', walletAddress);
            const response = await api.post('/connect/metamask', { walletAddress });
            console.log('메타마스크 지갑 연결 응답:', response.data);

            // 토큰 잔액 로깅
            if (response.data.success && response.data.data) {
                console.log('메타마스크 지갑 연결 후 토큰 잔액:', response.data.data.tokenBalance);
            }

            return response;
        } catch (error) {
            console.error('메타마스크 지갑 연결 API 호출 오류:', error);
            throw error;
        }
    },

    // 내부 지갑 연결 (기존 connectWallet 함수)
    connectWallet: async (walletAddress) => {
        try {
            console.log('내부 지갑 연결 요청:', walletAddress);
            const response = await api.post('/connect', { walletAddress });
            console.log('내부 지갑 연결 응답:', response.data);

            // 토큰 잔액 로깅
            if (response.data.success && response.data.data) {
                console.log('내부 지갑 연결 후 토큰 잔액:', response.data.data.tokenBalance);
            }

            return response;
        } catch (error) {
            console.error('내부 지갑 연결 API 호출 오류:', error);
            throw error;
        }
    },

    // 새 지갑 생성 (내부 지갑)
    createWallet: async (walletAddress, privateKey) => {
        try {
            console.log('내부 지갑 생성 요청:', walletAddress);
            const response = await api.post('/create', { walletAddress, privateKey });
            console.log('내부 지갑 생성 응답:', response.data);

            // 토큰 잔액 로깅
            if (response.data.success && response.data.data) {
                console.log('내부 지갑 생성 후 토큰 잔액:', response.data.data.tokenBalance);
            }

            return response;
        } catch (error) {
            console.error('내부 지갑 생성 API 호출 오류:', error);
            throw error;
        }
    },

    // 지갑 상태 조회
    getWalletStatus: async () => {
        try {
            console.log('지갑 상태 조회 요청');
            const response = await api.get('/status');
            console.log('지갑 상태 조회 응답:', response.data);

            // 토큰 잔액 및 지갑 타입 로깅
            if (response.data.success && response.data.data) {
                console.log('현재 토큰 잔액:', response.data.data.tokenBalance);
                console.log('지갑 타입:', response.data.data.walletType);
            }

            return response;
        } catch (error) {
            console.error('지갑 상태 조회 API 호출 오류:', error);
            throw error;
        }
    },

    // 토큰 잔액 조회
    getTokenBalance: async () => {
        try {
            console.log('토큰 잔액 조회 요청');
            const response = await api.get('/balance');
            console.log('토큰 잔액 조회 응답:', response.data);

            // 잔액 값 로깅
            if (response.data.success && response.data.data) {
                console.log('조회된 토큰 잔액:', response.data.data.balance);
            }

            return response;
        } catch (error) {
            console.error('토큰 잔액 조회 API 호출 오류:', error);
            throw error;
        }
    },

    // 지갑 주소 업데이트
    updateWallet: async (walletAddress) => {
        try {
            console.log('지갑 주소 업데이트 요청:', walletAddress);
            const response = await api.patch('/update', { walletAddress });
            console.log('지갑 주소 업데이트 응답:', response.data);
            return response;
        } catch (error) {
            console.error('지갑 주소 업데이트 API 호출 오류:', error);
            throw error;
        }
    },

    // 지갑 연결 해제
    disconnectWallet: async () => {
        try {
            console.log('지갑 연결 해제 요청');
            const response = await api.delete('/disconnect');
            console.log('지갑 연결 해제 응답:', response.data);
            return response;
        } catch (error) {
            console.error('지갑 연결 해제 API 호출 오류:', error);
            throw error;
        }
    },

    // 토큰 차감 요청 (내부 지갑용)
    deductToken: async (amount) => {
        try {
            console.log('토큰 차감 요청:', amount);
            const response = await api.post('/deduct', { amount });
            console.log('토큰 차감 응답:', response.data);

            // 차감 후 잔액 로깅
            if (response.data.success && response.data.data) {
                console.log('차감 후 토큰 잔액:', response.data.data.tokenBalance);
            }

            return response;
        } catch (error) {
            console.error('토큰 차감 API 호출 오류:', error);
            throw error;
        }
    },

    // 토큰 잔액 수동 업데이트 (메타마스크 지갑용)
    updateTokenBalance: async (tokenBalance) => {
        try {
            console.log('토큰 잔액 수동 업데이트 요청:', tokenBalance);
            const response = await api.post('/update-balance', { tokenBalance });
            console.log('토큰 잔액 수동 업데이트 응답:', response.data);
            return response;
        } catch (error) {
            console.error('토큰 잔액 수동 업데이트 API 호출 오류:', error);
            throw error;
        }
    }
};

export default api;