import * as FileSystem from 'expo-file-system/legacy';
import api from '../../../services/api';
import { ENV } from '../../../config/env';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthService } from '../../../services/auth';

// --- 새로운 상세 분석 리포트 데이터 타입 정의 ---
interface StatusData {
  current_state: 'NORMAL' | 'WARNING' | 'CRITICAL';
  health_score: number;
  label: 'NORMAL' | 'WARNING' | 'CRITICAL';
  summary: string;
}

interface VotingResult {
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  score: number;
}

interface EnsembleAnalysisData {
  consensus_score: number;
  voting_result: {
    [modelName: string]: VotingResult;
  };
}

interface DetectedPeak {
  hz: number;
  amp: number;
  match: boolean;
  label?: string;
}

interface FrequencyAnalysisData {
  bpfo_frequency: number;
  detected_peaks: DetectedPeak[];
  diagnosis: string;
}

interface AnomalyScoreHistory {
  date: string;
  value: number;
}

interface PredictiveInsightData {
  rul_prediction_days: number;
  anomaly_score_history: AnomalyScoreHistory[];
}

export interface DetailedAnalysisReport {
  entity_type: string;
  status: StatusData;
  ensemble_analysis: EnsembleAnalysisData;
  frequency_analysis: FrequencyAnalysisData;
  predictive_insight: PredictiveInsightData;
  original_analysis_result?: { // 실제 DB 결과의 원본 데이터 (호환용)
    label: 'NORMAL' | 'WARNING' | 'CRITICAL';
    score: number;
    summary: string;
    details?: {
      noise_level: number;
      vibration?: number; // DB엔 없는 필드이므로 Optional
      frequency: number;
      duration?: number;
    };
  }; 
}
// --- 기존 인터페이스 ---
export interface AnalysisResult {
  label: 'NORMAL' | 'WARNING' | 'CRITICAL';
  score: number;
  summary: string;
  details?: {
    noise_level: number;
    vibration?: number; // 백엔드에서 제거됨
    frequency: number;
    duration?: number;
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
  static async uploadAudio(uri: string, deviceId: string): Promise<string> {
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
          parameters: {
            device_id: deviceId,
          },
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

  /**
   * 장비 ID를 사용하여 상세 분석 리포트 데이터를 조회합니다.
   * @param deviceId 장비 ID
   * @returns 상세 분석 리포트 (데모 또는 실제 데이터)
   */
  static async getDetailedAnalysisReport(deviceId: string): Promise<DetailedAnalysisReport> {
    try {
      const response = await api.get(`/api/mobile/report/${deviceId}`);
      return response.data.data_package; // 백엔드 응답 구조에 맞춤 (data_package 필드)
    } catch (error) {
      console.error('Get detailed analysis report error:', error);
      throw error;
    }
  }
}

export default AnalysisService;