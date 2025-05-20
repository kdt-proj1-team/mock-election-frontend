import axios from 'axios';

// API 인스턴스 생성 - 경로는 기존 그대로 유지
const api = axios.create({
    baseURL: process.env.REACT_APP_NEWS_API_URL || 'http://localhost/api/news',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // CORS 요청 시 자격 증명 정보 포함
});

// 요청 인터셉터 - 토큰이 있으면 헤더에 추가
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


export const NewsDataAPI ={
    getNewsData: async () => {
        const response = await api.get('/newsdata');
        return response;
    }

};