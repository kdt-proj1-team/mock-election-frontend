// src/utils/AxiosInterceptor.js
import axios from 'axios';
import useAuthStore from '../store/authStore';

// JWT 토큰 설정
export const setupAxiosInterceptors = () => {
    // 요청 인터셉터 추가
    axios.interceptors.request.use(
        (config) => {
            // 로컬 스토리지에서 토큰 가져오기
            const token = localStorage.getItem('token');

            // 토큰이 있으면 인증 헤더에 추가
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 응답 인터셉터 추가
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            // 401 에러 처리 (인증 만료)
            if (error.response && error.response.status === 401) {
                // 로컬 스토리지에서 토큰 제거 및 로그아웃 처리
                const logout = useAuthStore.getState().logout;
                logout();
            }
            return Promise.reject(error);
        }
    );
};