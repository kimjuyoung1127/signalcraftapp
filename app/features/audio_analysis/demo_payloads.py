from datetime import datetime, timedelta
import os
import sys
import numpy as np # [추가] numpy 임포트

# analyzer.py를 임포트하기 위한 경로 설정
# 현재 demo_payloads.py는 app/features/audio_analysis 아래에 있음
# analyzer.py도 같은 app/features/audio_analysis 아래에 있음
from .analyzer import analyze_audio_file

# 골든 샘플 WAV 파일 경로 (SyntheticWAV 폴더 기준)
# 이 경로는 Docker 컨테이너 내에서 접근 가능해야 합니다.
# /app/tests/data/SyntheticWAV/
BASE_SYNTHETIC_WAV_PATH = "/app/tests/data/SyntheticWAV"

GOLDEN_SAMPLES = {
    "NORMAL": os.path.join(BASE_SYNTHETIC_WAV_PATH, "Normal", "S_N(1).wav"),
    "WARNING": os.path.join(BASE_SYNTHETIC_WAV_PATH, "Inner Race Fault", "S_IR(1).wav"),
    "CRITICAL": os.path.join(BASE_SYNTHETIC_WAV_PATH, "Outer Race Fault", "S_OR(100).wav"), # 가장 높은 resonance_ratio 가진 파일
}

def _get_analysis_metrics_for_golden_sample(sample_type: str):
    """
    지정된 골든 샘플 WAV 파일을 분석하고 그 결과를 반환합니다.
    """
    file_path = GOLDEN_SAMPLES.get(sample_type.upper())
    if not file_path:
        raise ValueError(f"Invalid golden sample type: {sample_type}")

    try:
        # analyzer.py를 통해 실제 분석 수행
        analysis_result = analyze_audio_file(file_path)
        
        # [제거] analyzer.py에서 이미 float()으로 캐스팅하므로 불필요한 중복 코드
        # for key, value in analysis_result.items():
        #     if isinstance(value, np.float32):
        #         analysis_result[key] = float(value)
        #     elif isinstance(value, dict):
        #         for detail_key, detail_value in value.items():
        #             if isinstance(detail_value, np.float32):
        #                 analysis_result[key][detail_key] = float(detail_value)
        
        return analysis_result
    except Exception as e:
        print(f"Error analyzing golden sample {sample_type} ({file_path}): {e}")
        # 오류 발생 시 기본/더미 값 반환
        return {
            "label": sample_type.upper(),
            "score": 0.5,
            "summary": f"Error loading golden sample for {sample_type}",
            "details": {
                "noise_level": 0.1,
                "frequency": 1000,
                "resonance_energy_ratio": 0.1,
                "high_freq_energy_ratio": 0.01,
                "duration": 5
            }
        }


