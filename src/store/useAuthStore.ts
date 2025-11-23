import { create } from 'zustand';

interface User {
    id: number;
    name: string;
    role: string;
    store_ids: number[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isDemoMode: boolean;

    login: (user: User, token: string) => void;
    loginDemo: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isDemoMode: false,

    login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isDemoMode: false
    }),

    loginDemo: () => set({
        user: { id: 999, name: '데모 운영자', role: 'operator', store_ids: [1] },
        token: 'demo-token',
        isAuthenticated: true,
        isDemoMode: true
    }),

    logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isDemoMode: false
    }),
}));
