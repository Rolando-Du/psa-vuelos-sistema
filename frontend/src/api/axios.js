import axios from 'axios';

const api = axios.create({
    // Usa tu URL de Render
    baseURL: import.meta.env.VITE_API_URL || 'https://skylog-api.onrender.com/api',
});

// INTERCEPTOR: Esto soluciona el error 401
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Recupera el token guardado al hacer login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;