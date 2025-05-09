import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_COMMUNITY_POST_API_URL || 'http://localhost/api/community/posts',
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

export const postAPI = {

    // 게시글 상세 조회
    getPostDetail: async (postId) => {
        const response = await api.get(`/${postId}`, { withCredentials: true });
        return response.data.data;
    },

    // 카테고리별 게시글 조회
    getPostsByCategory: async (categoryCode, page = 0, size = 10) => {
        const response = await api.get(`/category/${categoryCode}`, {
            params: {
                page,
                size
            }
        });
        return response.data.data;
    },

    // 게시글 등록
    create: async (postData) => {
        const response = await api.post('', postData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    },

    // 게시글 삭제
    delete: async (postId) => {
        const response = await api.delete(`/${postId}`);
        return response.data.data;
    },
};