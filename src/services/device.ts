import { StatusType } from '../components/ui/StatusPill';

export interface Device {
    id: string;
    name: string;
    model: string;
    status: StatusType;
    lastReading: string;
    location: string;
    audioLevel: number; // dB
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

export const DeviceService = {
    getDevices: async (): Promise<{ success: boolean; data: Device[] }> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { success: true, data: MOCK_DEVICES };
    },

    getDeviceById: async (id: string): Promise<Device | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_DEVICES.find((d) => d.id === id);
    },
};
