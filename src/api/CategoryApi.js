import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_COMMUNITY_CATEGORY_API_URL || 'http://localhost/api/community/categories',
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
            console.log('API response:', response); // 응답 데이터 확인

            // API 응답 구조에 따라 적절히 처리
            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                console.error('Unexpected API response format:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getCategoriesByIsActive: async () => {
        try {
            const response = await api.get('/isActive');
            console.log('API response:', response); // 응답 데이터 확인

            // API 응답 구조에 따라 적절히 처리
            if (response.data.data) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                console.error('Unexpected API response format:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
                console.error('게시글 수 조회 실패:', response.data.message);
                return 0;
            }
        } catch (error) {
            console.error('Error fetching post count by category:', error);
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