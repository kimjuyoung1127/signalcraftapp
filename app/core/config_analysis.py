import os
from pathlib import Path

# 프로젝트의 루트 디렉토리를 Path 객체로 설정
# config_analysis.py가 app/core에 있다고 가정하고 두 단계 위로 이동
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# 모델 파일이 저장될 디렉토리 (app/models)
MODEL_DIR = BASE_DIR / "app" / "models"

# [NEW] 훈련 데이터 디렉토리 (통합) - 로컬 학습용
# Autoencoder 및 Isolation Forest는 normal 데이터만으로 학습
TRAINING_AUDIO_DATA_DIR_AE = BASE_DIR / "data_backup" / "normal"
TRAINING_AUDIO_DATA_DIR_IF = BASE_DIR / "data_backup" / "normal"

# --- 오디오 분석 관련 상수 ---
# 강제 리샘플링할 샘플링 레이트
SAMPLE_RATE = 16000

# 밴드패스 필터 주파수 대역 (Hz)
BP_LOW = 2000
BP_HIGH = 10000

# RMS 임계값 (초기/기본값) - 동적 임계값 적용 전까지 사용
RMS_WARN = 0.5
RMS_CRIT = 0.8

# ML 모델 관련 (Isolation Forest 등)
# 모델 학습 시 사용할 피처 수 (MFCC 13*2 + SC 2 + BW 2 + ZCR 2 + RO 2 = 30)
# 실제 추출될 피처 개수에 따라 조절 필요
N_ML_FEATURES = 30

# Isolation Forest contamination (이상치 비율)
IF_CONTAMINATION = 0.01

# --- API 버전 관리 ---
API_V1_PREFIX = "/api/v1"

# --- 기타 설정 ---
# 로깅 레벨 등
LOG_LEVEL = "INFO"
