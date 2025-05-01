import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost/api/votings',
    headers: {
        'Content-Type': 'application/json',
    },
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

export const votingAPI = {
    // 모든 선거 목록 조회
    getAllElections: async () => {
        try {
            const response = await api.get('/');
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch elections:', error);
            throw error;
        }
    },

    // 특정 선거 상세 정보 조회
    getElectionById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Failed to fetch election with id ${id}:`, error);
            throw error;
        }
    },

    // 특정 선거의 정당별 정책 조회
    getPartyPoliciesByElectionId: async (id) => {
        try {
            const response = await api.get(`/${id}/party-policies`);
            return response.data.data;
        } catch (error) {
            console.error(`Failed to fetch party policies for election ${id}:`, error);
            throw error;
        }
    },

    // 투표 제출
    submitVote: async (electionId, candidateId) => {
        try {
            const response = await api.post(`/${electionId}/vote`, { candidateId });
            return response.data.data;
        } catch (error) {
            console.error('Failed to submit vote:', error);
            throw error;
        }
    },

    // 투표 통계 조회
    getVoteStats: async (electionId) => {
        try {
            const response = await api.get(`/${electionId}/stats`);
            return response.data.data;
        } catch (error) {
            console.error(`Failed to fetch vote stats for election ${electionId}:`, error);
            throw error;
        }
    },

    // 사용자 투표 상태 확인
    checkVoteStatus: async (electionId) => {
        try {
            const response = await api.get(`/${electionId}/status`);
            return response.data.data;
        } catch (error) {
            console.error(`Failed to check vote status for election ${electionId}:`, error);
            throw error;
        }
    }
};

export default api;