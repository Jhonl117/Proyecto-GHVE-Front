import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const authService = {
    login: async (username, password) => {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    forgotPassword: async (email) => {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
        return response.data;
    },

    changePassword: async (oldPassword, newPassword) => {
        const { data } = await axios.post(`${API_URL}/auth/change-password`, 
            { oldPassword, newPassword },
            { headers: { 'x-token': localStorage.getItem('token') } }
        );
        return data;
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default authService;
