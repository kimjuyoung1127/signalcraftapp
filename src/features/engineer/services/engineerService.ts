import api from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthService } from '../../../services/auth';

export interface DeviceConfigUpdatePayload {
  threshold_multiplier?: number;
  sensitivity_level?: 'HIGH' | 'MEDIUM' | 'LOW';
}

class EngineerService {
  static async updateDeviceConfig(
    deviceId: string,
    payload: DeviceConfigUpdatePayload
  ): Promise<{ success: boolean; message: string; calibration_data: any }> {
    try {
      let token = useAuthStore.getState().token;
      if (!token) {
        token = await AuthService.getAccessToken();
      }

      const response = await api.patch(
        `/api/mobile/devices/${deviceId}/config`, // PATCH 엔드포인트
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update device configuration:', error);
      throw error;
    }
  }
}

export default EngineerService;