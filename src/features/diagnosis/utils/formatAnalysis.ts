import { AnalysisResult } from '../services/analysisService';

export const formatScoreToText = (score: number): string => {
  // ML Anomaly Score: usually -0.5 (abnormal) to 0.5 (normal)
  // Normalized Score in App: 0.0 (Normal) to 1.0 (Critical)
  
  if (score >= 0.8) return '심각한 위험 (즉시 조치)';
  if (score >= 0.6) return '위험 (점검 요망)';
  if (score >= 0.4) return '주의 (관찰 필요)';
  if (score >= 0.2) return '양호 (특이사항 없음)';
  return '정상 (최적 상태)';
};

export const formatConfidence = (score: number): string => {
  // Convert normalized score (0~1) to confidence percentage
  // High score (Critical) -> High Confidence of Fault
  // Low score (Normal) -> High Confidence of Normal
  const confidence = score > 0.5 ? score : (1.0 - score);
  return `${(confidence * 100).toFixed(0)}%`;
};

export const formatMethodName = (method: string): string => {
  if (method === 'Hybrid ML') return 'AI 정밀 진단 (Hybrid)';
  if (method === 'Rule-based') return '기본 패턴 분석';
  return method || '알 수 없음';
};

export const formatFrequencyDiagnosis = (peaks: number[]): string => {
  if (!peaks || peaks.length === 0) return '특이 주파수 성분 없음.';
  
  // Check for bearing fault frequencies (Generic ranges)
  const hasLowFreq = peaks.some(f => f > 0 && f < 500); // BPFO/BPFI/FTF range approx
  const hasHighFreq = peaks.some(f => f > 2000); // Resonance range

  if (hasLowFreq && hasHighFreq) return '베어링 결함 및 고주파 공진 감지됨.';
  if (hasLowFreq) return '회전체 결함 주파수(BPFO/BPFI) 의심 성분 감지.';
  if (hasHighFreq) return '고주파 대역 에너지 증가 (초기 결함 의심).';
  
  return `${peaks.length}개의 미확인 주파수 피크 감지됨.`;
};

// For debugging purposes
export const debugAnalysisData = (result: AnalysisResult) => {
  console.log("--- [DEBUG] Analysis Result Data Formatting ---");
  console.log(`Label: ${result.label}`);
  console.log(`Raw Score: ${result.score}`);
  console.log(`Formatted Score: ${formatScoreToText(result.score)}`);
  if (result.details) {
    console.log(`Method: ${result.details.method} -> ${formatMethodName(result.details.method || '')}`);
    // @ts-ignore
    if (result.details.ml_anomaly_score !== undefined) {
       // @ts-ignore
      console.log(`ML Anomaly Score: ${result.details.ml_anomaly_score}`);
    }
    // @ts-ignore
    if (result.details.peak_frequencies) {
       // @ts-ignore
      console.log(`Peak Frequencies: ${JSON.stringify(result.details.peak_frequencies)} -> ${formatFrequencyDiagnosis(result.details.peak_frequencies)}`);
    }
  }
  console.log("-----------------------------------------------");
};
