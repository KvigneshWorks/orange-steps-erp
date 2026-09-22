import axios from 'axios';

const getBaseUrl = () => {
    let base = import.meta.env.VITE_API_URL || (import.meta.env.BASE_URL ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL + 'api/' : import.meta.env.BASE_URL + '/api/') : '/api/');
    if (!base.endsWith('/')) {
        base += '/';
    }
    return base;
};

const axiosInstance = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
    },
    timeout: 30000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        if (config.url) {
            let url = config.url;
            if (url.startsWith('/api/')) {
                url = url.substring(5);
            } else if (url.startsWith('api/')) {
                url = url.substring(4);
            } else if (url.startsWith('/')) {
                url = url.substring(1);
            }
            config.url = url;
        }

        const token = sessionStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-Authorization'] = `Bearer ${token}`;
        }
        if ((config.method || 'get').toLowerCase() === 'get') {
            config.params = { ...(config.params || {}), _: Date.now() };
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`API Error [${error.response.status}]:`, error.response.data);

            if (error.response.status === 401) {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                const base = import.meta.env.BASE_URL || '/';
                const loginPath = base.endsWith('/') ? base : `${base}/`;
                if (!window.location.pathname.includes('/login') && window.location.pathname !== base) {
                    window.location.href = loginPath;
                }
            }
        } else if (error.request) {
            console.error('Network Error: Cannot connect to server');
        } else {
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;