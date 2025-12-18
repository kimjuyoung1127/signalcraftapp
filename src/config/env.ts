// src/config/env.ts
// 환경 변수 및 API 설정

export const ENV = {
  // 기본 API 베이스 URL
  API_BASE_URL: 'http://3.39.124.0:8000',
  
  // 엔드포인트
  ENDPOINTS: {
    HEALTH_CHECK: '/health',
    MODELS: '/api/v1/models',
    DEVICES: '/api/v1/devices',
    ANALYSIS: '/api/v1/analysis',
    AUTH: '/api/v1/auth',
  },
  
  // 타임아웃 설정
  TIMEOUTS: {
    API_REQUEST: 10000, // 10초
    HEALTH_CHECK: 5000, // 5초
  },
  
  // 개발/프로덕션 환경 플래그
  IS_DEVELOPMENT: __DEV__,
  
  // 버전 정보
  APP_VERSION: '1.0.0',
  API_VERSION: 'v1',
};

// API 엔드포인트 생성 유틸리티
export const getApiUrl = (endpoint: string): string => {
  if (!ENV || !ENV.API_BASE_URL) {
    console.error('API_BASE_URL is not defined in ENV. Check env.ts');
    return endpoint; // Fallback to just the endpoint or an empty string
  }
  return `${ENV.API_BASE_URL}${endpoint}`;
};

// 환경별 설정 오버라이드
export const configureEnvironment = (configOverrides?: Partial<typeof ENV>) => {
  if (configOverrides) {
    Object.assign(ENV, configOverrides);
  }
};