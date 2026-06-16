import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Ajoute automatiquement le token JWT à chaque requête
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si le token expire (401), redirige vers le login
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('entreprise');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;