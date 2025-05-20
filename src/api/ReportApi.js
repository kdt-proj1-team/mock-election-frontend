// src/api/reportAPI.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_REPORT_API_URL || 'http://localhost/api/reports',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export const reportAPI = {
    // 신고 등록
    create: async (reportData) => {
        const res = await api.post('', reportData);
        return res.data.data;
    },

    // 중복 신고 여부 조회
    checkExists: async ({ targetType, targetId }) => {
        const res = await api.get('/exists', { params: { targetType, targetId } });
        return res.data.data;
    },

    // 모든 신고 내역 조회
    getReports: async () => {
        const res = await api.get('/lists');
        return res.data.data;
    },

    // 단일 신고 상세 조회
    getReportById: async (id) => {
        const res = await api.get(`/lists/${id}`);
        return res.data.data;
    },

    // 신고 처리 (확인)
    confirmReport: async (id) => {
        const res = await api.patch(`/lists/${id}/confirm`);
        return res.data.data;
    },

    // 일별 신고 통계 조회 - API 응답 구조에 맞게 수정
    getDailyStats: async () => {
        try {
            const res = await api.get('/stats/daily');

            // 날짜별 매핑을 위한 준비
            const currentDate = new Date();
            const dateMap = {}; // period를 키로 사용하여 count 값을 매핑

            // 기본 데이터 배열 초기화 (모든 날짜를 0으로 설정)
            const dailyData = Array(7).fill(0);

            // 각 일자별 매핑 생성 (최근 7일)
            for (let i = 6; i >= 0; i--) {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - i);

                // API 응답과 비교를 위한 period 형식 (YYYY-MM-DD)
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const periodKey = `${year}-${month}-${day}`;

                // periodKey와 해당 인덱스 매핑
                dateMap[periodKey] = 6 - i; // 역순으로 인덱스 매핑 (오늘이 배열의 마지막에 위치)
            }

            // API 응답 데이터 매핑
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                res.data.data.forEach(item => {
                    const { period, count } = item;

                    // period가 매핑에 있는지 확인 후 해당 인덱스에 count 할당
                    if (dateMap.hasOwnProperty(period)) {
                        const index = dateMap[period];
                        dailyData[index] = count;
                    }
                });
            }

            return dailyData;
        } catch (error) {
            return [0, 0, 0, 0, 0, 0, 0];
        }
    },

// 주별 신고 통계 조회 - API 응답 구조에 맞게 수정
    // 주별 신고 통계 조회 - API 응답 구조에 맞게 수정
    getWeeklyStats: async () => {
        try {
            const res = await api.get('/stats/weekly');
            // 기본 데이터 배열 초기화 (7주를 0으로 설정)
            const weeklyData = Array(7).fill(0);

            // 현재 날짜 기준으로 최근 7주 계산
            const currentDate = new Date();
            const weekMap = {}; // {year-week: index} 형태로 매핑

            // ISO 주차 계산 함수
            const getWeekNumber = (d) => {
                const date = new Date(d.getTime());
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                const week1 = new Date(date.getFullYear(), 0, 4);
                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
            };

            // 최근 7주 정보 생성
            for (let i = 0; i < 7; i++) {
                const weekDate = new Date(currentDate);
                weekDate.setDate(currentDate.getDate() - (i * 7));

                const weekNum = getWeekNumber(weekDate);
                const year = weekDate.getFullYear();

                // 매핑 키 생성 (형식: "2025-21")
                const mapKey = `${year}-${weekNum}`;

                // 역순으로 인덱스 매핑 (현재 주가 마지막에 위치)
                weekMap[mapKey] = 6 - i;
            }

            // API 응답 데이터 매핑
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                res.data.data.forEach(item => {
                    const { week, year, count } = item;

                    // 매핑 키 생성
                    const mapKey = `${year}-${week}`;

                    // 해당 주차가 매핑에 있는지 확인 후 데이터 할당
                    if (weekMap.hasOwnProperty(mapKey)) {
                        const index = weekMap[mapKey];
                        weeklyData[index] = count;
                    }
                });
            }

            return weeklyData;
        } catch (error) {
            return [0, 0, 0, 0, 0, 0, 0];
        }
    },

    getMonthlyStats: async () => {
        try {
            const res = await api.get('/stats/monthly');

            // 월별 라벨 생성 (현재 월부터 5개월 전까지)
            const currentDate = new Date();
            const monthMap = {}; // period를 키로 사용하여 count 값을 매핑

            // 기본 데이터 배열 초기화 (모든 달을 0으로 설정)
            const monthlyData = Array(6).fill(0);

            // 각 월별 라벨 생성 및 인덱스 매핑
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(currentDate);
                monthDate.setMonth(currentDate.getMonth() - i);

                // API 응답과 비교를 위한 period 형식 (YYYY-MM)
                const year = monthDate.getFullYear();
                const month = (monthDate.getMonth() + 1).toString().padStart(2, '0');
                const periodKey = `${year}-${month}`;

                // periodKey와 해당 인덱스 매핑
                monthMap[periodKey] = 5 - i; // 역순으로 인덱스 매핑 (최근 월이 배열의 마지막에 위치)
            }

            // API 응답 데이터 매핑
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                res.data.data.forEach(item => {
                    const { period, count } = item;

                    // period가 매핑에 있는지 확인 후 해당 인덱스에 count 할당
                    if (monthMap.hasOwnProperty(period)) {
                        const index = monthMap[period];
                        monthlyData[index] = count;
                    }
                });
            }

            return monthlyData;
        } catch (error) {
            return [0, 0, 0, 0, 0, 0];
        }
    }
};
