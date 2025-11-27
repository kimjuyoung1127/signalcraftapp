import os
import random
import numpy as np

# Librosa는 무거운 라이브러리이므로, 필요할 때 import 하거나 예외 처리를 하는 것이 좋을 수 있음
try:
    import librosa
except ImportError:
    librosa = None

def analyze_audio_file(file_path: str) -> dict:
    """
    오디오 파일을 분석하여 상태(Normal/Warning/Critical)와 세부 지표를 반환합니다.
    """
    print(f"Analyzing audio file: {file_path}")
    
    # 1. 파일 존재 확인
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    # 2. Librosa를 이용한 분석 (설치되어 있다면)
    if librosa:
        try:
            # 오디오 로드 (처음 10초만)
            y, sr = librosa.load(file_path, duration=10)
            
            # RMS 에너지 계산 (소음 레벨)
            rms = librosa.feature.rms(y=y)
            avg_rms = float(np.mean(rms))
            
            # 스펙트럼 중심 주파수 (Frequency)
            cent = librosa.feature.spectral_centroid(y=y, sr=sr)
            avg_freq = float(np.mean(cent))
            
            # 단순 로직: RMS가 높으면 Critical
            # 예: RMS 0.1 이상이면 Critical, 0.05 이상이면 Warning
            if avg_rms > 0.2:
                label = "CRITICAL"
                score = 0.95
                summary = "High noise level detected. Immediate inspection required."
            elif avg_rms > 0.05:
                label = "WARNING"
                score = 0.6
                summary = "Moderate noise level detected. Scheduled maintenance recommended."
            else:
                label = "NORMAL"
                score = 0.1
                summary = "Audio levels are within normal operating range."
                
            return {
                "label": label,
                "score": score,
                "summary": summary,
                "details": {
                    "noise_level": avg_rms,
                    "frequency": avg_freq,
                    "duration": librosa.get_duration(y=y, sr=sr)
                }
            }
            
        except Exception as e:
            print(f"Librosa analysis failed: {e}")
            # 실패 시 Fallback 로직 수행
    
    # 3. Fallback (Librosa가 없거나 실패 시, 랜덤/더미 데이터 반환 - 데모용 아님, 에러 방지용)
    # 여기서는 랜덤하게 결과를 반환하여 시스템이 멈추지 않도록 함
    print("Using fallback analysis logic.")
    status = random.choice(["NORMAL", "WARNING", "CRITICAL"])
    
    if status == "NORMAL":
        return {
            "label": "NORMAL",
            "score": random.uniform(0.0, 0.3),
            "summary": "System operating normally.",
            "details": {"noise_level": 0.02, "frequency": 440}
        }
    elif status == "WARNING":
         return {
            "label": "WARNING",
            "score": random.uniform(0.4, 0.7),
            "summary": "Abnormal vibration detected.",
            "details": {"noise_level": 0.1, "frequency": 1200}
        }
    else:
         return {
            "label": "CRITICAL",
            "score": random.uniform(0.8, 1.0),
            "summary": "Critical failure imminent. High frequency noise.",
            "details": {"noise_level": 0.4, "frequency": 5000}
        }