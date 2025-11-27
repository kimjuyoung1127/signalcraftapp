from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.features.audio_analysis.models import AIAnalysisResult
from app.features.audio_analysis.demo_payloads import get_demo_scenario
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

async def get_analysis_report(db: AsyncSession, device_id: str) -> Optional[Dict[str, Any]]:
    """
    device_id에 따라 데모용 시나리오 데이터 또는 실제 DB 분석 결과를 반환합니다.
    """
    
    # MOCK 장비인 경우 데모 페이로드 반환
    if device_id.startswith("MOCK-"):
        print(f"[{device_id}] MOCK 시나리오 데이터 반환.")
        return get_demo_scenario(device_id)

    # 실제 장비인 경우 DB에서 최신 분석 결과 조회
    print(f"[{device_id}] DB에서 최신 분석 결과 조회.")
    result = await db.execute(
        select(AIAnalysisResult)
        .filter(AIAnalysisResult.device_id == device_id, AIAnalysisResult.status == "COMPLETED")
        .order_by(AIAnalysisResult.completed_at.desc())
        .limit(1)
    )
    analysis_result = result.scalar_one_or_none()

    # 안전한 기본값 생성 함수
    def get_default_payload(status_label="NORMAL", score=0.1, summary="No analysis data available."):
        today = datetime.now()
        history_data = []
        # 기본 트렌드 데이터 (평탄함)
        for i in range(30):
            day = today - timedelta(days=(29 - i))
            history_data.append({
                "date": day.strftime("%Y-%m-%d"),
                "value": 0.1
            })
            
        return {
            "entity_type": "Device",
            "status": {
                "current_state": status_label,
                "health_score": (1.0 - score) * 100, # 점수가 낮을수록 건강함(이상 점수) -> 높을수록 건강함으로 변환
                "label": status_label,
                "summary": summary
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
                "diagnosis": "Real-time analysis data not yet fully integrated."
            },
            "predictive_insight": {
                "rul_prediction_days": 365, # 기본값
                "anomaly_score_history": history_data
            },
            "original_analysis_result": {
                "label": status_label,
                "score": score,
                "summary": summary
            }
        }

    if analysis_result and analysis_result.result_data:
        print(f"[{device_id}] 실제 분석 결과 찾음.")
        data = analysis_result.result_data
        # DB 데이터 기반으로 페이로드 구성
        payload = get_default_payload(
            status_label=data.get("label", "NORMAL"),
            score=data.get("score", 0.1),
            summary=data.get("summary", "Analysis completed.")
        )
        # 원본 데이터 덮어쓰기
        payload["original_analysis_result"] = data
        
        # 만약 Librosa 분석 결과에 세부 정보가 있다면 여기에 매핑 가능 (현재는 기본값 사용)
        return payload
    else:
        print(f"[{device_id}] DB에 COMPLETED 분석 결과 없음. 기본값 반환.")
        return get_default_payload()
