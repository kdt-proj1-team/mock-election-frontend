import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_USER_API_URL || 'http://localhost/api/candidate',
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

export const candidateAPI = {
    getCandidatesByElection : async (sgId) => {
        const response = await api.get(`/list?sgId=${sgId}`);
        return response.data;

    },
    getCandidateDetail : async(sgId,partyName) => {
        const response = await api.get(`/detail?sgId=${sgId}&partyName=${partyName}`)
        return response.data;
    }

}