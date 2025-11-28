# 오디오 분석 기능 모듈 (audio_analysis)

이 디렉토리는 SignalCraft의 핵심 기능인 AI 기반 오디오 진단 시스템을 모듈화하여 포함합니다. Industrial IoT 장비의 오디오 신호를 분석하여 고장을 예측하고 진단하는 고도화된 분석 엔진입니다.

## 📁 모듈 구조

```
app/features/audio_analysis/
├── __init__.py            # 모듈 초기화
├── analyzer.py            # 오디오 분석 핵심 로직
├── demo_payloads.py       # 데모 시나리오 데이터
├── router.py              # 분석 API 엔드포인트
├── service.py             # 비즈니스 로직 서비스
├── models.py              # 데이터 모델 정의
└── [향후 확장 예정 파일들]
```

## 🎯 모듈 역할 및 책임

### 오디오 분석 파이프라인
- **실시간 처리**: 실시간 오디오 스트림 분석
- **스펙트럼 분석**: 주파수 영역에서의 신호 분석
- **고조파 탐지**: 장비 고강 주파수 성분 식별
- **AI 예측**: 머신러닝 기반 고장 예측

### Palantir 스타일 분석
- **데이터 시각화**: 레이더 차트, 스펙트럼, 트렌드 차트
- **XAI(설명 가능한 AI)**: 근본 원인 및 신뢰도 설명
- **실행 가능한 인텔리전스**: 현장 엔지니어를 위한 조치 가이드

## 📋 핵심 파일 상세

### analyzer.py
```python
# Librosa 기반 오디오 분석 핵심 엔진
def analyze_audio_spectrum(file_path: str, device_id: str):
    """
    오디오 스펙트럼 분석 및 고장 주파수 탐지
    
    주요 기능:
    - FFT를 통한 주파수 도메인 변환
    - 고조파 성분 탐지 (1x, 2x, 3x RPM)
    - 장비별 고장 주파수 매핑
    - 신뢰도 점수 계산
    """
    # 오디오 파일 로드
    y, sr = librosa.load(file_path)
    
    # 스펙트럼 분석
    stft = librosa.stft(y)
    magnitude = np.abs(stft)
    
    # 고조파 탐지
    harmonics = detect_harmonics(magnitude, sr)
    
    # 장비별 진단
    diagnosis = match_frequencies_to_faults(harmonics, device_id)
    
    return generate_analysis_result(diagnosis)
```

### demo_payloads.py
```python
# 데모 시나리오 데이터셋
class DemoScenarios:
    CRITICAL = {
        "diagnosis": {
            "root_cause": "Inner Race Bearing Fault (내륜 베어링 손상)",
            "confidence": 0.98,
            "severity_score": 9
        },
        "maintenance_guide": {
            "immediate_action": "즉시 가동 중지 및 베어링 교체 요망",
            "recommended_parts": ["Bearing Unit (SKF-6205)", "Seal Kit"],
            "estimated_downtime": "4~6 Hours"
        }
    }
    
    WARNING = {
        "diagnosis": {
            "root_cause": "Lubrication System Aging (윤활 시스템 노후화)",
            "confidence": 0.87,
            "severity_score": 6
        }
    }
    
    NORMAL = {
        "diagnosis": {
            "root_cause": "Normal Operation (정상 운전)",
            "confidence": 0.95,
            "severity_score": 2
        }
    }
```

### service.py
```python
# 하이브리드 데이터 서비스
class AudioAnalysisService:
    def get_detailed_report(self, device_id: str, db: AsyncSession):
        """
        장비별 상세 분석 리포트 생성
        
        하이브리드 로직:
        - MOCK- 접두사 장치: 데모 시나리오 데이터
        - 실제 장치: DB 데이터 + 분석 결과
        - 데이터 부족 시: 안전한 기본값 제공
        """
        if device_id.startswith("MOCK-"):
            # 데모 데이터 반환
            return self._get_demo_report(device_id)
        else:
            # 실제 데이터 분석
            return await self._analyze_real_data(device_id, db)
```

