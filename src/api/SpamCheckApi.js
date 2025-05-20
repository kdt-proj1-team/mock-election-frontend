import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_SPAM_CHECK_API_URL || 'http://localhost/api/spam-check',
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

export const spamCheckAPI = {
    // 도배 의심 여부 판단
    check: async ({ type, title, content }) => {
    const response = await api.post('', null, {
      params: {
        type,
        title,
        content,
      },
    });
    return response.data.data;
  },
};