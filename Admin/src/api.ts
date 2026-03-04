import axios from 'axios';

// The Django API base URL
const API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to all requests if logged in
api.interceptors.request.use((config) => {
    const tokenStr = localStorage.getItem('django_token');
    if (tokenStr) {
        try {
            const token = JSON.parse(tokenStr);
            if (token?.access) {
                config.headers.Authorization = `Bearer ${token.access}`;
            }
        } catch (e) {
            console.error('Invalid token in localStorage');
        }
    }
    return config;
});

// Automatically handle token refresh on 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Avoid infinite loops if refresh token endpoint fails
        if (error.response?.status === 401 && originalRequest.url !== '/auth/token/refresh/' && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const tokenStr = localStorage.getItem('django_token');
                if (tokenStr) {
                    const token = JSON.parse(tokenStr);
                    if (token?.refresh) {
                        // Attempt to refresh
                        const res = await axios.post(`${API_URL}/auth/token/refresh/`, {
                            refresh: token.refresh,
                        });
                        // Save new tokens
                        const newTokens = { ...token, access: res.data.access };
                        if (res.data.refresh) {
                            newTokens.refresh = res.data.refresh;
                        }
                        localStorage.setItem('django_token', JSON.stringify(newTokens));

                        // Retry the original request
                        api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access}`;
                        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Force logout on failed refresh
                localStorage.removeItem('django_token');
                window.location.href = '/auth'; // Redirect to login
            }
        }
        return Promise.reject(error);
    }
);