### router.py
```python
# FastAPI 라우터 구현
@router.get("/report/{device_id}")
async def get_device_report(
    device_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    장비별 통합 분석 리포트 API
    
    반환 구조:
    - Ensemble Radar Chart (종합 분석)
    - Frequency Spectrum (주파수 분석)  
    - Predictive Trend (예측 분석)
    - Actionable Insights (실행 가이드)
    """
    service = AudioAnalysisService()
    report = await service.get_detailed_report(device_id, db)
    
    return JSONResponse(content=report)
```

## 🧠 분석 알고리즘

### 고장 주파수 분석
```python
def detect_harmonics(magnitude, sr):
    """
    고조파 성분 탐지 알고리즘
    
    처리 과정:
    1. 주파수 스펙트럼에서 피크 탐지
    2. RPM 기반 고주파 계산 (1x, 2x, 3x)
    3. 장비별 고강 주파수와 매칭
    4. 유사도 점수 계산
    """
    # 피크 탐지
    peaks, _ = signal.find_peaks(magnitude, height=threshold)
    peak_freqs = peaks * sr / len(magnitude)
    
    # 고조파 확인
    harmonics = calculate_harmonics(peak_freqs, rpm)
    
    # 고강 매칭
    matched_peaks = match_to_fault_frequencies(harmonics, device_type)
    
    return matched_peaks
```

### 신뢰도 계산
```python
def calculate_confidence(analysis_result):
    """
    분석 결과 신뢰도 계산
    
    요소:
    - 주파수 피크 강도
    - 고조파 일치율
    - 이력 데이터 일관성
    - 노이즈 레벨
    """
    confidence_factors = {
        'peak_strength': peak_strength_score,
        'harmonic_match': harmonic_match_score,
        'historical_consistency': historical_score,
        'noise_level': noise_score
    }
    
    # 가중평균 신뢰도 계산
    confidence = weighted_average(confidence_factors)
    
    return min(confidence, 0.99)  # 최대 99% 확률
```

## 📊 고급 데이터 모델

### 확장 분석 결과
```python
class DetailedAnalysisResult(BaseModel):
    # 기본 진단 정보
    diagnosis: DiagnosisInfo
    
    # XAI (설명 가능한 AI)
    root_cause: str
    confidence: float
    severity_score: int
    
    # Actionable Intelligence
    maintenance_guide: MaintenanceGuide
    
    # 시각화 데이터
    ensemble_analysis: EnsembleData
    frequency_analysis: FrequencyData
    predictive_insight: PredictiveData

class MaintenanceGuide(BaseModel):
    immediate_action: str      # 즉시 조치 사항
    recommended_parts: list    # 필요 부품 목록
    estimated_downtime: str    # 예상 가동 중단 시간
```

### 시각화 데이터 구조
```python
# 레이더 차트용 데이터
@dataclass
class EnsembleRadarData:
    """5각형 레이더 차트 데이터"""
    labels: List[str] = ["진동", "소음", "온도", "압력", "전륜"]
    current_values: List[float] = [0.85, 0.92, 0.78, 0.93, 0.81]
    baseline_values: List[float] = [0.20, 0.15, 0.25, 0.10, 0.30]
    
# 주파수 스펙트럼 데이터  
@dataclass
class FrequencySpectrumData:
    """주파수 스펙트럼 바 차트 데이터"""
    frequencies: List[float] = [25.0, 50.0, 75.0, 100.0, 125.0]
    magnitudes: List[float] = [0.8, 1.5, 2.3, 1.8, 0.9]
    harmonic_markers: List[HarmonicMarker]  # 고조파 표시
    
# 예측 트렌드 데이터
@dataclass
class PredictiveTrendData:
    """30일 예측 라인 차트 데이터"""
    historical_data: List[float]  # 과거 30일 데이터
    predicted_data: List[float]    # 미래 예측 데이터
    confidence_interval: ConfidenceInterval  # 신뢰구간
    failure_threshold: float = 7.5  # 고강 임계치
```

