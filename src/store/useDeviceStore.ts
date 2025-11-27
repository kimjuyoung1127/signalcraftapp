import { create } from 'zustand';
import { Device, DeviceService } from '../services/device';

interface DeviceState {
    devices: Device[];
    isLoading: boolean;
    error: string | null;
    selectedDevice: Device | null;
    fetchDevices: () => Promise<void>;
    selectDevice: (device: Device) => void;
    updateDeviceStatus: (id: string, status: Device['status']) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
    devices: [],
    isLoading: false,
    error: null,
    selectedDevice: null,

    fetchDevices: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await DeviceService.getDevices();
            if (response.success) {
                set({ devices: response.data });
            } else {
                set({ error: response.error?.message || 'Failed to fetch devices' });
            }
        } catch (error: any) {
            console.error('Failed to fetch devices', error);
            set({ error: error.message || 'Unknown error' });
        } finally {
            set({ isLoading: false });
        }
    },

    selectDevice: (device) => set({ selectedDevice: device }),

    updateDeviceStatus: (id, status) =>
        set((state) => ({
            devices: state.devices.map((d) =>
                d.id === id ? { ...d, status } : d
            ),
            selectedDevice:
                state.selectedDevice?.id === id
                    ? { ...state.selectedDevice, status }
                    : state.selectedDevice,
        })),
}));
