// src/api/glossaryApi.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_GLOSSARY_API_URL || 'http://localhost/api/glossary',
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

export const glossaryAPI = {
    searchTerm: async (q) => {
        try {
            const response = await api.get('/search', {
                params: {q}
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || '검색 중 오류가 발생했습니다.'
            };
        }
    }
};

export default glossaryAPI;