import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_FILE_API_URL || 'http://localhost/api/files',
    headers: {
        'Content-Type': 'multipart/form-data'
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

export const fileAPI = {

    // 파일 업로드
    upload: async (type, file) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);

        // type
        // "profiles"           -> 프로필 이미지
        // "post_images"        -> 게시글 이미지
        // "post_attachments"   -> 게시글 첨부파일
        // "feed_images"        -> 피드 이미지

        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    
        return response.data.data;  // URL return
    },
};