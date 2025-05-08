import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_COMMUNITY_CATEGORY_API_URL || 'http://localhost/api/community/categories',
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

export const categoryAPI = {
    // 게시글 카테고리 전체 조회
    getCategories: async () => {
        const response = await api.get('');
        return response.data.data;
    },

};