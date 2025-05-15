import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_REPORT_TYPE_API_URL || 'http://localhost/api/report-types',
    headers: {
        'Content-Type': 'application/json'
    }
});

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

export const reportTypeAPI = {
    // 신고 유형 전체 조회
    getReportTypes: async () => {
        const response = await api.get('');
        return response.data.data;
    },
};