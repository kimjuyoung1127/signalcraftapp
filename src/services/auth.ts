import * as SecureStore from 'expo-secure-store';
import api from './api';
import { ENV } from '../config/env';

// Keys for storing tokens
const ACCESS_TOKEN_KEY = 'user_access_token';
const REFRESH_TOKEN_KEY = 'user_refresh_token';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data?: {
        user: User;
        access_token: string;
        refresh_token: string;
        store_id?: number;
        subscription_tier?: string;
    };
    error?: {
        message: string;
    };
}

export interface TokenRefreshResponse {
    success: boolean;
    data?: {
        access_token: string;
    };
    error?: {
        message: string;
    };
}

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash?: string; // This won't be sent from backend for security reasons
    full_name?: string;
    phone?: string;
    role: string;
    additional_info?: any; // JSONB field - can contain any structure
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_login?: string;
    deleted_at?: string;
    roles?: string[]; // Array of roles
    subscription_tier?: string;
    subscription_expires_at?: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    username: string;
    full_name?: string;
}

export interface SignupResponse {
    success: boolean;
    data?: {
        user: User;
    };
    error?: {
        message: string;
    };
}

export const AuthService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        if (ENV.IS_DEMO_MODE) {
            // Force demo mode if env var is set
            return AuthService.loginDemo();
        }

        try {
            // OAuth2PasswordRequestForm expects form data, not JSON
            const formData = new URLSearchParams();
            formData.append('username', email);  // FastAPI OAuth2 expects 'username' field (can contain email)
            formData.append('password', password);

            // Step 1: Login to get the access token
            const loginResponse = await api.post('/api/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            // Store the access token securely (need to set it in axios header for subsequent requests)
            const accessToken = loginResponse.data.access_token;
            if (accessToken) {
                await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
                // Set the token in the default headers for subsequent requests
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }

            // Step 2: Get user information using the /me endpoint
            const userResponse = await api.get('/api/auth/me');

            // Store both access and refresh tokens securely (if refresh token endpoint is added later)
            // For now, we only get access token from login

            // Transform the response to match the expected user structure in useAuthStore
            const transformedUser = {
                id: userResponse.data.id,
                name: userResponse.data.full_name || userResponse.data.username,
                role: userResponse.data.role,
                store_ids: [userResponse.data.store_id] || [1], // Default to [1] if not available
                username: userResponse.data.username,
                email: userResponse.data.email,
                full_name: userResponse.data.full_name,
                is_active: true, // Assuming active, as login was successful
                created_at: '', // Will be filled if available from backend
                updated_at: '', // Will be filled if available from backend
                last_login: new Date().toISOString(), // Using current time as last login
                roles: userResponse.data.role ? [userResponse.data.role] : ['user'], // Assuming single role as array
                subscription_tier: userResponse.data.subscription_tier,
                subscription_expires_at: userResponse.data.subscription_expires_at,
            };

            return {
                success: true,
                data: {
                    user: transformedUser as User,
                    access_token: accessToken,
                    refresh_token: '' // No refresh token currently from backend
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.response?.data?.detail || error.message || '로그인에 실패했습니다'
                }
            };
        }
    },

    signup: async (email: string, password: string, username: string, full_name?: string): Promise<SignupResponse> => {
        try {
            const response = await api.post('/api/auth/signup', {
                email,
                password,
                username,
                full_name
            });
            return {
                success: true,
                data: {
                    user: response.data.user
                }
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.response?.data?.detail || error.message || '회원가입에 실패했습니다'
                }
            };
        }
    },

    // Refresh the access token using the refresh token
    refreshToken: async (): Promise<TokenRefreshResponse> => {
        // Currently we don't have a backend refresh endpoint set up
        // For now, we'll return a failure which will cause a logout
        // when the token expires
        console.log('Token refresh attempted, but no refresh endpoint available');
        return {
            success: false,
            error: {
                message: 'Refresh token endpoint not implemented yet'
            }
        };
    },

    // Check if user is authenticated by checking for stored tokens
    checkAuth: async (): Promise<boolean> => {
        try {
            const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
            if (accessToken) {
                // Token exists, but check if it's expired
                if (AuthService.isTokenExpired(accessToken)) {
                    // Token is expired, try to refresh it
                    const refreshResult = await AuthService.refreshToken();
                    if (refreshResult.success && refreshResult.data?.access_token) {
                        // Successfully refreshed, token is valid
                        return true;
                    } else {
                        // Refresh failed, clear tokens and return false
                        await AuthService.logout();
                        return false;
                    }
                }
                // Token exists and is not expired
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return false;
        }
    },

    // Check if the access token is expired by decoding it
    isTokenExpired: (token: string | null): boolean => {
        if (!token) return true;

        try {
            // Decode JWT token without verification to check expiration
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('Invalid JWT token format');
                return true; // Invalid JWT
            }

            // Decode the payload (second part of JWT)
            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // Return true if token is expired (with 1 minute buffer)
            // If 'exp' field doesn't exist, assume token is valid
            if (payload.exp === undefined) {
                console.warn('JWT token has no expiration field, assuming valid');
                return false;
            }

            return payload.exp < currentTime + 60;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true; // Assume expired if we can't decode it
        }
    },

    // Clear all stored tokens (logout)
    logout: async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            // Note: We don't have refresh tokens currently, but keeping in case we add them later
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    },

    // Get the stored access token
    getAccessToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    },

    // Get the stored refresh token
    getRefreshToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    },

    loginDemo: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            data: {
                access_token: 'demo-token-bypass',
                refresh_token: 'demo-refresh-token-bypass',
                user: {
                    id: 999,
                    name: '현장 운영자 (데모)',
                    role: 'operator',
                    store_ids: [1],
                    username: 'demo_user',
                    email: 'demo@signalcraft.com',
                    full_name: '현장 운영자 (데모)',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                    roles: ['operator'],
                    subscription_tier: 'basic',
                    subscription_expires_at: null
                }
            }
        };
    }
};
