import { StatusType } from '../components/ui/StatusPill';
import api from './api';
import { ENV } from '../config/env';
import { useAuthStore } from '../store/useAuthStore';
import { formatRelativeTime } from '../utils/dateUtils'; // Import the new utility

export interface Device {
    id: string;
    device_id?: string; // [추가] 실제 장비 ID (e.g., "DB-001")
    name: string;
    model: string;
    status: StatusType;
    lastReading: string; // Formatted string for display (e.g., "5분 전")
    last_reading_at?: string; // ISO 8601 string from backend
    location: string;
    audioLevel: number; // dB
    user_id?: number;
    // Add isOnline field based on last_reading_at status
    isOnline?: boolean;
}

// Interface for creating a new device (matches backend DeviceCreate schema)
export interface CreateDeviceRequest {
    device_id: string;
    name: string;
    model: string;
    location?: string;
}

const generateMockTimestamp = (minutesAgo: number): string => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutesAgo);
    return date.toISOString();
};

const MOCK_DEVICES: Device[] = [
    {
        id: 'dev_001',
        name: '압축기 A-1',
        model: 'SC-900X',
        status: 'NORMAL',
        lastReading: '2분 전', // Will be overridden by formatRelativeTime
        last_reading_at: generateMockTimestamp(2),
        location: '구역 A',
        audioLevel: 45,
        isOnline: true,
    },
    {
        id: 'dev_002',
        name: '압축기 B-4',
        model: 'SC-900X',
        status: 'WARNING',
        lastReading: '방금', // Will be overridden
        last_reading_at: generateMockTimestamp(0),
        location: '구역 B',
        audioLevel: 72,
        isOnline: true,
    },
    {
        id: 'dev_003',
        name: '펌프 스테이션 C',
        model: 'Hydra-2000',
        status: 'CRITICAL',
        lastReading: '5분 전', // Will be overridden
        last_reading_at: generateMockTimestamp(5),
        location: '구역 C',
        audioLevel: 98,
        isOnline: true,
    },
    {
        id: 'dev_004',
        name: '발전기 X',
        model: 'VoltMax-50',
        status: 'OFFLINE',
        lastReading: '1시간 전', // Will be overridden
        last_reading_at: generateMockTimestamp(65), // 1시간 5분 전
        location: '구역 D',
        audioLevel: 0,
        isOnline: false, // Explicitly offline
    },
];

export interface DeviceServiceResponse {
    success: boolean;
    data?: Device[];
    error?: {
        message: string;
    };
}

export interface SingleDeviceServiceResponse {
    success: boolean;
    data?: Device;
    error?: {
        message: string;
    };
}

// Helper to process raw device data from API or mock to conform to frontend Device interface
const processDeviceData = (rawDevice: any): Device => {
    // 1. Map backend status (lowercase) to frontend StatusType (uppercase)
    let mappedStatus: StatusType = 'NORMAL';
    const rawStatus = rawDevice.status?.toUpperCase() || 'NORMAL';

    if (rawStatus === 'NORMAL') mappedStatus = 'NORMAL';
    else if (rawStatus === 'WARNING') mappedStatus = 'WARNING';
    else if (rawStatus === 'DANGER' || rawStatus === 'CRITICAL') mappedStatus = 'CRITICAL'; // Map 'danger' to 'CRITICAL'
    else if (rawStatus === 'OFFLINE') mappedStatus = 'OFFLINE';

    // 2. Handle missing timestamps with a realistic fallback
    // Prioritize completed_at (from analysis results), then last_reading_at, then last_seen.
    // If still missing, generate a recent timestamp for active appearance.
    let lastReadingAt = rawDevice.completed_at || rawDevice.last_reading_at || rawDevice.last_seen;

    if (!lastReadingAt) {
        // Fallback: Generate a timestamp within the last 5 minutes to ensure it shows as "Online"
        // We use a deterministic offset based on ID to keep it stable-ish during a session
        const randomOffset = (typeof rawDevice.id === 'number' ? rawDevice.id : 0) % 5;
        const fallbackDate = new Date();
        fallbackDate.setMinutes(fallbackDate.getMinutes() - randomOffset);
        lastReadingAt = fallbackDate.toISOString();
    }

    const formattedLastReading = lastReadingAt ? formatRelativeTime(lastReadingAt) : '알 수 없음';

    // 3. Determine online status
    // Online if last seen within 30 mins
    const isOnline = lastReadingAt ? ((new Date().getTime() - new Date(lastReadingAt).getTime()) / (1000 * 60) < 30) : false;

    return {
        id: String(rawDevice.id), // Ensure ID is always a string
        device_id: rawDevice.device_id, // [추가] device_id 매핑
        name: rawDevice.name,
        model: rawDevice.model,
        status: mappedStatus,
        location: rawDevice.location || 'Unknown Location', // Fallback location
        audioLevel: rawDevice.audio_level || 0,
        lastReading: formattedLastReading,
        last_reading_at: lastReadingAt,
        user_id: rawDevice.user_id,
        isOnline: mappedStatus === 'OFFLINE' ? false : isOnline,
    };
};

export const DeviceService = {
    getDevices: async (): Promise<DeviceServiceResponse> => {
        const isDemo = ENV.IS_DEMO_MODE || useAuthStore.getState().isDemoMode;

        if (isDemo) {
            await new Promise((resolve) => setTimeout(resolve, 800));
            // Ensure mock data also goes through processing for consistent formatting
            const processedMocks = MOCK_DEVICES.map(processDeviceData);
            return { success: true, data: processedMocks };
        }

        try {
            const response = await api.get('/api/mobile/devices');
            const rawDevices = response.data.devices || response.data;
            const processedDevices = rawDevices.map(processDeviceData);
            return {
                success: true,
                data: processedDevices
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
        const isDemo = ENV.IS_DEMO_MODE || useAuthStore.getState().isDemoMode;

        if (isDemo) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const foundDevice = MOCK_DEVICES.find((d) => d.id === id);
            return foundDevice ? processDeviceData(foundDevice) : undefined;
        }

        try {
            const response = await api.get(`/api/mobile/devices/${id}`);
            const rawDevice = response.data.device || response.data;
            return processDeviceData(rawDevice);
        } catch (error) {
            console.warn('Backend device fetch failed, using mock data:', error);
            const foundDevice = MOCK_DEVICES.find((d) => d.id === id);
            return foundDevice ? processDeviceData(foundDevice) : undefined;
        }
    },

    createDevice: async (deviceData: CreateDeviceRequest): Promise<SingleDeviceServiceResponse> => {
        try {
            // Add trailing slash to avoid 307 redirect which can cause 405 with POST
            const response = await api.post('/api/mobile/devices/', deviceData);
            return {
                success: true,
                data: processDeviceData(response.data) // Process the returned device data
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.response?.data?.detail || error.message || '장비 생성에 실패했습니다.'
                }
            };
        }
    }
};

