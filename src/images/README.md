# 이미지 리소스 (images)

이 디렉토리는 SignalCraft Mobile 애플리케이션에서 동적으로 로드되는 이미지 리소스들을 포함합니다. 장비 상태 아이콘, 배경 이미지, 로컬 리소스 등 앱의 시각적 요소들을 체계적으로 관리합니다.

## 📁 디렉토리 구조

```
src/images/
├── [현재 빈 디렉토리]
└── [향후 확장 예정 이미지 파일들]
```

## 🎯 역할 및 책임

### 이미지 리소스 관리
- **상태 아이콘**: 장비 상태를 나타내는 아이콘 세트
- **배경 이미지**: 화면 배경 및 테마 관련 이미지
- **아이콘 세트**: 기능별 아이콘 모음

### 애셋 최적화
- **파일 크기**: 퍼포먼스를 고려한 최적화된 크기
- **해상도**: 다양한 화면 밀도 대응
- **포맷**: 적절한 이미지 포맷 선택 (PNG, SVG 등)

## 🔮 향후 확장 계획

### 추가 예정 이미지 리소스

#### 장비 상태 아이콘
```
src/images/device-status/
├── status-normal.png      # 정상 상태 (초록색)
├── status-warning.png     # 경고 상태 (주황색)
├── status-critical.png    # 위험 상태 (빨강색)
└── status-offline.png     # 오프라인 상태 (회색)
```

#### 기능 아이콘
```
src/images/icons/
├── icon-camera.png        # 카메라 기능
├── icon-microphone.png    # 오디오 녹음
├── icon-chart.png         # 차트/데이터
├── icon-settings.png      # 설정 기능
└── icon-refresh.png       # 새로고침
```

#### 배경 이미지
```
src/images/backgrounds/
├── bg-dashboard.jpg       # 대시보드 배경
├── bg-diagnosis.png       # 진단 장면 배경
└── bg-cyberpunk.png       # 테마 배경 이미지
```

## 🎨 Industrial Cyberpunk 테마 가이드

### 컬러 시스템 연동
- **Primary Color**: `#00FF9D` (네온 그린)
- **Warning Color**: `#FF5E00` (네온 오렌지)
- **Critical Color**: `#FF0055` (네온 레드)
- **Background**: `#050505` (다크 테마)

### 디자인 통일성
- **선 굵기**: 일관된 라인 웨이트
- **스타일**: 네온 발광 효과 및 기계적 요소
- **비례**: 시각적 균형 잡힌 크기 비율

## 📱 이미지 활용 방법

### 로컬 이미지 임포트
```typescript
// 이미지 임포트 예시
import statusNormal from '../src/images/device-status/status-normal.png';
import dashboardBg from '../src/images/backgrounds/bg-dashboard.jpg';

<Image source={statusNormal} style={styles.statusIcon} />
<ImageBackground source={dashboardBg} style={styles.background}>
  {children}
</ImageBackground>
```

### 동적 이미지 로딩
```typescript
// 상태에 따른 이미지 동적 로드
const getStatusIcon = (status) => {
  switch(status) {
    case 'normal': return require('../images/device-status/status-normal.png');
    case 'warning': return require('../images/device-status/status-warning.png');
    case 'critical': return require('../images/device-status/status-critical.png');
    default: return require('../images/device-status/status-offline.png');
  }
};
```

## ⚡ 성능 최적화 전략

### 파일 크기 최적화
- **압축**: 무손실 압축으로 품질 유지하며 크기 감소
- **웹포맷**: WebP 포맷 활용 고려 (플랫폼 호환성 확인)
- **크기 조절**: 실제 표시 크기에 맞는 해상도 제작

### 메모리 관리
- **로딩 최적화**: 필요한 시점에 이미지 로드
- **해제**: 사용하지 않는 이미지 메모리 해제
- **캐싱**: 반복 사용되는 이미지 캐싱 전략

## 🔄 이미지 관리 자동화

### 빌드 프로세스 연동
```json
// package.json 스크립트 예시
{
  "scripts": {
    "optimize-images": "imagemin src/images/* --out-dir=src/images-optimized",
    "generate-icons": "icon-generator --sizes=16,32,48,64 src/images/icon.png"
  }
}
```

### 이미지 포맷 변환
- **SVG → PNG**: 벡터 이미지 레스터화
- **PNG → WebP**: 현대적인 이미지 포맷 변환
- **리사이징**: 다양한 해상도 지원 자동화

## 📊 최적화 지표

### 목표 성능 기준
- **로딩 속도**: 이미지 로딩 100ms 미만
- **메모리 사용**: 전체 이미지 리소스 5MB 미만
- **앱 사이즈**: 이미지 관련 앱 크기 증가 10MB 미만

### 모니터링 대상
- **로드 타임**: 각 이미지의 로딩 시간 측정
- **메모리 사용**: 이미지별 메모리 점유량 추적
- **캐시 히트율**: 이미지 캐시 효율 측정

## 🛠 개발 도구 연동

### 이미지 에디터
- **Figma**: 디자인 시스템 및 이미지 제작
- **Sketch**: 마크업 및 아이콘 디자인
- **Adobe Illustrator**: 벡터 이미지 제작

### 최적화 도구
- **ImageOptim**: macOS 이미지 최적화 도구
- **Squoosh**: 웹 기반 이미지 압축 도구
- **Imagemin**: Node.js 기반 이미지 최적화 CLI

## 🔐 저작권 및 라이선스

### 이미지 소스 관리
- **독점 제작**: 프로젝트 전용 이미지 제작
- **오픈소스**: 적절한 라이선스 확인 후 사용
- **상용 라이선스**: 필요한 경우 상용 라이선스 구매

### 저작권 고려사항
- **상표권**: 브랜드 로고 및 상표 사용 주의
- **디자인권**: 독점 제작 이미지의 권리 보호
- **라이선스 문서**: 이미지 라이선스 정보 문서화

## 📋 이미지 추가 절차

### 새 이미지 추가시 체크리스트
- [ ] **테마 적합성**: Industrial Cyberpunk 테마와 조화 여부
- [ ] **파일 크기**: 최적화된 크기 여부
- [ ] **해상도**: 다양한 화면 등급 지원 가능 여부
- [ ] **포맷**: 적절한 이미지 포맷 선택
- [ ] **명명 규칙**: 파일 이름 규칙 준수 여부

### 검토 프로세스
1. **디자인 검토**: 시각적 일관성 검사
2. **성능 테스트**: 로딩 시간 및 메모리 영향 측정  
3. **기기 테스트**: 다양한 기기에서 렌더링 확인
4. **통합 테스트**: 앱 전체 통합 후 동작 확인

## 🚀 배포 준비

### 프로덕션 최적화
- **압축**: 마지막 최종 압축 적용
- **번들링**: 앱 번들에 최적화 통합
- **CDN 사용**: 필요 시 CDN을 통한 이미지 제공

### 스토어 요구사항
- **아이콘 규격**: iOS/Android 스토어 아이콘 요구사항
- **스크린샷**: 앱 프리뷰 이미지 준비
- **프로모션**: 마케팅용 이미지 리소스
