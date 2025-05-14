import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_COMMUNITY_VOTE_API_URL || 'http://localhost/api/community/votes',
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

export const communityVoteAPI = {
    // 투표 처리
    vote: async ({ targetType, targetId, vote}) => {
        const response = await api.post('', {
            targetType,
            targetId,
            vote,
        });
        return response.data.data;
    },
};