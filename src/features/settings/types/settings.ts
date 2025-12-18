// src/features/settings/types/settings.ts
// 확장형 설정 타입 정의

/**
 * 오디오 입력 관련 설정
 * 마이크 입력 감도 및 노이즈 필터링 옵션
 */
export interface AudioSettings {
  inputGain: number; // 0.0 ~ 2.0 범위의 소프트웨어 게인
  noiseGateEnabled: boolean; // 노이즈 게이트 활성화 여부
  noiseGateThreshold: number; // 데시벨 기준치 (예: -40dB)
  normalizeAudio: boolean; // 오디오 정규화 여부
}

/**
 * 시각화 관련 설정
 * 그래프 및 스펙트로그램 스타일
 */
export interface VisualSettings {
  colorMap: 'cyberpunk' | 'inferno' | 'grayscale' | 'viridis' | 'plasma';
  showGrid: boolean;
  animationSpeed: number; // 0.5 ~ 2.0 범위
  contrastLevel: number; // 0.0 ~ 1.0 범위
}

/**
 * 동기화 및 네트워크 설정
 * 데이터 업로드 및 캐시 관리
 */
export interface SyncSettings {
  wifiOnlyUpload: boolean; // 와이파이 환경에서만 업로드
  autoUploadEnabled: boolean; // 자동 업로드 활성화
  cacheLimitDays: number; // 로컬 캐시 보관 일수
  maxUploadRetries: number; // 업로드 재시도 횟수
}

/**
 * 알림 필터링 설정
 * 알림 중요도 기준
 */
export interface AlertSettings {
  minAlertLevel: 'critical' | 'warning' | 'normal' | 'all';
  showPopupNotifications: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

/**
 * 사용자 프로필 설정
 * 기본 정보 및 사업장 연결
 */
export interface UserProfileSettings {
  displayName: string;
  selectedStoreId: number | null;
  showAdvancedOptions: boolean;
}

/**
 * 전체 설정 인터페이스
 * 모든 설정 그룹을 통합
 */
export interface AppSettings {
  audio: AudioSettings;
  visual: VisualSettings;
  sync: SyncSettings;
  alerts: AlertSettings;
  profile: UserProfileSettings;
  version: string; // 설정 버전 관리
  lastUpdated: string; // 마지막 업데이트 시간
}

/**
 * 설정 항목 타입
 * UI 컴포넌트에서 사용할 설정 항목 유형
 */
export type SettingsItemType = 
  | 'toggle' 
  | 'slider' 
  | 'select' 
  | 'action' 
  | 'info' 
  | 'input';

/**
 * 설정 섹션 정의
 * UI에서 설정 그룹을 구성하는 데 사용
 */
export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  items: SettingsItem[];
}

/**
 * 개별 설정 항목 정의
 * UI 컴포넌트 Props로 사용
 */
export interface SettingsItem {
  id: string;
  type: SettingsItemType;
  label: string;
  description?: string;
  key: string; // 설정 객체 내 경로 (예: 'audio.inputGain')
  min?: number; // 슬라이더용 최소값
  max?: number; // 슬라이더용 최대값
  step?: number; // 슬라이더용 단계
  options?: { value: string; label: string }[]; // 선택지용 옵션
  defaultValue?: any; // 기본값
  unit?: string; // 단위 표시
}

/**
 * 설정 변경 핸들러 타입
 */
export type SettingsChangeHandler = (key: string, value: any) => void;