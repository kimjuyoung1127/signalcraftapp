import numpy as np
import librosa
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import logging
import glob
import sys
from pathlib import Path

# Import constants from config_analysis
from app.core.config_analysis import (
    BASE_DIR, MODEL_DIR, SAMPLE_RATE, IF_CONTAMINATION, N_ML_FEATURES
)
# Import AnomalyScorer to get extract_ml_features
from app.features.audio_analysis.anomaly_scorer import AnomalyScorer

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Define paths using pathlib and config_analysis
TRAINING_AUDIO_DIR = BASE_DIR / "data" / "training_audio"
MODEL_PATH = MODEL_DIR / "isolation_forest_model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"

# Ensure directories exist
MODEL_DIR.mkdir(parents=True, exist_ok=True)
TRAINING_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

logger.info(f"Training Audio Directory: {TRAINING_AUDIO_DIR}")
logger.info(f"Model Output Directory: {MODEL_DIR}")

# Create an AnomalyScorer instance for feature extraction
# We pass dsp_filter_instance=None because extract_ml_features does not use it.
_temp_anomaly_scorer = AnomalyScorer(dsp_filter_instance=None)


def load_audio_files_and_extract_features(audio_dir: Path):
    """
    Loads audio files from a directory, extracts ML features.
    Assumes all audio files represent 'normal' operating conditions for IsolationForest.
    Uses SAMPLE_RATE from config_analysis for librosa.load.
    """
    all_features = []
    audio_files = list(audio_dir.glob("*.wav")) # Use pathlib glob
    
    if not audio_files:
        logger.warning(f"No WAV files found in {audio_dir}. Generating dummy data for training pipeline.")
        return generate_dummy_features(num_features=N_ML_FEATURES)

    logger.info(f"Found {len(audio_files)} audio files in {audio_dir}. Extracting features...")
    for i, file_path in enumerate(audio_files):
        try:
            # Use SAMPLE_RATE from config_analysis
            y, sr = librosa.load(file_path, sr=SAMPLE_RATE)
            # Use AnomalyScorer's method for feature extraction
            features = _temp_anomaly_scorer.extract_ml_features(y, sr)
            all_features.append(features)
            logger.info(f"  Processed {i+1}/{len(audio_files)}: {file_path.name}")
        except Exception as e:
            logger.error(f"  Error processing {file_path}: {e}")
            continue
            
    if not all_features:
        logger.warning("No features could be extracted from provided audio files. Generating dummy data.")
        return generate_dummy_features(num_features=N_ML_FEATURES)

    return np.array(all_features)

def generate_dummy_features(num_samples=100, num_features=N_ML_FEATURES):
    """Generates dummy features for testing the training pipeline."""
    logger.info(f"Generating {num_samples} dummy feature samples with {num_features} features.")
    # Simulate features, e.g., for normal operation (IsolationForest learns normal)
    dummy_features = np.random.rand(num_samples, num_features) * 0.1 + 0.5 # Values around 0.5 with small variance
    return dummy_features

def train_and_save_model(features):
    """
    Trains an IsolationForest model and a StandardScaler, then saves them.
    """
    if features.shape[0] < 2:
        logger.error("Not enough samples to train the model. Need at least 2 samples.")
        return False

    logger.info(f"Training model with {features.shape[0]} samples and {features.shape[1]} features.")
    
    # 1. Scale features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)
    
    # 2. Train Isolation Forest model
    # Use IF_CONTAMINATION from config_analysis
    model = IsolationForest(random_state=42, contamination=IF_CONTAMINATION)
    model.fit(scaled_features)
    
    # 3. Save model and scaler
    MODEL_DIR.mkdir(parents=True, exist_ok=True) # Ensure MODEL_DIR exists (redundant but safe)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    logger.info(f"Model saved to {MODEL_PATH}")
    logger.info(f"Scaler saved to {SCALER_PATH}")
    return True

if __name__ == "__main__":
    logger.info("Starting audio analysis model training.")
    
    features_data = load_audio_files_and_extract_features(TRAINING_AUDIO_DIR)
    
    if features_data is not None and features_data.size > 0:
        if train_and_save_model(features_data):
            logger.info("Model training completed successfully.")
        else:
            logger.error("Model training failed.")
    else:
        logger.error("No features data available for training.")

