import * as FileSystem from 'expo-file-system/legacy';
import api from '../../../services/api';
import { ENV } from '../../../config/env';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthService } from '../../../services/auth';

export interface AnalysisResult {
  label: 'NORMAL' | 'WARNING' | 'CRITICAL';
  score: number;
  summary: string;
  details?: {
    noise_level: number;
    vibration: number;
    frequency: number;
  };
}

export interface AnalysisTaskResponse {
  task_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result?: AnalysisResult;
  created_at: string;
}

class AnalysisService {
  /**
   * 오디오 파일을 서버로 업로드하고 분석 작업을 시작합니다.
   * @param uri 녹음된 오디오 파일의 로컬 URI
   * @returns 생성된 작업의 ID (task_id)
   */
  static async uploadAudio(uri: string): Promise<string> {
    try {
      // 토큰 가져오기
      let token = useAuthStore.getState().token;
      if (!token) {
          token = await AuthService.getAccessToken();
      }
      
      const uploadResult = await FileSystem.uploadAsync(
        `${ENV.API_BASE_URL}/api/mobile/upload`,
        uri,
        {
          httpMethod: 'POST',
          uploadType: 1, // FileSystemUploadType.MULTIPART
          fieldName: 'file',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (uploadResult.status !== 200) {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }

      const responseData = JSON.parse(uploadResult.body);
      // [수정] responseData.data.task_id -> responseData.task_id (백엔드 응답 구조 맞춤)
      return responseData.task_id;
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  }

  /**
   * 작업 ID를 사용하여 분석 결과를 조회합니다.
   * @param taskId 작업 ID
   * @returns 분석 작업 상태 및 결과
   */
  static async getAnalysisResult(taskId: string): Promise<AnalysisTaskResponse> {
    try {
      const response = await api.get(`/api/mobile/result/${taskId}`);
      // [수정] response.data.data -> response.data (백엔드 응답 구조 맞춤)
      return response.data;
    } catch (error) {
      console.error('Get analysis result error:', error);
      throw error;
    }
  }
}

export default AnalysisService;