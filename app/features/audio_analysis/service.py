import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.features.audio_analysis.models import AIAnalysisResult
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def generate_diagnostic_insight(label: str, score: float, details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes raw metrics to generate human-readable diagnostic insights and maintenance guides.
    """
    root_cause = "알 수 없음"
    confidence = 0.0
    severity_score = 0
    immediate_action = "정기 모니터링 수행"
    recommended_parts = []
    estimated_downtime = "없음"

    # Extract metrics
    peak_freqs = details.get("peak_frequencies", [])
    resonance_ratio = details.get("resonance_energy_ratio", 0.0)
    high_freq_ratio = details.get("high_freq_energy_ratio", 0.0)
    noise_level = details.get("noise_level", 0.0)
    ml_score = details.get("ml_anomaly_score", 0.0)

    # 1. Determine Root Cause based on metrics
    if len(peak_freqs) > 0:
        root_cause = "베어링 결함 (주파수 시그니처 감지됨)"
        confidence = 0.95
        recommended_parts = ["베어링 유닛 (SKF-6205)", "씰 키트"]
    elif resonance_ratio > 0.3:
        root_cause = "기계적 이완 / 공명 발생"
        confidence = 0.85 + (resonance_ratio * 0.2)
        recommended_parts = ["마운팅 볼트", "심(Shims)"]
    elif high_freq_ratio > 0.5:
        root_cause = "초기 베어링 마모 (고주파 에너지 과다)"
        confidence = 0.80 + (high_freq_ratio * 0.2)
        recommended_parts = ["윤활유", "베어링 유닛"]
    elif noise_level > 0.5:
        root_cause = "일반 기계적 성능 저하 (소음 과다)"
        confidence = 0.75
        recommended_parts = ["일반 점검 키트"]
    elif label == "CRITICAL": # Fallback for ML-based Critical
        root_cause = "AI 모델 이상 징후 감지 (복합 패턴)"
        confidence = 0.90
    elif label == "WARNING":
        root_cause = "AI 모델 잠재적 편차 감지"
        confidence = 0.60
    else:
        root_cause = "시스템 정상 작동 중"
        confidence = 0.98

    # Cap confidence at 1.0
    confidence = min(1.0, confidence)

    # 2. Determine Maintenance Guide based on Label
    if label == "CRITICAL":
        severity_score = 9
        immediate_action = "즉시 가동 중지 및 정밀 점검 요망"
        estimated_downtime = "4~8 시간"
        if not recommended_parts:
             recommended_parts = ["교체 유닛"]
    elif label == "WARNING":
        severity_score = 5
        immediate_action = "유지보수 일정 수립 및 급유 요망"
        estimated_downtime = "1~2 시간"
        if not recommended_parts:
             recommended_parts = ["그리스", "필터"]
    else:
        severity_score = 1
        immediate_action = "정기 모니터링 계속 수행"
        estimated_downtime = "0 시간"

    return {
        "diagnosis": {
            "root_cause": root_cause,
            "confidence": confidence,
            "severity_score": severity_score
        },
        "maintenance_guide": {
            "immediate_action": immediate_action,
            "recommended_parts": recommended_parts,
            "estimated_downtime": estimated_downtime
        }
    }

async def get_analysis_report(db: AsyncSession, device_id: str) -> Optional[Dict[str, Any]]:
    """
    device_id에 따라 실제 DB 분석 결과를 반환합니다. 
    Raw Metrics를 기반으로 풍부한 Insight를 생성하여 반환합니다.
    """
    
    logger.info(f"[{device_id}] DB에서 최신 분석 결과 조회.")
    result = await db.execute(
        select(AIAnalysisResult)
        .filter(AIAnalysisResult.device_id == device_id)
        .order_by(AIAnalysisResult.created_at.desc())
        .limit(1)
    )
    analysis_result = result.scalar_one_or_none()

    # 안전한 기본값 생성 함수
    def get_default_payload(status_label="NORMAL", score=0.1, summary="분석 데이터가 없습니다."):
        today = datetime.now()
        history_data = []
        for i in range(7):
            day = today - timedelta(days=(6 - i))
            history_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "value": 0.1
            })
            
        return {
            "entity_type": "Device",
            "status": {
                "current_state": status_label,
                "health_score": (1.0 - score) * 100,
                "label": status_label,
                "summary": summary
            },
            "diagnosis": {
                "root_cause": "데이터 없음",
                "confidence": 0.0,
                "severity_score": 0
            },
            "maintenance_guide": {
                "immediate_action": "초기 분석 수행 필요",
                "recommended_parts": [],
                "estimated_downtime": "미정"
            },
            "ensemble_analysis": {
                "consensus_score": score,
                "voting_result": {
                    "Autoencoder": {"status": status_label, "score": score},
                    "SVM": {"status": status_label, "score": score},
                    "CNN": {"status": status_label, "score": score},
                    "RandomForest": {"status": status_label, "score": score},
                    "MIMII": {"status": status_label, "score": score}
                }
            },
            "frequency_analysis": {
                "bpfo_frequency": 0,
                "detected_peaks": [],
                "diagnosis": "분석 필요."
            },
            "predictive_insight": {
                "rul_prediction_days": 365,
                "anomaly_score_history": history_data
            },
            "original_analysis_result": {
                "label": status_label,
                "score": score,
                "summary": summary
            }
        }

    if analysis_result and analysis_result.result_data:
        logger.info(f"[{device_id}] 실제 분석 결과 찾음.")
        data = analysis_result.result_data
        details = data.get("details", {})
        
        # 기본 페이로드 생성
        payload = get_default_payload(
            status_label=data.get("label", "NORMAL"),
            score=data.get("score", 0.1),
            summary=data.get("summary", "분석 완료.")
        )
        
        overall_status_from_analysis = data.get("label", "NORMAL")
        overall_score_from_analysis = data.get("score", 0.1)

        # 1. Status 업데이트
        payload["status"]["current_state"] = overall_status_from_analysis
        payload["status"]["label"] = overall_status_from_analysis
        payload["status"]["summary"] = data.get("summary", "분석 완료.")
        payload["status"]["health_score"] = (1.0 - overall_score_from_analysis) * 100

        # 2. Insight Generation (Rich Data Enrichment)
        insights = generate_diagnostic_insight(overall_status_from_analysis, overall_score_from_analysis, details)
        payload["diagnosis"] = insights["diagnosis"]
        payload["maintenance_guide"] = insights["maintenance_guide"]

        # 3. Ensemble Analysis 업데이트 (실제 지표 반영)
        if details:
            payload["ensemble_analysis"]["voting_result"] = {
                "RMS Level": {
                    "status": overall_status_from_analysis,
                    "score": min(1.0, details.get("noise_level", 0) * 2)
                },
                "Resonance": {
                    "status": overall_status_from_analysis,
                    "score": min(1.0, details.get("resonance_energy_ratio", 0) * 3)
                },
                "High Freq": {
                    "status": overall_status_from_analysis, 
                    "score": min(1.0, details.get("high_freq_energy_ratio", 0) * 2)
                },
                "Freq Center": {
                    "status": overall_status_from_analysis, 
                    "score": min(1.0, details.get("frequency", 0) / 5000)
                },
                "ML Model": { # Add ML score
                    "status": overall_status_from_analysis,
                    "score": min(1.0, abs(details.get("ml_anomaly_score", 0)) * 2) # Heuristic normalization
                }
            }
            payload["ensemble_analysis"]["consensus_score"] = overall_score_from_analysis

        # 4. Frequency Analysis 업데이트
        peak_freqs = details.get("peak_frequencies", [])
        detected_peaks = []
        for freq in peak_freqs:
            detected_peaks.append({
                "hz": freq,
                "amp": 0.8, # Placeholder amplitude as analyzer doesn't return it yet
                "match": True,
                "label": "결함 주파수"
            })
        
        payload["frequency_analysis"] = {
            "bpfo_frequency": peak_freqs[0] if peak_freqs else 0,
            "detected_peaks": detected_peaks,
            "diagnosis": payload["diagnosis"]["root_cause"] # Use generated root cause
        }

        payload["analysis_details"] = details
        payload["original_analysis_result"] = data
        
        return payload
    else:
        logger.info(f"[{device_id}] DB에 COMPLETED 분석 결과 없음. 기본값 반환.")
        return get_default_payload()