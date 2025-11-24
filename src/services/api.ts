import axios from 'axios';
import { ENV } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';
import { AuthService } from './auth';

const api = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add JWT Token
api.interceptors.request.use(
    async (config) => {
        // First check the store for token
        let token = useAuthStore.getState().token;

        // If not in store, try to get from secure storage
        if (!token) {
            token = await AuthService.getAccessToken();
            // Update the store if we found a token in secure storage
            if (token) {
                useAuthStore.setState({ token, isAuthenticated: true });
            }
        }

        // Check if token is expired and try to refresh it
        if (token && AuthService.isTokenExpired(token)) {
            // Try to refresh the token
            try {
                const refreshResult = await AuthService.refreshToken();
                if (refreshResult.success && refreshResult.data?.access_token) {
                    token = refreshResult.data.access_token;
                    // Update the store with the new token
                    useAuthStore.setState({ token, isAuthenticated: true });
                } else {
                    // If refresh fails, logout
                    await useAuthStore.getState().logout();
                    return Promise.reject(new Error('Token refresh failed'));
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                // If refresh fails, logout
                await useAuthStore.getState().logout();
                return Promise.reject(error);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token might be expired, try to refresh it
            try {
                const refreshResult = await AuthService.refreshToken();
                if (refreshResult.success && refreshResult.data?.access_token) {
                    // If refresh succeeds, retry the original request
                    const config = error.config;
                    config.headers.Authorization = `Bearer ${refreshResult.data.access_token}`;
                    // Update the store with the new token
                    useAuthStore.setState({ token: refreshResult.data.access_token, isAuthenticated: true });
                    return api(config);
                }
            } catch (refreshError) {
                console.error('Token refresh failed on 401 response:', refreshError);
            }

            // If refresh failed or wasn't possible, clear tokens and logout
            await AuthService.logout();
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default api;
