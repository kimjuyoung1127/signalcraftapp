import { StatusType } from '../components/ui/StatusPill';
import api from './api';
import { ENV } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';

export interface Device {
    id: string;
    name: string;
    model: string;
    status: StatusType;
    lastReading: string;
    location: string;
    audioLevel: number; // dB
    // Additional fields that may come from backend
    last_seen?: string;
    user_id?: number;
}

const MOCK_DEVICES: Device[] = [
    {
        id: 'dev_001',
        name: '압축기 A-1',
        model: 'SC-900X',
        status: 'NORMAL',
        lastReading: '2분 전',
        location: '구역 A',
        audioLevel: 45,
    },
    {
        id: 'dev_002',
        name: '압축기 B-4',
        model: 'SC-900X',
        status: 'WARNING',
        lastReading: '방금',
        location: '구역 B',
        audioLevel: 72,
    },
    {
        id: 'dev_003',
        name: '펌프 스테이션 C',
        model: 'Hydra-2000',
        status: 'CRITICAL',
        lastReading: '5분 전',
        location: '구역 C',
        audioLevel: 98,
    },
    {
        id: 'dev_004',
        name: '발전기 X',
        model: 'VoltMax-50',
        status: 'OFFLINE',
        lastReading: '1시간 전',
        location: '구역 D',
        audioLevel: 0,
    },
];

export interface DeviceServiceResponse {
    success: boolean;
    data?: Device[];
    error?: {
        message: string;
    };
}

export const DeviceService = {
    getDevices: async (): Promise<DeviceServiceResponse> => {
        // Check both static env config and runtime store state
        const isDemo = ENV.IS_DEMO_MODE || useAuthStore.getState().isDemoMode;

        if (isDemo) {
            // Simulate network delay for demo
            await new Promise((resolve) => setTimeout(resolve, 800));
            return { success: true, data: MOCK_DEVICES };
        }

        try {
            const response = await api.get('/api/mobile/devices');
            return {
                success: true,
                data: response.data.devices || response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.response?.data?.detail || error.message || '장비 목록을 불러오는데 실패했습니다'
                }
            };
        }
    },

    getDeviceById: async (id: string): Promise<Device | undefined> => {
        // Check both static env config and runtime store state
        const isDemo = ENV.IS_DEMO_MODE || useAuthStore.getState().isDemoMode;

        if (isDemo) {
            // Simulate network delay for demo
            await new Promise((resolve) => setTimeout(resolve, 500));
            return MOCK_DEVICES.find((d) => d.id === id);
        }

        try {
            // Try to get from the backend first
            const response = await api.get(`/api/mobile/devices/${id}`);
            return response.data.device || response.data;
        } catch (error) {
            // Fallback to mock data if backend fails
            console.warn('Backend device fetch failed, using mock data:', error);
            return MOCK_DEVICES.find((d) => d.id === id);
        }
    },
};
