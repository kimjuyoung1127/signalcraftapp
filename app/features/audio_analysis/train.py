import os
import numpy as np
import librosa
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import logging
import glob
import sys

# Add the project root to sys.path
# project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
# if project_root not in sys.path:
#     sys.path.insert(0, project_root)

# Add the directory containing analyzer.py to sys.path to import it directly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

logger.info(f"Added {current_dir} to sys.path")

# Import analyzer directly to avoid triggering app.__init__ and database connections
try:
    from analyzer import extract_ml_features
except ImportError as e:
    logger.error(f"Could not import extract_ml_features: {e}")
    exit(1)

# Define paths (Absolute paths based on script location)
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # app/features/audio_analysis
APP_DIR = os.path.dirname(os.path.dirname(BASE_DIR))  # app
DATA_DIR = os.path.join(APP_DIR, "data")

TRAINING_AUDIO_DIR = os.path.join(DATA_DIR, "training_audio")
MODEL_DIR = os.path.join(APP_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

# Ensure directories exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(TRAINING_AUDIO_DIR, exist_ok=True)

logger.info(f"Training Audio Directory: {TRAINING_AUDIO_DIR}")
logger.info(f"Model Output Directory: {MODEL_DIR}")

def load_audio_files_and_extract_features(audio_dir):
    """
    Loads audio files from a directory, extracts ML features.
    Assumes all audio files represent 'normal' operating conditions for IsolationForest.
    """
    all_features = []
    audio_files = glob.glob(os.path.join(audio_dir, "*.wav"))
    
    if not audio_files:
        logger.warning(f"No WAV files found in {audio_dir}. Generating dummy data for training pipeline.")
        return generate_dummy_features()

    logger.info(f"Found {len(audio_files)} audio files in {audio_dir}. Extracting features...")
    for i, file_path in enumerate(audio_files):
        try:
            y, sr = librosa.load(file_path, sr=None) # Load with original sampling rate
            features = extract_ml_features(y, sr)
            all_features.append(features)
            logger.info(f"  Processed {i+1}/{len(audio_files)}: {os.path.basename(file_path)}")
        except Exception as e:
            logger.error(f"  Error processing {file_path}: {e}")
            continue
            
    if not all_features:
        logger.warning("No features could be extracted from provided audio files. Generating dummy data.")
        return generate_dummy_features()

    return np.array(all_features)

def generate_dummy_features(num_samples=100, num_features=26): # 13 MFCCs mean/std + 5 other mean/std = 26
    """Generates dummy features for testing the training pipeline."""
    logger.info(f"Generating {num_samples} dummy feature samples with {num_features} features.")
    # Simulate features, e.g., for normal operation (IsolationForest learns normal)
    dummy_features = np.random.rand(num_samples, num_features) * 0.1 + 0.5 # Values around 0.5 with small variance
    return dummy_features

def train_and_save_model(features):
    """
    Trains an IsolationForest model and a StandardScaler, then saves them.
    """
    if features.shape[0] < 2: # IsolationForest needs at least 2 samples if n_estimators > 1
        logger.error("Not enough samples to train the model. Need at least 2 samples.")
        return False

    logger.info(f"Training model with {features.shape[0]} samples and {features.shape[1]} features.")
    
    # 1. Scale features
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)
    
    # 2. Train Isolation Forest model
    # contamination is the proportion of outliers in the data set (if known).
    # For unsupervised anomaly detection, it can be estimated or set to a small value (e.g., 0.01-0.1).
    # Since we assume training data is mostly normal, a low contamination is appropriate.
    model = IsolationForest(random_state=42, contamination=0.01)
    model.fit(scaled_features)
    
    # 3. Save model and scaler
    os.makedirs(MODEL_DIR, exist_ok=True)
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
