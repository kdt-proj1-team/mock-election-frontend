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

export const postCommentAPI = {
    // 댓글 등록
    create: async (postId, commentData) => {
        const response = await api.post(`/${postId}/comments`, commentData);
        return response.data.data;
    },
};