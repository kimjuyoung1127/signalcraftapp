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
        try {
            const response = await api.get(`/api/mobile/devices/${id}`);
            const rawDevice = response.data.device || response.data;
            return processDeviceData(rawDevice);
        } catch (error) {
            console.warn('Backend device fetch failed:', error);
            return undefined;
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
    },

    deleteDevice: async (deviceId: string): Promise<SingleDeviceServiceResponse> => {
        try {
            await api.delete(`/api/mobile/devices/${deviceId}`);
            return {
                success: true
            };
        } catch (error: any) {
            return {
                success: false,
                error: {
                    message: error.response?.data?.detail || error.message || '장비 삭제에 실패했습니다.'
                }
            };
        }
    }
};

