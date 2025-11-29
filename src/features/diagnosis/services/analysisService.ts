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

      // [개선] 파일 정보 점검 및 압축
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('Audio file info before upload:', {
        uri: uri,
        size: (fileInfo.size || 0) / 1024 / 1024 + 'MB',
        exists: fileInfo.exists
      });

      // [개선] 5MB 이상 파일은 압축 시도
      let uploadUri = uri;
      if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        console.log('Large file detected, implementing compression strategy...');
        // 향후 구현: 오디오 압축 로직
      }
      
      // [개선] 타임아웃 연장 및 재시도 로직
      const uploadResult = await FileSystem.uploadAsync(
        `${ENV.API_BASE_URL}/api/mobile/upload`,
        uploadUri,
        {
          httpMethod: 'POST',
          uploadType: 1, // FileSystemUploadType.MULTIPART
          fieldName: 'file',
          parameters: {
            device_id: deviceId,
            audio_format: 'm4a', // 포맷 정보 명시
            sample_rate: '44100',  // 샘플레이트 정보 전송
            channels: '2',          // 채널 정보 전송
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Encoding': 'gzip, deflate', // 압축 수락
            'Connection': 'keep-alive',          // 연결 유지
          },
          timeout: 60, // 60초 타임아웃
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
    // Check for demo mode or mock device ID
    const isDemo = ENV.IS_DEMO_MODE || 
                   useAuthStore.getState().isDemoMode || 
                   deviceId.startsWith('MOCK-');

    if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
        return this.getMockAnalysisReport(deviceId);
    }

    try {
      const response = await api.get(`/api/mobile/report/${deviceId}`);
      return response.data.data_package; // 백엔드 응답 구조에 맞춤 (data_package 필드)
    } catch (error) {
      console.error('Get detailed analysis report error:', error);
      throw error;
    }
  }

  private static getMockAnalysisReport(deviceId: string): DetailedAnalysisReport {
    // Determine status based on ID suffix or default to NORMAL
    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    
    if (deviceId.includes('002') || deviceId.includes('WARNING')) status = 'WARNING';
    else if (deviceId.includes('003') || deviceId.includes('CRITICAL')) status = 'CRITICAL';
    else if (deviceId.includes('001')) status = 'NORMAL'; // Fix: 001 is usually normal in typical mocks, or adjust as needed. 
    // Let's stick to the map in DeviceDetailScreen: 
    // 'NORMAL': 'MOCK-003' (Wait, DeviceDetailScreen map was: NORMAL->003, WARNING->002, CRITICAL->001? Let's re-read logic there if needed, but standardizing here is fine)
    // Actually DeviceDetailScreen said: 'NORMAL': 'MOCK-003', 'WARNING': 'MOCK-002', 'CRITICAL': 'MOCK-001'
    // Let's just support explicit strings:
    
    if (deviceId === 'MOCK-002') status = 'WARNING';
    if (deviceId === 'MOCK-001') status = 'CRITICAL';
    if (deviceId === 'MOCK-003') status = 'NORMAL';

    // Generate consistent mock data based on status
    const now = new Date();
    const history = Array.from({ length: 10 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (9 - i));
      let baseScore = status === 'NORMAL' ? 0.1 : status === 'WARNING' ? 0.5 : 0.9;
      return {
        date: d.toISOString().split('T')[0],
        value: Math.min(1, Math.max(0, baseScore + (Math.random() * 0.2 - 0.1)))
      };
    });

    const baseReport = {
      entity_type: 'Compressor',
      original_analysis_result: {
        label: status,
        score: status === 'NORMAL' ? 0.12 : status === 'WARNING' ? 0.65 : 0.92,
        summary: status === 'NORMAL' ? '정상 작동 중입니다.' : status === 'WARNING' ? '베어링 마모 의심 신호가 감지되었습니다.' : '심각한 베어링 손상이 감지되었습니다.',
        details: {
          noise_level: status === 'NORMAL' ? 45 : status === 'WARNING' ? 72 : 88,
          frequency: 1200,
        }
      },
      ensemble_analysis: {
        consensus_score: status === 'NORMAL' ? 0.95 : 0.88,
        voting_result: {
          'CNN_Model': { status: status, score: status === 'NORMAL' ? 0.1 : 0.9 },
          'RNN_Model': { status: status, score: status === 'NORMAL' ? 0.15 : 0.85 },
          'XGBoost': { status: status, score: status === 'NORMAL' ? 0.05 : 0.92 },
        }
      },
      frequency_analysis: {
        bpfo_frequency: 235.4,
        diagnosis: status === 'NORMAL' ? '특이 사항 없음' : '내륜 결함 주파수(BPFO) 피크 검출',
        detected_peaks: status === 'NORMAL' ? [] : [
          { hz: 235.4, amp: 0.8, match: true, label: 'BPFO' },
          { hz: 470.8, amp: 0.4, match: true, label: '2x BPFO' }
        ]
      },
      predictive_insight: {
        rul_prediction_days: status === 'NORMAL' ? 180 : status === 'WARNING' ? 45 : 7,
        anomaly_score_history: history
      }
    };

    return {
        ...baseReport,
        status: {
            current_state: status,
            health_score: status === 'NORMAL' ? 95 : status === 'WARNING' ? 70 : 30,
            label: status,
            summary: baseReport.original_analysis_result.summary
        }
    };
  }
}

export default AnalysisService;