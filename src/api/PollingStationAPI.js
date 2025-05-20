// pollingStationAPI.js
import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
    // 백엔드 프록시 URL 또는 직접 API URL 설정
    baseURL: process.env.REACT_APP_POLLING_API_URL || 'http://localhost:80/api/polling',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10초 타임아웃 설정
});

// 요청 인터셉터 - 공통 파라미터 추가
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

// 응답 인터셉터 - 에러 처리 및 데이터 변환
api.interceptors.response.use(
    (response) => {
        // 성공 응답 처리
        // 필요한 경우 응답 데이터 구조 변환
        return response.data;
    },
    (error) => {
        // 오류 응답 처리
        if (error.response) {
            // 서버가 응답을 반환한 경우 (상태 코드가 2xx 범위를 벗어남)
            console.error('API Error:', error.response.status, error.response.data);

            // 공공 데이터 포털 API 오류 코드 처리
            if (error.response.data && error.response.data.header) {
                const errorCode = error.response.data.header.resultCode;
                const errorMsg = error.response.data.header.resultMsg;

                // 특정 오류 코드에 따른 사용자 친화적 메시지 반환
                if (errorCode === 'ERROR-03') {
                    return Promise.reject(new Error('데이터가 없습니다. 검색 조건을 확인해주세요.'));
                } else if (errorCode === 'ERROR-301') {
                    return Promise.reject(new Error('파라미터 값이 올바르지 않습니다.'));
                } else if (errorCode === 'ERROR-500') {
                    return Promise.reject(new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
                }

                return Promise.reject(new Error(`${errorMsg} (${errorCode})`));
            }
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못한 경우
            console.error('API Request Error:', error.request);
            if (error.message && error.message.includes('timeout')) {
                return Promise.reject(new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'));
            }
            return Promise.reject(new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'));
        } else {
            // 요청 설정 중 오류가 발생한 경우
            console.error('API Error Setup:', error.message);
            return Promise.reject(new Error('요청 준비 중 오류가 발생했습니다.'));
        }

        return Promise.reject(error);
    }
);


// 투표소 관련 API 호출
const pollingStationAPI = {
    // 사전투표소 정보 조회
    getPrePollingStations: async (params) => {
        console.log("사전투표소 API 호출 시도:", params);
        const response = await axios.get(`/api/polling/getPrePolplcOtlnmapTrnsportInfoInqire`, {
            params: {
                ...params,
                resultType: params.resultType || 'json'
            }
        });
        console.log("API 응답 성공:", response.data);
        return response.data;
    },

    // 선거일투표소 정보 조회
    getPollingStations: async (params) => {
        console.log("선거일투표소 API 호출 시도:", params);
        const response = await axios.get(`/api/polling/getPolplcOtlnmapTrnsportInfoInqire`, {
            params: {
                ...params,
                resultType: params.resultType || 'json'
            }
        });
        console.log("API 응답 성공:", response.data);
        return response.data;
    }
};

export default pollingStationAPI;