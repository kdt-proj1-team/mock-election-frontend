import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_REPORT_API_URL || 'http://localhost/api/reports',
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

export const reportAPI = {
    // 신고 등록
    create: async (reportData) => {
        const response = await api.post('', reportData);
        return response.data.data;
    },

    // 중복 신고 여부 조회
    checkExists: async ({ targetType, targetId }) => {
        const response = await api.get('/exists', {
            params: {
                targetType,
                targetId
            }
        });
        return response.data.data;
    },

};