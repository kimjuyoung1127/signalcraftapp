import { create } from 'zustand';
import { Device, DeviceService } from '../services/device';

interface DeviceState {
    devices: Device[];
    isLoading: boolean;
    selectedDevice: Device | null;
    fetchDevices: () => Promise<void>;
    selectDevice: (device: Device) => void;
    updateDeviceStatus: (id: string, status: Device['status']) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
    devices: [],
    isLoading: false,
    selectedDevice: null,

    fetchDevices: async () => {
        set({ isLoading: true });
        try {
            const response = await DeviceService.getDevices();
            if (response.success) {
                set({ devices: response.data });
            }
        } catch (error) {
            console.error('Failed to fetch devices', error);
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
