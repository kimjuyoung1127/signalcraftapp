import api from './api';
import { ENV } from '../config/env';

export const AuthService = {
    login: async (email: string, password: string) => {
        if (ENV.IS_DEMO_MODE) {
            // Force demo mode if env var is set
            return AuthService.loginDemo();
        }

        try {
            const response = await api.post('/api/mobile/login', { email, password });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    loginDemo: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            success: true,
            data: {
                token: 'demo-token-bypass',
                user: {
                    id: 999,
                    name: '현장 운영자 (데모)',
                    role: 'operator',
                    store_ids: [1, 2]
                }
            }
        };
    }
};
