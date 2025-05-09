import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_TRANSLATION_API_URL || 'http://localhost/api/translation',
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

export const TranslateAPI = {
    translateTexts: async (texts, targetLanguage) => {
        const response = await api.post('', {
            texts: texts,
            targetLanguage: targetLanguage
        });

        return response.data.translations;
    }
};