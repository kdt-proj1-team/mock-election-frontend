import axios from 'axios';

// API 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_USER_API_URL || 'http://localhost/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
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

export const authAPI = {
  // 일반 회원가입
  signup: async (userData) => {
    return await api.post('/signup', userData);
  },
  
  // 일반 로그인
  login: async (userId, password) => {
    return await api.post('/login', { userId, password });
  },
  
  // 구글 로그인
  googleLogin: async (token) => {
    return await api.post('/oauth2/google', { token, provider: 'google' });
  },
  
  // 로그아웃 (서버에 토큰 블랙리스트 등록)
  logout: async () => {
    return await api.post('/logout');
  },
  
  // 회원 탈퇴
  deleteAccount: async () => {
    return await api.delete('/me');
  },
  
  // 사용자 정보 조회
  getUserInfo: async () => {
    return await api.get('/me');
  }
};

export default api;