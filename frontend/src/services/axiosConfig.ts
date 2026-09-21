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
        // Belt-and-suspenders alongside the backend's own no-cache headers
        // (NoCacheHeaders middleware + .htaccess): tells any cache sitting
        // between the browser and the server -- a reverse proxy, LiteSpeed's
        // LSCache, or a shared browser cache -- not to serve a stale copy of
        // API responses. This is what fixed the "saved to DB but doesn't
        // show until ~5 min later, or shows fine in a fresh incognito tab"
        // symptom: that's a cached GET response being replayed.
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

        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-Authorization'] = `Bearer ${token}`;
        }

        // Stronger cache-bypass for GET requests: headers alone rely on the
        // cache in front of the server (browser, LiteSpeed LSCache, a CDN)
        // actually honoring Cache-Control -- some misconfigured/legacy
        // proxy layers cache the URL regardless of what headers say. Adding
        // a unique, ever-changing query param makes every GET request a
        // literally different URL each time, so there is no cache key left
        // for it to match against, even if headers are ignored entirely.
        // POST/PUT/DELETE are left untouched -- they're not cached by
        // definition and mutating their payload isn't the goal here.
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
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                const base = import.meta.env.BASE_URL || '/';
                const loginPath = base.endsWith('/') ? base : `${base}/`;
                if (!window.location.pathname.includes('/login') && window.location.pathname !== base) {
                    window.location.href = loginPath;
                }
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error: Cannot connect to server');
        } else {
            // Something else
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;