import { create } from 'zustand';
import { AuthService } from '../services/auth';

interface User {
    id: number;
    name: string;
    role: string;
    store_ids: number[];
    username?: string;
    email?: string;
    full_name?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
    roles?: string[];
    subscription_tier?: string;
    subscription_expires_at?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isDemoMode: boolean;
    isLoading: boolean;
    isAdmin: boolean; // Add isAdmin to the AuthState interface

    login: (user: User, token: string, isDemo?: boolean) => void;
    loginDemo: () => void;
    logout: () => void;
    checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isDemoMode: false,
    isLoading: true, // Initially loading until we check auth status
    isAdmin: false, // Default isAdmin to false

    login: (user, token, isDemo = false) => set((state) => ({
        user,
        token,
        isAuthenticated: true,
        isDemoMode: isDemo,
        isLoading: false,
        isAdmin: user.role?.toLowerCase() === 'admin', // Set isAdmin based on user role
    })),

    loginDemo: () => set((state) => ({
        user: { id: 999, name: '데모 운영자', role: 'operator', store_ids: [1], username: 'demo_user', email: 'demo@signalcraft.com', full_name: '현장 운영자 (데모)' },
        token: 'demo-token',
        isAuthenticated: true,
        isDemoMode: true,
        isLoading: false,
        isAdmin: false, // Demo user is not admin
    })),

    logout: async () => {
        // Clear tokens from secure storage
        await AuthService.logout();
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isDemoMode: false,
            isLoading: false,
            isAdmin: false, // Reset isAdmin on logout
        });
    },

    checkAuthStatus: async () => {
        set({ isLoading: true });

        try {
            // Check if we have a stored access token
            const hasToken = await AuthService.checkAuth();

            if (hasToken) {
                // Get the access token
                const token = await AuthService.getAccessToken();

                if (token) {
                    // Check if the token is expired
                    if (AuthService.isTokenExpired(token)) {
                        // Try to refresh the token
                        try {
                            const refreshResult = await AuthService.refreshToken();
                            if (refreshResult.success && refreshResult.data?.access_token) {
                                // Update with the new token
                                set({
                                    token: refreshResult.data.access_token,
                                    isAuthenticated: true,
                                    isDemoMode: false,
                                    isLoading: false,
                                });
                                return;
                            } else {
                                // If refresh failed, clear tokens and remain unauthenticated
                                set({
                                    user: null,
                                    token: null,
                                    isAuthenticated: false,
                                    isDemoMode: false,
                                    isLoading: false,
                                    isAdmin: false,
                                });
                                return;
                            }
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                            // Clear tokens and remain unauthenticated
                            set({
                                user: null,
                                token: null,
                                isAuthenticated: false,
                                isDemoMode: false,
                                isLoading: false,
                                isAdmin: false,
                            });
                            return;
                        }
                    } else {
                        // Token is valid, set it in the store
                        // TODO: Re-fetch user data to populate user object and isAdmin after refresh
                        set({
                            token,
                            isAuthenticated: true,
                            isDemoMode: false,
                            isLoading: false,
                            // isAdmin will remain default false here until user data is re-fetched
                        });
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }

        // If no token or error, set loading to false
        set({ isLoading: false, isAdmin: false });
    },
}));