## 🔧 기능 연동 시스템

### Celery 비동기 처리
```python
# 분석 태스크 정의
@celery_app.task(bind=True)
def analyze_audio_file(self, file_path: str, device_id: str, user_id: int):
    """
    Celery 비동기 오디오 분석
    
    처리 과정:
    1. 파일 로드 및 유효성 검사
    2. FFT 기반 주파수 분석
    3. 고조파 탐지 및 진단
    4. 결과 데이터베이스 저장
    5. 임시 파일 자동 삭제
    """
    try:
        # 진행 상태 업데이트
        self.update_state(state='PROGRESS', meta={'current': 0, 'total': 100})
        
        # 오디오 분석 실행
        analysis_result = perform_audio_analysis(file_path, device_id)
        
        # 데이터베이스 저장
        result = save_analysis_result(analysis_result, user_id, device_id)
        
        # 파일 정리
        cleanup_temp_file(file_path)
        
        return {"status": "COMPLETED", "result_id": result.id}
        
    except Exception as exc:
        # 에러 처리 및 롤백
        self.retry(exc=exc, countdown=60, max_retries=3)
```

### 데이터베이스 연동
```python
# AsyncSession 기반 결과 저장
async def save_analysis_result(
    result_data: dict, 
    user_id: int, 
    device_id: str,
    db: AsyncSession
):
    """분석 결과 데이터베이스 저장"""
    
    # 오디오 파일 정보 생성
    audio_file = AudioFiles(
        user_id=user_id,
        device_id=device_id,
        filename=os.path.basename(file_path),
        file_size=os.path.getsize(file_path),
        mime_type="audio/wav"
    )
    db.add(audio_file)
    await db.flush()  # ID 생성
    
    # 분석 결과 생성
    analysis_result = AIAnalysisResults(
        id=str(uuid4()),  # Task ID로 활용
        audio_file_id=audio_file.id,
        user_id=user_id,
        device_id=device_id,
        status="COMPLETED",
        result_data=result_data,
        completed_at=datetime.utcnow()
    )
    db.add(analysis_result)
    
    await db.commit()
    return analysis_result
```

## 📱 프론트엔드 연동

### API 응답 형식
```json
{
  "diagnosis": {
    "root_cause": "Inner Race Bearing Fault (내륜 베어링 손상)",
    "confidence": 0.98,
    "severity_score": 9
  },
  "maintenance_guide": {
    "immediate_action": "즉시 가동 중지 및 베어링 교체 요망",
    "recommended_parts": ["Bearing Unit (SKF-6205)", "Seal Kit"],
    "estimated_downtime": "4~6 Hours"
  },
  "ensemble_radar": {
    "labels": ["진동", "소음", "온도", "압력", "전륜"],
    "current_values": [0.85, 0.92, 0.78, 0.93, 0.81],
    "baseline_values": [0.20, 0.15, 0.25, 0.10, 0.30]
  },
  "frequency_spectrum": {
    "frequencies": [25.0, 50.0, 75.0, 100.0, 125.0],
    "magnitudes": [0.8, 1.5, 2.3, 1.8, 0.9],
    "harmonic_cursors": [
      {"frequency": 50.0, "type": "1x RPM", "magnitude": 2.3},
      {"frequency": 100.0, "type": "2x RPM", "magnitude": 1.8}
    ]
  },
  "predictive_trend": {
    "historical": [2.1, 2.3, 2.5, 2.8, 3.2],
    "predicted": [3.6, 4.1, 4.8, 5.7, 7.2],
    "confidence_interval": {
      "upper": [3.8, 4.4, 5.2, 6.2, 8.0],
      "lower": [3.4, 3.8, 4.4, 5.2, 6.4]
    },
    "rul_days": 14,  # 남은 수명
    "failure_threshold": 7.5
  }
}
```

## 📊 성능 최적화

