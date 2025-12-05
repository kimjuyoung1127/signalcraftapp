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
            console.log('[useDeviceStore] Fetching devices...');
            const response = await DeviceService.getDevices();
            // console.log('[useDeviceStore] DeviceService response:', JSON.stringify(response, null, 2));

            if (response.success) {
                console.log(`[useDeviceStore] Successfully fetched ${response.data?.length} devices.`);
                set({ devices: response.data });
            } else {
                console.error('[useDeviceStore] Failed to fetch devices:', response.error?.message);
                set({ error: response.error?.message || 'Failed to fetch devices' });
            }
        } catch (error: any) {
            console.error('[useDeviceStore] Exception in fetchDevices:', error);
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
    
    removeDevice: async (deviceId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DeviceService.deleteDevice(deviceId);
            if (response.success) {
                set((state) => ({
                    devices: state.devices.filter((d) => d.device_id !== deviceId),
                }));
                console.log(`[useDeviceStore] Successfully removed device: ${deviceId}`);
            } else {
                console.error('[useDeviceStore] Failed to remove device:', response.error?.message);
                set({ error: response.error?.message || 'Failed to remove device' });
            }
        } catch (error: any) {
            console.error('[useDeviceStore] Exception in removeDevice:', error);
            set({ error: error.message || 'Unknown error during device removal' });
        } finally {
            set({ isLoading: false });
        }
    },
}));
