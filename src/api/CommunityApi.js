import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_COMMUNITY_API_URL || 'http://localhost/api/community',
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
    // 게시글 카테고리 전체 조회
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data.data;
    },

    // 카테고리별 게시글 조회
    getPostsByCategory: async (categoryCode, page = 0, size = 10) => {
        const response = await api.get(`/categories/${categoryCode}/posts`, {
            params: {
                page,
                size
            }
        });
        return response.data.data;
    }
};