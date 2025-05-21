import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_COMMUNITY_API_URL || 'http://localhost/api/community',
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

export const communityAPI = {
    // 커뮤니티 메인 정보 조회
    getMainInfo: async () => {
        const response = await api.get('/main');
        return response.data.data;
    },
};