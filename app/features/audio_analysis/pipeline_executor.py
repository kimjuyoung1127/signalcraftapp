import logging
from pathlib import Path
from typing import Dict, Any

# Import the new config
from app.core.config_analysis import (
    SAMPLE_RATE
)
from app.features.audio_analysis.dsp_filter import DSPFilter
from app.features.audio_analysis.anomaly_scorer import AnomalyScorer

logger = logging.getLogger(__name__)

class PipelineExecutor:
    """
    오디오 분석 파이프라인을 실행하는 Executor 클래스.
    이 클래스는 각 기능별 모듈(DSP 필터, 이상 스코어러)을
    조율하고 최종 분석 결과를 반환합니다.
    """

    def __init__(self):
        self.dsp_filter = DSPFilter()
        self.anomaly_scorer = AnomalyScorer(dsp_filter_instance=self.dsp_filter)

    async def analyze_audio_file(self, file_path: Path, model_preference: str = "level1", calibration_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        주어진 오디오 파일을 분석하여 진단 결과를 반환합니다.

        Args:
            file_path (Path): 분석할 오디오 파일의 경로.
            model_preference (str): 사용할 모델 레벨 ('level1' 또는 'level2').
            calibration_data (Dict[str, Any]): 장비별 캘리브레이션 데이터 (Optional).

        Returns:
            Dict[str, Any]: 분석 결과 딕셔너리 (label, score, summary, details 등).
        """
        logger.info(f"Analyzing audio file: {file_path} with model preference: {model_preference}")

        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        # 1. DSP Filtering & Preprocessing (resampling, bandpass etc.)
        y, sr = await self.dsp_filter.process_audio(file_path)

        # 2. Anomaly Scoring based on model preference
        if model_preference == "level2":
            result = await self.anomaly_scorer.score_level2(y, sr)
        else: # Default to level1
            result = await self.anomaly_scorer.score_level1(y, sr, calibration_data=calibration_data)
        
        return result
