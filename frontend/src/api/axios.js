import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Nettoie les strings (retire les balises HTML)
function sanitize(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    const propre = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            propre[key] = value.replace(/<[^>]*>/g, '').trim();
        } else if (typeof value === 'object' && value !== null) {
            propre[key] = sanitize(value); // récursif pour les objets imbriqués
        } else {
            propre[key] = value;
        }
    }
    return propre;
}

// Intercepteur avant envoi
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Sanitize le body si c'est un objet
    if (config.data && typeof config.data === 'object') {
        config.data = sanitize(config.data);
    }

    return config;
});

// Si le token expire (401), redirige vers le login
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.response?.config?.url || '';
            
            // Ne pas rediriger pour les routes d'authentification
            const routesAuth = ['/auth/login', '/auth/inscription', '/auth/reinitialiser-mot-de-passe'];
            const estRouteAuth = routesAuth.some(route => url.includes(route));
            
            if (!estRouteAuth) {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('entreprise');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default instance;