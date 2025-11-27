from datetime import datetime, timedelta

def get_demo_scenario(device_id: str):
    """
    device_id에 따라 고정된 데모용 정밀 분석 데이터를 반환합니다.
    Palantir 스타일의 상세 데이터를 포함합니다.
    """
    
    # device_id 접두사로 시나리오 결정
    scenario_type = "normal"
    if device_id.startswith("MOCK-001"): # CRITICAL 시나리오
        scenario_type = "critical"
    elif device_id.startswith("MOCK-002"): # WARNING 시나리오
        scenario_type = "warning"
    
    # 기본 날짜 계산 (오늘 기준 30일 전부터 오늘까지)
    today = datetime.now()
    history_data = []
    
    is_critical = scenario_type == "critical"
    is_warning = scenario_type == "warning"
    
    # 트렌드 데이터 생성
    for i in range(30):
        day = today - timedelta(days=(29 - i))
        if is_critical:
            # 지수함수적 증가 (급격한 고장 징후)
            value = 0.2 + (0.7 * ((i / 29) ** 2)) 
        elif is_warning:
            # 선형 증가 (서서히 나빠짐)
            value = 0.1 + (0.5 * (i / 29))
        else:
            # 평탄함 (약간의 노이즈만)
            value = 0.1 + (0.05 * (i % 3) / 10)
            
        history_data.append({
            "date": day.strftime("%Y-%m-%d"),
            "value": round(value, 2)
        })

    # 1. 베어링 결함 시나리오 (CRITICAL)
    if is_critical:
        return {
            "entity_type": "RotatingMachine",
            "status": {
                "current_state": "CRITICAL",
                "health_score": 35.2,
                "label": "CRITICAL", 
                "summary": "Critical failure detected. Immediate action required."
            },
            "diagnosis": {
                "root_cause": "Inner Race Bearing Fault (내륜 베어링 손상)",
                "confidence": 0.98,
                "severity_score": 9
            },
            "maintenance_guide": {
                "immediate_action": "즉시 가동 중지 및 베어링 교체 요망",
                "recommended_parts": ["Bearing Unit (SKF-6205)", "Seal Kit", "O-Ring Set"],
                "estimated_downtime": "4~6 Hours"
            },
            "ensemble_analysis": {
                "consensus_score": 0.98,
                "voting_result": {
                    "Autoencoder": {"status": "CRITICAL", "score": 0.99},
                    "SVM": {"status": "CRITICAL", "score": 0.95},
                    "CNN": {"status": "CRITICAL", "score": 0.98},
                    "RandomForest": {"status": "WARNING", "score": 0.75},
                    "MIMII": {"status": "CRITICAL", "score": 0.92}
                }
            },
            "frequency_analysis": {
                "bpfo_frequency": 235.4,
                "detected_peaks": [
                    {"hz": 60, "amp": 0.2, "match": False, "label": "Power"},
                    {"hz": 120, "amp": 0.1, "match": False, "label": "Harmonic"},
                    {"hz": 235, "amp": 0.85, "match": True, "label": "BPFO (Fault)"}
                ],
                "diagnosis": "Spectrum peak at 235Hz matches BPFO signature."
            },
            "predictive_insight": {
                "rul_prediction_days": 14,
                "anomaly_score_history": history_data
            }
        }

    # 2. 경고 시나리오 (WARNING)
    elif is_warning:
        return {
            "entity_type": "RotatingMachine",
            "status": {
                "current_state": "WARNING",
                "health_score": 68.4,
                "label": "WARNING",
                "summary": "Abnormal vibration patterns detected."
            },
            "diagnosis": {
                "root_cause": "Shaft Misalignment (축 정렬 불량 의심)",
                "confidence": 0.75,
                "severity_score": 5
            },
            "maintenance_guide": {
                "immediate_action": "다음 정기 점검 시 레이저 정렬 수행 및 윤활유 보충",
                "recommended_parts": ["Shim Kit (0.5mm)", "High-Temp Grease"],
                "estimated_downtime": "1~2 Hours"
            },
            "ensemble_analysis": {
                "consensus_score": 0.72,
                "voting_result": {
                    "Autoencoder": {"status": "WARNING", "score": 0.70},
                    "SVM": {"status": "NORMAL", "score": 0.45},
                    "CNN": {"status": "WARNING", "score": 0.78},
                    "RandomForest": {"status": "WARNING", "score": 0.65},
                    "MIMII": {"status": "WARNING", "score": 0.72}
                }
            },
            "frequency_analysis": {
                "bpfo_frequency": 235.4,
                "detected_peaks": [
                    {"hz": 60, "amp": 0.3, "match": False, "label": "Power"},
                    {"hz": 120, "amp": 0.25, "match": False, "label": "Harmonic"}
                ],
                "diagnosis": "Elevated harmonics detected. Possible looseness."
            },
            "predictive_insight": {
                "rul_prediction_days": 45,
                "anomaly_score_history": history_data
            }
        }

    # 3. 정상 시나리오 (NORMAL)
    else: # device_id.startswith("MOCK-003") 또는 그 외
        return {
            "entity_type": "RotatingMachine",
            "status": {
                "current_state": "NORMAL",
                "health_score": 98.5,
                "label": "NORMAL",
                "summary": "System operating within optimal parameters"
            },
            "diagnosis": {
                "root_cause": "None (정상)",
                "confidence": 0.99,
                "severity_score": 0
            },
            "maintenance_guide": {
                "immediate_action": "특이사항 없음. 현재 상태 유지.",
                "recommended_parts": [],
                "estimated_downtime": "0 Hours"
            },
            "ensemble_analysis": {
                "consensus_score": 0.12,
                "voting_result": {
                    "Autoencoder": {"status": "NORMAL", "score": 0.10},
                    "SVM": {"status": "NORMAL", "score": 0.05},
                    "CNN": {"status": "NORMAL", "score": 0.12},
                    "RandomForest": {"status": "NORMAL", "score": 0.08},
                    "MIMII": {"status": "NORMAL", "score": 0.15}
                }
            },
            "frequency_analysis": {
                "bpfo_frequency": 235.4,
                "detected_peaks": [
                    {"hz": 60, "amp": 0.15, "match": False, "label": "Power"},
                    {"hz": 120, "amp": 0.05, "match": False, "label": "Harmonic"}
                ],
                "diagnosis": "No abnormal frequency patterns detected."
            },
            "predictive_insight": {
                "rul_prediction_days": 365,
                "anomaly_score_history": history_data
            }
        }