def get_demo_scenario(device_id: str):
    """
    device_id에 따라 고정된 데모용 정밀 분석 데이터를 반환합니다.
    Palantir 스타일의 상세 데이터를 포함합니다.
    골든 샘플의 분석 결과를 기반으로 동적으로 데이터가 생성됩니다.
    """
    
    # device_id 접두사로 시나리오 결정
    scenario_type = "normal"
    if device_id.startswith("MOCK-001"): # CRITICAL 시나리오
        scenario_type = "critical"
    elif device_id.startswith("MOCK-002"): # WARNING 시나리오
        scenario_type = "warning"
    elif device_id.startswith("MOCK-003"): # NORMAL 시나리오 (새로운 ID 할당)
        scenario_type = "normal"
    else: # 기본값
        scenario_type = "normal"
    
    # 골든 샘플의 실제 분석 결과 가져오기
    golden_sample_analysis = _get_analysis_metrics_for_golden_sample(scenario_type)
    
    # 기본 날짜 계산 (오늘 기준 30일 전부터 오늘까지)
    today = datetime.now()
    history_data = []
    
    is_critical = golden_sample_analysis['label'] == "CRITICAL"
    is_warning = golden_sample_analysis['label'] == "WARNING"
    
    # 트렌드 데이터 생성
    for i in range(30):
        day = today - timedelta(days=(29 - i))
        value_base = 0.1 # 기본값
        if is_critical:
            # 지수함수적 증가 (급격한 고장 징후)
            value = value_base + (0.7 * ((i / 29) ** 2)) 
        elif is_warning:
            # 선형 증가 (서서히 나빠짐)
            value = value_base + (0.5 * (i / 29))
        else:
            # 평탄함 (약간의 노이즈만)
            value = value_base + (0.05 * (i % 3) / 10)
            
        history_data.append({
            "date": day.strftime("%Y-%m-%d"),
            "value": round(float(value), 2) # NumPy float32 -> Python float
        })

    # 공통 데이터 구조
    common_data = {
        "entity_type": "RotatingMachine",
        "status": {
            "current_state": golden_sample_analysis['label'],
            "health_score": round((1 - float(golden_sample_analysis['score'])) * 100, 1), # 점수가 높으면 안 좋으므로 반대로 계산
            "label": golden_sample_analysis['label'],
            "summary": golden_sample_analysis['summary']
        },
        "diagnosis": {
            "root_cause": "", # 실제 분석 결과에 따라 동적으로 채우거나 기본값 설정
            "confidence": float(golden_sample_analysis['score']),
            "severity_score": round(float(golden_sample_analysis['score']) * 10, 0) # 0-10 스케일
        },
        "maintenance_guide": {
            "immediate_action": "특이사항 없음. 현재 상태 유지.",
            "recommended_parts": [],
            "estimated_downtime": "0 Hours"
        },
        "ensemble_analysis": {
            "consensus_score": float(golden_sample_analysis['score']),
            "voting_result": {
                "Librosa-RMS": {"status": golden_sample_analysis['label'], "score": float(golden_sample_analysis['details']['noise_level'])},
                "Librosa-Resonance": {"status": golden_sample_analysis['label'], "score": float(golden_sample_analysis['details']['resonance_energy_ratio'])},
                "Librosa-HighFreq": {"status": golden_sample_analysis['label'], "score": float(golden_sample_analysis['details']['high_freq_energy_ratio'])},
            }
        },
        "frequency_analysis": {
            "bpfo_frequency": float(golden_sample_analysis['details']['frequency']), # 스펙트럼 중심 주파수 활용
            "detected_peaks": [], # 이 부분은 좀 더 복잡한 로직이 필요 (현재는 빈 배열)
            "diagnosis": golden_sample_analysis['summary']
        },
        "predictive_insight": {
            "rul_prediction_days": 365, # 기본값, 필요시 동적 계산 로직 추가
            "anomaly_score_history": history_data
        }
    }

    # 시나리오에 따른 추가 상세 정보 업데이트
    if is_critical:
        common_data['diagnosis']['root_cause'] = "Outer Race Bearing Fault (외륜 베어링 손상)"
        common_data['maintenance_guide']['immediate_action'] = "즉시 가동 중지 및 베어링 교체 요망"
        common_data['maintenance_guide']['recommended_parts'] = ["Bearing Unit (SKF-6205)", "Seal Kit", "O-Ring Set"]
        common_data['maintenance_guide']['estimated_downtime'] = "4~6 Hours"
        common_data['predictive_insight']['rul_prediction_days'] = 14
        
    elif is_warning:
        common_data['diagnosis']['root_cause'] = "Inner Race Bearing Fault (내륜 베어링 손상 의심)"
        common_data['maintenance_guide']['immediate_action'] = "다음 정기 점검 시 정밀 진단 수행 및 윤활유 보충"
        common_data['maintenance_guide']['recommended_parts'] = ["High-Temp Grease"]
        common_data['maintenance_guide']['estimated_downtime'] = "1~2 Hours"
        common_data['predictive_insight']['rul_prediction_days'] = 45
    else: # Normal
        common_data['diagnosis']['root_cause'] = "None (정상)"
        
    return common_data
