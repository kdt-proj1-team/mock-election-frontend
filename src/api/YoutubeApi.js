import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_YOUTUBE_API_URL || 'http://localhost/api/youtube',
    headers: {
        'Content-Type': 'application/json',
    },
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

export const YoutubeAPI = {
    fetchYoutubeVideos: async (query) => {
        const response = await api.get('/videos', {
            params: { query }
        });
        return response.data.items;
    }
};
