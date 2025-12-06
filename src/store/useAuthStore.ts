import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
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
    isLoading: boolean;
    isAdmin: boolean;
    hasSeenOnboarding: boolean;

    login: (user: User, token: string, isDemo?: boolean) => void;
    logout: () => void;
    checkAuthStatus: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    hasSeenOnboarding: false,

    login: (user, token) => set((state) => ({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: user.role?.toLowerCase() === 'admin',
    })),

    logout: async () => {
        await AuthService.logout();
        set((state) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isAdmin: false,
            // hasSeenOnboarding is deliberately NOT reset
            hasSeenOnboarding: state.hasSeenOnboarding 
        }));
    },

    checkAuthStatus: async () => {
        set({ isLoading: true });

        try {
            // Check onboarding status
            const onboardingStatus = await SecureStore.getItemAsync('hasSeenOnboarding');
            const hasSeenOnboarding = onboardingStatus === 'true';

            // Check auth token
            const hasToken = await AuthService.checkAuth();

            if (hasToken) {
                const token = await AuthService.getAccessToken();

                if (token) {
                    if (AuthService.isTokenExpired(token)) {
                        try {
                            const refreshResult = await AuthService.refreshToken();
                            if (refreshResult.success && refreshResult.data?.access_token) {
                                set({
                                    token: refreshResult.data.access_token,
                                    isAuthenticated: true,
                                    isLoading: false,
                                    hasSeenOnboarding,
                                });
                                return;
                            }
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                        }
                    } else {
                        set({
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            hasSeenOnboarding,
                        });
                        return;
                    }
                }
            }
            
            // Update state even if not authenticated
            set({ 
                hasSeenOnboarding,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                isAdmin: false,
            });
        } catch (error) {
            console.error('Error checking auth status:', error);
            set({ isLoading: false, isAdmin: false });
        }
    },

    completeOnboarding: async () => {
        try {
            await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
            set({ hasSeenOnboarding: true });
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    },
}));
