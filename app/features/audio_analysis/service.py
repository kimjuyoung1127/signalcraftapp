import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.features.audio_analysis.models import AIAnalysisResult
from app.features.audio_analysis.demo_payloads import get_demo_scenario
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def get_analysis_report(db: AsyncSession, device_id: str) -> Optional[Dict[str, Any]]:
    """
    device_id에 따라 데모용 시나리오 데이터 또는 실제 DB 분석 결과를 반환합니다.
    """
    
    # MOCK 장비인 경우 데모 페이로드 반환
    if device_id.startswith("MOCK-"):
        print(f"[{device_id}] MOCK 시나리오 요청 감지.")
        demo_data = get_demo_scenario(device_id)
        print(f"[{device_id}] Generated Demo Data -> Label: {demo_data['status']['label']}, Score: {demo_data['status']['health_score']}, RootCause: {demo_data.get('diagnosis', {}).get('root_cause', 'N/A')}")
        print(f"[{device_id}] Details: RMS={demo_data['ensemble_analysis']['voting_result']['Librosa-RMS']['score']:.4f}, ResRatio={demo_data['ensemble_analysis']['voting_result']['Librosa-Resonance']['score']:.4f}")
        return demo_data

    # 실제 장비인 경우 DB에서 최신 분석 결과 조회
    logger.info(f"[{device_id}] DB에서 최신 분석 결과 조회.")
    # [수정] 디버깅을 위해 status="COMPLETED" 필터 제거하고 가장 최신 것 조회
    result = await db.execute(
        select(AIAnalysisResult)
        .filter(AIAnalysisResult.device_id == device_id)
        .order_by(AIAnalysisResult.created_at.desc())
        .limit(1)
    )
    analysis_result = result.scalar_one_or_none()

    if analysis_result:
        logger.info(f"[{device_id}] DB 조회 성공: ID={analysis_result.id}, Status={analysis_result.status}, Created={analysis_result.created_at}, Label={analysis_result.result_data.get('label') if analysis_result.result_data else 'None'}")
    else:
        logger.info(f"[{device_id}] DB 조회 실패: 데이터 없음")

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
        details = data.get("details", {})
        
        # [수정] get_default_payload를 호출하기 전에 실제 분석 결과를 기반으로 초기 payload 구성
        # get_default_payload는 기본 구조만 제공하고, 실제 데이터는 analysis_result에서 가져옴
        payload = get_default_payload(
            status_label=data.get("label", "NORMAL"),
            score=data.get("score", 0.1),
            summary=data.get("summary", "Analysis completed.")
        )
        
        # 전체 결과 상태를 실제 분석 결과에서 가져옴
        overall_status_from_analysis = data.get("label", "NORMAL")
        overall_score_from_analysis = data.get("score", 0.1)

        # payload의 status 필드를 실제 분석 결과로 업데이트
        payload["status"]["current_state"] = overall_status_from_analysis
        payload["status"]["label"] = overall_status_from_analysis
        payload["status"]["summary"] = data.get("summary", "Analysis completed.")
        # health_score는 score를 반대로 스케일링
        payload["status"]["health_score"] = (1.0 - overall_score_from_analysis) * 100

        # [핵심 수정] Analyzer.py의 실제 분석 지표를 Ensemble Radar 차트에 매핑
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
                }
            }
            # 컨센서스 점수 업데이트
            payload["ensemble_analysis"]["consensus_score"] = overall_score_from_analysis

        # original_analysis_result도 실제 데이터로 정확히 덮어쓰기
        payload["original_analysis_result"] = data
        
        return payload
    else:
        print(f"[{device_id}] DB에 COMPLETED 분석 결과 없음. 기본값 반환.")
        return get_default_payload()
