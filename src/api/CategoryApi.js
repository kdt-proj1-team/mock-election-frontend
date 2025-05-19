import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_COMMUNITY_CATEGORY_API_URL || 'http://localhost/api/community/categories',
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

export const categoryAPI = {
    // 게시글 카테고리 전체 조회
    getCategories: async () => {
        try {
            const response = await api.get('');

            // API 응답 구조에 따라 적절히 처리
            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                return [];
            }
        } catch (error) {
            throw error;
        }
    },

    getCategoriesByIsActive: async () => {
        try {
            const response = await api.get('/isActive');

            // API 응답 구조에 따라 적절히 처리
            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                return [];
            }
        } catch (error) {
            throw error;
        }
    },

    // 카테고리별 게시글 수 조회
    getPostCountByCategory: async (categoryCode) => {
        try {
            const response = await api.get('/count', {
                params: { categoryCode }
            });
            if (response.data.success) {
                return response.data.data;
            } else {
                return 0;
            }
        } catch (error) {
            throw error;
        }
    },


    // 카테고리 활성화/비활성화 상태 변경
    updateCategoryStatus: async (categoryId, isActive) => {
        const response = await api.patch(`/${categoryId}/status`, { isActive});
        return response.data;
    },

    // 새 카테고리 추가
    addCategory: async (categoryData) => {
        const response = await api.post('', categoryData);
        return response.data;
    },


    deleteCategory: async (categoryId) => {
        const response = await api.delete(`/${categoryId}`);
        return response.data;
    }
};