import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_APP_VOTING_API_URL || 'http://localhost/api/votings',
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

// 응답 인터셉터 - 응답 로깅
api.interceptors.response.use(
    response => {

        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

export const votingAPI = {
    // 모든 선거 목록 조회
    getAllElections: async () => {
        try {
            const response = await api.get('/');
            return response.data.data; // ApiResponse 구조 처리
        } catch (error) {
            throw error;
        }
    },

    // 특정 선거 상세 정보 조회
    getElectionById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data.data; // ApiResponse 구조 처리
        } catch (error) {
            throw error;
        }
    },

    // 특정 선거의 정당별 정책 조회
    getPartyPoliciesByElectionId: async (id) => {
        try {
            const response = await api.get(`/${id}/party-policies`);

            // 백엔드 응답 구조 확인
            if (!response.data || !response.data.data) {
                return [];
            }

            const policies = response.data.data;

            if (!Array.isArray(policies)) {
                return [];
            }

            return policies;
        } catch (error) {
            throw error;
        }
    },

    // 내부 지갑 투표 제출 (기존 submitVote 함수)
    submitVote: async (electionId, policyId) => {
        try {
            // candidateId로 보내지만 백엔드에서는 policyId로 처리됨
            const response = await api.post(`/${electionId}/vote`, { candidateId: policyId });

            if (!response.data || !response.data.data) {
                return null;
            }

            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    // 메타마스크 투표 제출 (블록체인 트랜잭션 해시 포함)
    submitMetaMaskVote: async (electionId, policyId, transactionHash) => {
        try {
            const response = await api.post(`/${electionId}/vote/metamask`, {
                candidateId: policyId,  // candidateId로 보내지만 백엔드에서는 policyId로 처리됨
                transactionHash
            });

            if (!response.data || !response.data.data) {
                return null;
            }

            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    // 투표 통계 조회
    getVoteStats: async (electionId) => {
        try {
            const response = await api.get(`/${electionId}/stats`);

            if (!response.data || !response.data.data) {
                return null;
            }

            const statsData = response.data.data;

            // VotingStatsDTO의 구조에 맞게 데이터 확인
            if (!statsData.votes || !Array.isArray(statsData.votes)) {
                return {
                    sgId: electionId,
                    participation: 0,
                    votes: []
                };
            }

            return statsData;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 투표 상태 확인
    checkVoteStatus: async (electionId) => {
        try {
            const response = await api.get(`/${electionId}/status`);

            // ApiResponse 구조 처리
            if (!response.data || response.data.data === undefined) {
                return false;
            }

            // 백엔드에서는 Boolean 타입을 반환하므로 boolean으로 변환
            return !!response.data.data;
        } catch (error) {
            return false; // 오류 발생 시 기본값으로 false 반환
        }
    },

    // votingAPI에 메타마스크 내부 처리용 함수 추가
    submitMetaMaskVoteInternal: async (electionId, policyId) => {
        try {

            const response = await api.post(`/${electionId}/vote/metamask`, {
                candidateId: policyId,  // candidateId로 보내지만 백엔드에서는 policyId로 처리됨
                transactionHash: "INTERNAL"
            });

            if (!response.data || !response.data.data) {
                return null;
            }

            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    // 사용자 투표 가능 여부 확인
    checkVotingEligibility: async (electionId) => {
        try {
            const response = await api.get(`/${electionId}/eligibility`);

            // ApiResponse 구조 처리
            if (!response.data || !response.data.data) {
                return { canVote: false, hasVoted: false };
            }

            return response.data.data;
        } catch (error) {
            return { canVote: false, hasVoted: false }; // 오류 발생 시 기본값 반환
        }
    }
};

export default api;