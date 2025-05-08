import axios from 'axios'

const api = axios.create({
    baseURL: process.env.REACT_ELECTION_API_URL || 'http://localhost/api/election',
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
export const electionAPI = {
    getElectionList: async () => {
        const response = await api.get("/list");
        return response.data;
    },


}