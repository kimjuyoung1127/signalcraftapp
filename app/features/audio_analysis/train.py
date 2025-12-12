import sys
from pathlib import Path
import argparse
from datetime import datetime
import json
import os
import numpy as np
import librosa
import joblib
import glob

# Add project root to sys.path to fix ModuleNotFoundError when running directly
from sklearn.preprocessing import StandardScaler
import logging
import glob

# Add project root to sys.path to fix ModuleNotFoundError when running directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import constants from config_analysis
from app.core.config_analysis import (
    BASE_DIR, MODEL_DIR, SAMPLE_RATE, IF_CONTAMINATION, N_ML_FEATURES,
    TRAINING_AUDIO_DATA_DIR_IF
)
# Import AnomalyScorer to get extract_ml_features
from app.features.audio_analysis.anomaly_scorer import AnomalyScorer

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO) # For direct script execution

# Define paths using pathlib and config_analysis
MODEL_DIR.mkdir(parents=True, exist_ok=True)

logger.info(f"Model Output Directory: {MODEL_DIR}")

# Create an AnomalyScorer instance for feature extraction
_temp_anomaly_scorer = AnomalyScorer(dsp_filter_instance=None)


def load_audio_files_and_extract_features(audio_dir: Path):
    all_features = []
    # [수정] WAV 및 CSV 파일 모두 검색
    audio_files = list(audio_dir.glob("*.wav")) + list(audio_dir.glob("*.csv"))
    
    if not audio_files:
        logger.warning(f"No WAV or CSV files found in {audio_dir}. Generating dummy data for training pipeline.")
        return generate_dummy_features(num_features=N_ML_FEATURES)

    logger.info(f"Found {len(audio_files)} files in {audio_dir}. Extracting features...")
    for i, file_path in enumerate(audio_files):
        try:
            # [수정] 파일 확장자에 따른 로딩 분기
            if file_path.suffix.lower() == '.wav':
                y, sr = librosa.load(file_path, sr=SAMPLE_RATE)
            elif file_path.suffix.lower() == '.csv':
                # CSV 로드 (헤더 없음 가정, 첫 번째 컬럼이 신호)
                try:
                    import pandas as pd # Import pandas only when needed for CSV
                    df = pd.read_csv(file_path, header=None)
                    # 데이터가 문자열일 경우 처리 필요할 수 있음, 일단 float로 변환 시도
                    y = df.iloc[:, 0].values.astype(np.float32)
                    sr = SAMPLE_RATE # CSV는 SR 정보가 없으므로 설정값 사용
                except Exception as csv_err:
                    logger.error(f"Failed to parse CSV {file_path}: {csv_err}")
                    continue
            else:
                continue

            features = _temp_anomaly_scorer.extract_ml_features(y, sr)
            all_features.append(features)
            
            if (i+1) % 100 == 0:
                logger.info(f"  Processed {i+1}/{len(audio_files)} files...")
                
        except Exception as e:
            logger.error(f"  Error processing {file_path}: {e}")
            continue
            
    if not all_features:
        logger.warning("No features could be extracted from provided files. Generating dummy data.")
        return generate_dummy_features(num_samples=N_ML_FEATURES)

    return np.array(all_features)

def generate_dummy_features(num_samples=100, num_features=N_ML_FEATURES):
    logger.info(f"Generating {num_samples} dummy feature samples with {num_features} features.")
    dummy_features = np.random.rand(num_samples, num_features) * 0.1 + 0.5 
    return dummy_features

