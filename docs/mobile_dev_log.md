# Mobile Development Log

## 2025년 11월 29일

### 변경 요약
모바일 앱의 실제 장비 AI 오디오 분석 기능 (녹음, 업로드, 백엔드 분석, 프론트엔드 리포트 시각화) 구현 및 하이브리드 모드 완벽 지원. `service.py`에서 `analyzer.py`의 상세 지표를 `EnsembleRadar` 차트에 매핑하도록 로직 개선.

### TODO/한계점
*   `analyzer.py`의 AI 임계값(`avg_rms`, `resonance_ratio`, `high_freq_ratio`)은 스마트폰 마이크의 녹음 특성 및 실제 사용 환경에 따라 추가적인 데이터 수집 및 튜닝이 필요.
*   프론트엔드(`DiagnosisScreen`)에서 장비 ID가 `dev_unknown`으로 전달되는 경우가 있으므로, 장비 선택/전달 로직 보강 필요.
