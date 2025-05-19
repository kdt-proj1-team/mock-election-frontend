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

    // 일별 신고 통계 조회
    getDailyStats: async () => {
        const res = await api.get('/stats/daily');
        return res.data.data;
    },

    // 주별 신고 통계 조회
    getWeeklyStats: async () => {
        const res = await api.get('/stats/weekly');
        return res.data.data;
    },

    // 월별 신고 통계 조회
    getMonthlyStats: async () => {
        const res = await api.get('/stats/monthly');
        return res.data.data;
    }
};
