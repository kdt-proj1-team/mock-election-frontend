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
        console.log(`투표 API 요청: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터 - 응답 로깅
api.interceptors.response.use(
    response => {
        // 디버깅 로그 추가
        console.log(`투표 API 응답: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    error => {
        // 에러 상세 로깅
        if (error.response) {
            console.error(`투표 API 오류 응답: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error(`투표 API 요청 오류: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.request);
        } else {
            console.error(`투표 API 설정 오류: ${error.message}`);
        }
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
            console.error('선거 목록 조회 실패:', error);
            throw error;
        }
    },

    // 특정 선거 상세 정보 조회
    getElectionById: async (id) => {
        try {
            const response = await api.get(`/${id}`);
            return response.data.data; // ApiResponse 구조 처리
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

            // 백엔드 응답 구조를 확인하고 적절히 처리
            // VotingController에서는 ApiResponse.success(policies)를 반환하므로
            // response.data.data 형태로 정책 정보가 반환됨
            if (!response.data || !response.data.data) {
                console.warn('정당 정책 데이터 없음:', response.data);
                return [];
            }

            // 정상적인 응답인 경우 data.data에서 정책 목록 추출
            const policies = response.data.data;

            if (!Array.isArray(policies)) {
                console.warn('정당 정책 데이터가 배열이 아닙니다:', policies);
                return [];
            }

            console.log(`정당 정책 데이터 처리 완료: ${policies.length}개 항목`);
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

            if (!response.data || !response.data.data) {
                console.warn('투표 제출 후 결과 데이터 없음:', response.data);
                return null;
            }

            return response.data.data; // ApiResponse 구조 처리
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

            if (!response.data || !response.data.data) {
                console.warn('투표 통계 데이터 없음:', response.data);
                return null;
            }

            const statsData = response.data.data;
            console.log('투표 통계 데이터:', statsData);

            // VotingStatsDTO의 구조에 맞게 데이터 확인
            if (!statsData.votes || !Array.isArray(statsData.votes)) {
                console.warn('투표 통계 데이터 형식 오류:', statsData);
                return {
                    sgId: electionId,
                    participation: 0,
                    votes: []
                };
            }

            return statsData;
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

            // ApiResponse 구조 처리
            if (!response.data || response.data.data === undefined) {
                console.warn('투표 상태 데이터 없음:', response.data);
                return false;
            }

            // 백엔드에서는 Boolean 타입을 반환하므로 boolean으로 변환
            return !!response.data.data;
        } catch (error) {
            console.error(`투표 상태 확인 실패 (ID: ${electionId}):`, error);
            return false; // 오류 발생 시 기본값으로 false 반환
        }
    }
};

export default api;