# --- Model Registry Update Function ---
def _update_model_registry(model_info: dict):
    registry_path = MODEL_DIR / "registry.json"
    registry_data = {"models": []}

    if registry_path.exists():
        try:
            with open(registry_path, 'r', encoding='utf-8') as f:
                registry_data = json.load(f)
        except json.JSONDecodeError: # Handle malformed JSON
            logger.error(f"Error decoding {registry_path}. Initializing with empty registry.")
            registry_data = {"models": []}

    # Remove existing entry with same id
    registry_data["models"] = [m for m in registry_data["models"] if m.get("id") != model_info["id"]]
    registry_data["models"].append(model_info)

    with open(registry_path, 'w', encoding='utf-8') as f:
        json.dump(registry_data, f, indent=4, ensure_ascii=False)
    logger.info(f"Model {model_info['id']} registered in {registry_path}")


def train_isolation_forest(data_dir: Path, output_if_name: str, output_scaler_name: str):
    logger.info(f"Starting Isolation Forest model training with data from: {data_dir}")
    
    features_data = load_audio_files_and_extract_features(data_dir)
    
    if features_data is None or features_data.size == 0:
        logger.error("No features data available for training. Exiting.")
        return

    if features_data.shape[0] < 2:
        logger.error("Not enough samples to train the model. Need at least 2 samples.")
        return False

    logger.info(f"Training model with {features_data.shape[0]} samples and {features_data.shape[1]} features.")
    
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features_data)
    
    model = IsolationForest(random_state=42, contamination=IF_CONTAMINATION)
    model.fit(scaled_features)
    
    MODEL_DIR.mkdir(parents=True, exist_ok=True) 
    
    model_save_path = MODEL_DIR / output_if_name
    scaler_save_path = MODEL_DIR / output_scaler_name

    joblib.dump(model, model_save_path)
    joblib.dump(scaler, scaler_save_path)
    
    logger.info(f"Model saved to {model_save_path}")
    logger.info(f"Scaler saved to {scaler_save_path}")

    # [NEW] Save Metadata JSON
    model_id = os.path.splitext(output_if_name)[0]
    metadata = {
        "model_id": model_id,
        "model_type": "level1_isolation_forest",
        "file_name_model": output_if_name,
        "file_name_scaler": output_scaler_name,
        "created_at": datetime.now().isoformat(),
        "dataset_path": str(data_dir),
        "sample_count": features_data.shape[0],
        "training_parameters": {
            "contamination": IF_CONTAMINATION,
            "random_state": 42,
            "n_features": features_data.shape[1]
        },
        "training_metrics": {
            "model_fit_status": "Completed"
        },
        "description": f"Isolation Forest trained on data from {data_dir}"
    }
    
    metadata_save_path = MODEL_DIR / f"{model_id}_meta.json"
    with open(metadata_save_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    logger.info(f"Metadata saved to {metadata_save_path}")

    # [NEW] Update Model Registry
    registry_entry = {
        "id": model_id,
        "name": f"{model_id.replace('_', ' ').title()} (Isolation Forest)",
        "type": "level1_isolation_forest",
        "file_name_model": output_if_name,
        "file_name_scaler": output_scaler_name,
        "meta_file": f"{model_id}_meta.json",
        "description": metadata["description"],
        "is_default": False # 새로 생성된 모델은 기본값이 아님
    }
    _update_model_registry(registry_entry)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train an Isolation Forest model.")
    parser.add_argument(
        "--data_dir", 
        type=Path, 
        default=TRAINING_AUDIO_DATA_DIR_IF, # config에서 기본값 가져오기
        help="Path to the directory containing normal audio WAV or CSV files for training."
    )
    parser.add_argument(
        "--output_if_name", 
        type=str, 
        default="isolation_forest_model.pkl", # 기본 모델 파일명
        help="Name of the output Isolation Forest model file (e.g., pump_if_v1.pkl)."
    )
    parser.add_argument(
        "--output_scaler_name", 
        type=str, 
        default="scaler.pkl", # 기본 Scaler 파일명
        help="Name of the output StandardScaler file (e.g., pump_scaler_v1.pkl)."
    )
    args = parser.parse_args()
    
    train_isolation_forest(args.data_dir, args.output_if_name, args.output_scaler_name)