### 분석 알고리즘 최적화
```python
# NumPy 벡터화 연산
def optimized_fft_analysis(audio_data):
    """고성능 FFT 분석"""
    # NumPy 벡터화로 계산 속도 향상
    windowed = audio_data * np.hanning(len(audio_data))
    fft_result = np.fft.fft(windowed, n=2048)  # 고정 FFT 크기
    magnitude = np.abs(fft_result[:len(fft_result)//2])
    
    return magnitude

# 메모리 풀 관리
@contextmanager
def audio_processing_context():
    """오디오 처리 컨텍스트 관리자"""
    try:
        yield  # 분석 실행
    finally:
        # 자동 메모리 정리
        gc.collect()
```

### 캐싱 전략
- **결과 캐싱**: 동일한 파일에 대한 분석 결과 캐싱
- **모델 캐싱**: 머신러닝 모델 사전 로드
- **파일 캐싱**: 임시 파일 효율적 관리

## 🚀 확장 방향

### 머신러닝 통합
```python
# 향후 ML 모델 통합 예정
def ml_based_diagnosis(audio_features):
    """머신러닝 기반 진단 모델"""
    # 모델 로드 (캐싱)
    model = load_diagnosis_model()
    
    # 특징 추출
    features = extract_features(audio_features)
    
    # 예측 수행
    prediction = model.predict(features)
    
    return format_ml_result(prediction)
```

### 실시간 스트리밍
```python
# WebSocket 기반 실시간 분석
async def stream_audio_analysis(websocket):
    """실시간 오디오 스트림 분석"""
    async for audio_chunk in websocket:
        # 실시간 FFT 분석
        spectrum = real_time_fft(audio_chunk)
        
        # 웹소켓으로 결과 전송
        await websocket.send_json({
            "spectrum": spectrum.tolist(),
            "timestamp": time.time()
        })
```

## 📋 개발 가이드라인

### 신규 기능 추가 절차
1. **분석 알고리즘 구현** → `analyzer.py`에 기능 추가
2. **데이터 모델 정의** → Pydantic 스키마 확장
3. **API 엔드포인트 구현** → `router.py`에 라우트 추가
4. **서비스 로직 연동** → `service.py`에 비즈니스 로직 구현
5. **테스트 케이스 작성** → 단위/통합 테스트 수행

### 성능 가이드라인
- **분석 시간**: 5초 이내 처리 완료
- **메모리 사용**: 500MB 이내 사용
- **정확도**: 실제 고강 탐지율 90%+ 목표

## 🔍 디버깅 및 문제 해결

### 주요 이슈 및 해결
- **FFT 정확도**: 윈도잉 함수 적용으로 개선
- **노이즈 민감도**: 필터링 알고리즘 강화
- **메모리 누수**: 컨텍스트 관리자로 처리
- **동시성 문제**: Celery 큐로 대기열 처리

### 로깅 및 모니터링
```python
# 구조화된 로깅
import logging

logger = logging.getLogger(__name__)

def analyze_with_logging(file_path: str):
    """로깅 포함 분석 함수"""
    start_time = time.time()
    
    try:
        result = analyze_audio_spectrum(file_path)
        logger.info(
            "Analysis completed",
            extra={
                "file_path": file_path,
                "duration": time.time() - start_time,
                "result_size": len(result)
            }
        )
        return result
        
    except Exception as e:
        logger.error(
            "Analysis failed",
            extra={"file_path": file_path, "error": str(e)}
        )
        raise
```

## 📚 참고 자료

### 알고리즘 문헌
- **Librosa 문서**: [librosa.org](https://librosa.org) 오디오 분석 라이브러리
- **FFT 최적화**: NumPy/SciPy 성능 최적화 가이드
- **고장 진단 알고리즘**: Industrial IoT 기반 진단 논문

### ML 모델
- **TensorFlow Lite**: 모바일 기반 추론 엔진
- **ONNX**: 모델 포맷 표준화
- **MLflow**: ML 실험 추적 및 관리
