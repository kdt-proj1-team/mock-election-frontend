import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    baseURL: process.env.REACT_VOTING_API_URL || 'http://localhost/api/votings',
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
        // 디버깅 로그 추가
        console.log(`API 요청: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 응답 로깅
api.interceptors.response.use(
    response => {
        // 디버깅 로그 추가
        console.log(`API 응답: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    error => {
        // 에러 상세 로깅
        if (error.response) {
            console.error(`API 오류 응답: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error(`API 요청 오류: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.request);
        } else {
            console.error(`API 설정 오류: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

export const votingAPI = {
    // 모든 선거 목록 조회
    getAllElections: async () => {
        try {
            const response = await api.get('/');
            // data 구조에 따라 적절히 반환
            return response.data.data || response.data;
        } catch (error) {
            console.error('선거 목록 조회 실패:', error);
            throw error;
        }
    },

    // 특정 선거 상세 정보 조회
    getElectionById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            // data 구조에 따라 적절히 반환
            return response.data.data || response.data;
        } catch (error) {
            console.error(`선거 정보 조회 실패 (ID: ${id}):`, error);
            throw error;
        }
    },

    // 특정 선거의 정당별 정책 조회
    getPartyPoliciesByElectionId: async (id) => {
        try {
            console.log(`정당 정책 조회 요청: 선거 ID ${id}`);
            const response = await api.get(`/${id}/party-policies`);

            // 응답 로깅
            console.log(`정당 정책 조회 응답: 선거 ID ${id}`, response.data);

            // 데이터 구조 확인 및 처리
            let policies;
            if (response.data.success === true && response.data.data) {
                // 표준 API 응답 형식인 경우
                policies = response.data.data;
            } else {
                // 직접 데이터 배열을 반환하는 경우
                policies = response.data;
            }

            // 배열이 아닌 경우 빈 배열 반환
            if (!Array.isArray(policies)) {
                console.warn('정당 정책 데이터가 배열이 아닙니다:', policies);
                return [];
            }

            return policies;
        } catch (error) {
            console.error(`정당 정책 조회 실패 (ID: ${id}):`, error);
            throw error;
        }
    },

    // 투표 제출
    submitVote: async (electionId, candidateId) => {
        try {
            console.log(`투표 제출 요청: 선거 ID ${electionId}, 후보 ID ${candidateId}`);
            const response = await api.post(`/${electionId}/vote`, { candidateId });

            // 응답 로깅
            console.log(`투표 제출 응답:`, response.data);

            // data 구조에 따라 적절히 반환
            return response.data.data || response.data;
        } catch (error) {
            console.error('투표 제출 실패:', error);
            throw error;
        }
    },

    // 투표 통계 조회
    getVoteStats: async (electionId) => {
        try {
            console.log(`투표 통계 조회 요청: 선거 ID ${electionId}`);
            const response = await api.get(`/${electionId}/stats`);

            // 응답 로깅
            console.log(`투표 통계 조회 응답:`, response.data);

            // data 구조에 따라 적절히 반환
            return response.data.data || response.data;
        } catch (error) {
            console.error(`투표 통계 조회 실패 (ID: ${electionId}):`, error);
            throw error;
        }
    },

    // 사용자 투표 상태 확인
    checkVoteStatus: async (electionId) => {
        try {
            console.log(`투표 상태 확인 요청: 선거 ID ${electionId}`);
            const response = await api.get(`/${electionId}/status`);

            // 응답 로깅
            console.log(`투표 상태 확인 응답:`, response.data);

            // data 구조에 따라 적절히 반환 (불리언 값 또는 다른 형식)
            if (response.data.success === true && response.data.data !== undefined) {
                return !!response.data.data; // 불리언으로 변환
            }
            return !!response.data; // 불리언으로 변환
        } catch (error) {
            console.error(`투표 상태 확인 실패 (ID: ${electionId}):`, error);
            throw error;
        }
    }
};

export default api;