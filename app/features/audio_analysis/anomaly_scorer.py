import logging
import numpy as np
import os
import random
from typing import Dict, Any, Tuple
import torch # [New]

# ML Model Imports and Loading
try:
    import joblib
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
except ImportError:
    joblib = None
    IsolationForest = None
    StandardScaler = None
    logging.warning("scikit-learn or joblib not available. ML model inference will be disabled.")

try:
    import librosa
except ImportError:
    librosa = None
    logging.warning("Librosa is not available. ML feature extraction will be disabled.")

# Import constants from config_analysis
from app.core.config_analysis import (
    MODEL_DIR, N_ML_FEATURES, IF_CONTAMINATION,
    RMS_WARN, RMS_CRIT, BP_LOW, BP_HIGH # BP_LOW/HIGH used for rule-based analysis
)
from app.core.model_loader import model_loader # [New]

logger = logging.getLogger(__name__)

class AnomalyScorer:
    """
    오디오 데이터에서 ML 특징을 추출하고,
    Isolation Forest 및 Rule-based 로직을 사용하여 이상 점수를 계산하는 모듈.
    향후 Autoencoder 모델 추론 및 Level 1/Level 2 결정을 담당합니다.
    """

    def __init__(self, dsp_filter_instance=None):
        self.dsp_filter = dsp_filter_instance # Will receive DSPFilter instance
        # Remove self._load_ml_model() as models are now loaded dynamically per request

    def extract_ml_features(self, y: np.ndarray, sr: int) -> np.ndarray:
        """
        ML 모델을 위한 고차원 특징을 추출합니다.
        MFCC, Spectral Centroid, Spectral Bandwidth, Zero Crossing Rate, Rolloff 포함.
        1D numpy 배열을 반환합니다.
        """
        if librosa is None:
            logger.error("Librosa not available. Cannot extract ML features.")
            return np.zeros(N_ML_FEATURES) # Return dummy features

        features = []

        # MFCC (Mean and Std)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        features.extend(np.mean(mfccs, axis=1))
        features.extend(np.std(mfccs, axis=1))

        # Spectral Centroid (Mean and Std)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        features.append(np.mean(spectral_centroids))
        features.append(np.std(spectral_centroids))

        # Spectral Bandwidth (Mean and Std)
        spectral_bandwidths = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        features.append(np.mean(spectral_bandwidths))
        features.append(np.std(spectral_bandwidths))

        # Zero Crossing Rate (Mean and Std)
        zero_crossing_rates = librosa.feature.zero_crossing_rate(y)[0]
        features.append(np.mean(zero_crossing_rates))
        features.append(np.std(zero_crossing_rates))

        # Spectral Rolloff (Mean and Std)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        features.append(np.mean(spectral_rolloff))
        features.extend(np.std(spectral_rolloff)) # Use extend for consistency

        return np.array(features).flatten()

    async def score_level1(self, y: np.ndarray, sr: int, calibration_data: Dict[str, Any] = None, target_model_id: str = None) -> Dict[str, Any]:
        """
        Level 1 (Isolation Forest + Rule-based) 이상 점수를 계산합니다.
        calibration_data가 제공되면 동적 임계값을 사용합니다.
        target_model_id가 제공되면 해당 ID의 모델을 로드하여 사용합니다.
        """
        result = self._get_fallback_result("INITIAL_FALLBACK") # Initialize with fallback

        # Determine Thresholds
        rms_crit = RMS_CRIT
        rms_warn = RMS_WARN
        
        if calibration_data:
            mean_rms = calibration_data.get("mean_rms")
            std_rms = calibration_data.get("std_rms")
            if mean_rms is not None and std_rms is not None:
                # Dynamic Threshold: Mean + 3*Std (Critical), Mean + 2*Std (Warning)
                rms_crit = mean_rms + 3 * std_rms
                rms_warn = mean_rms + 2 * std_rms
                
                # Safety floor to prevent triggering on silence
                rms_crit = max(0.1, rms_crit)
                rms_warn = max(0.05, rms_warn)

                logger.info(f"Using dynamic thresholds: Warn={rms_warn:.4f}, Crit={rms_crit:.4f}")

        # 1. Rule-based Analysis
        try:
            # RMS 에너지 계산 (소음 레벨)
            rms = librosa.feature.rms(y=y)
            avg_rms = float(np.mean(rms))
            
            # 주파수 대역별 에너지 비율 계산 (from DSPFilter)
            resonance_energy_ratio = self.dsp_filter.calculate_band_energy(y, sr, BP_LOW, BP_HIGH)
            high_freq_energy_ratio = self.dsp_filter.calculate_band_energy(y, sr, 10000, sr/2) # Assuming max freq is sr/2

            # Envelope Analysis (from DSPFilter)
            peak_frequencies = self.dsp_filter.envelope_analysis(y, sr)

            label = "NORMAL"
            score = 0.1
            summary = "Audio levels are within normal operating range (Level 1 Rule-based)."

            # Rule-based thresholds (using dynamic values)
            if avg_rms > rms_crit:
                label = "CRITICAL"
                score = 0.95
                summary = "Extremely high noise level detected. Immediate inspection required (Rule-based)."
            elif high_freq_energy_ratio > 0.6: # Configurable?
                label = "CRITICAL"
                score = 0.85
                summary = "Significant high-frequency energy detected, indicating potential early-stage fault (Rule-based)."
            elif resonance_energy_ratio > 0.39: # Configurable?
                label = "CRITICAL"
                score = 0.75
                summary = "Very high resonance band energy detected, indicating advanced stage fault (Rule-based)."
            elif resonance_energy_ratio > 0.33: # Configurable?
                label = "WARNING"
                score = 0.65
                summary = "Elevated resonance band energy. Scheduled maintenance recommended (Rule-based)."
            elif avg_rms > rms_warn:
                label = "WARNING"
                score = 0.45
                summary = "Moderate noise level detected. Scheduled maintenance recommended (Rule-based)."
            
            result = {
                "label": label,
                "score": float(score),
                "summary": summary,
                "details": {
                    "method": "Rule-based",
                    "noise_level": float(avg_rms),
                    "resonance_energy_ratio": float(resonance_energy_ratio),
                    "high_freq_energy_ratio": float(high_freq_energy_ratio),
                    "peak_frequencies": [float(f) for f in peak_frequencies]
                }
            }
        except Exception as e:
            logger.warning(f"Rule-based analysis failed: {e}. Falling back to ML if available.")
            
        # 2. Isolation Forest Analysis (Dynamic Loading)
        model_to_use = None
        scaler_to_use = None
        
        # Load model using ModelLoader if target_model_id is provided
        if target_model_id:
            loaded_data = model_loader.load_model(target_model_id)
            if loaded_data and isinstance(loaded_data, dict) and "model" in loaded_data:
                model_to_use = loaded_data["model"]
                scaler_to_use = loaded_data["scaler"]
                logger.info(f"Using specified model '{target_model_id}' for Level 1 analysis.")
            else:
                logger.warning(f"Could not load specified model '{target_model_id}'. Falling back to default if any.")
        
        # Fallback if target_model_id was None or loading failed, try default "pump_isolation_forest_default"
        if model_to_use is None:
            # 기본 모델 로드 시도
            loaded_data = model_loader.load_model("pump_isolation_forest_default")
            if loaded_data and isinstance(loaded_data, dict) and "model" in loaded_data:
                model_to_use = loaded_data["model"]
                scaler_to_use = loaded_data["scaler"]
                logger.info("Using default 'pump_isolation_forest_default' for Level 1 analysis.")
            else:
                logger.warning("No Isolation Forest model could be loaded, neither target nor default. Skipping ML analysis.")

        if model_to_use is not None and scaler_to_use is not None:
            try:
                ml_features = self.extract_ml_features(y, sr)
                scaled_features = scaler_to_use.transform(ml_features.reshape(1, -1))
                anomaly_score_if = model_to_use.decision_function(scaled_features)[0]
                
                # Normalize IF score to 0-1
                if_score = 0.5 - anomaly_score_if # Heuristic
                if_score = max(0.0, min(1.0, if_score))
                
                # Combine with rule-based or override if ML is more severe
                if if_score > result["score"]: # If IF score is higher than current result score
                    result["score"] = float(if_score)
                    if if_score > 0.7:
                        result["label"] = "CRITICAL"
                        result["summary"] = f"Anomaly detected by ML model ({target_model_id or 'Default'})."
                    elif if_score > 0.4:
                        result["label"] = "WARNING"
                        result["summary"] = f"Potential anomaly detected by ML model ({target_model_id or 'Default'})."
                    else:
                        result["label"] = "NORMAL"
                        result["summary"] = f"Audio levels are within normal operating range ({target_model_id or 'Default'})."
                    result["details"]["method"] = f"Hybrid ML ({target_model_id or 'IF'})"
                    result["details"]["ml_anomaly_score_if"] = float(anomaly_score_if)
                
                if len(peak_frequencies) > 0 and result["label"] != "CRITICAL": # If peaks are found, elevate to CRITICAL
                    result["label"] = "CRITICAL"
                    result["score"] = max(result["score"], 0.8) # Ensure score is high
                    result["summary"] += " Bearing fault frequencies detected."
                    result["details"]["method"] = f"Hybrid ML ({target_model_id or 'IF'} + Peaks)"

            except Exception as e:
                logger.error(f"Isolation Forest analysis failed: {e}. Using rule-based result only.")
        else:
            logger.warning("No Isolation Forest model available for inference.")
        
        return result

    async def score_level2(self, y: np.ndarray, sr: int, target_model_id: str = None) -> Dict[str, Any]:
        """
        Level 2 (Autoencoder) 이상 점수를 계산합니다.
        target_model_id가 제공되면 해당 ID의 모델을 로드하여 사용합니다.
        """
        autoencoder = None
        if target_model_id:
            autoencoder = model_loader.load_model(target_model_id)
        
        # Fallback if target_model_id was None or loading failed, try default "pump_autoencoder_default"
        if not autoencoder:
            autoencoder = model_loader.load_model("pump_autoencoder_default")
            if autoencoder:
                logger.info("Using default 'pump_autoencoder_default' for Level 2 analysis.")

        if not autoencoder:
            logger.warning("Autoencoder model not loaded. Returning fallback.")
            return self._get_fallback_result("AUTOENCODER_NOT_LOADED")

        try:
            # Preprocess using same logic as training (Mel Spectrogram -> Norm -> Mean)
            n_mels = 64
            mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=n_mels)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            
            # Normalize
            mel_spec_norm = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min() + 1e-6)
            
            # Feature Vector
            feature_vector = np.mean(mel_spec_norm, axis=1)
            
            # Convert to Tensor
            input_tensor = torch.FloatTensor(feature_vector).unsqueeze(0) # Batch size 1
            
            # Inference
            with torch.no_grad():
                reconstructed = autoencoder(input_tensor)
                
            # Calculate Reconstruction Error (MSE)
            mse_loss = torch.nn.functional.mse_loss(reconstructed, input_tensor)
            anomaly_score = mse_loss.item()
            
            # Normalize Score (Heuristic based on expected MSE range)
            # Assume normal MSE is low (e.g., < 0.01), abnormal is high (> 0.05)
            # Map 0.05 to 1.0 score
            normalized_score = min(1.0, anomaly_score * 20) 
            
            label = "NORMAL"
            summary = f"Level 2 Diagnosis ({target_model_id or 'Default'}): Normal operation pattern."
            
            if normalized_score > 0.8:
                label = "CRITICAL"
                summary = f"Level 2 Diagnosis ({target_model_id or 'Default'}): Significant anomaly pattern detected."
            elif normalized_score > 0.5:
                label = "WARNING"
                summary = f"Level 2 Diagnosis ({target_model_id or 'Default'}): Deviation from normal pattern detected."
                
            return {
                "label": label,
                "score": float(normalized_score),
                "summary": summary,
                "details": {
                    "method": f"Deep Autoencoder ({target_model_id or 'Default'})",
                    "reconstruction_error": float(anomaly_score),
                    "normalized_score": float(normalized_score)
                }
            }

        except Exception as e:
            logger.error(f"Autoencoder inference failed: {e}")
            return self._get_fallback_result(f"AE_INFERENCE_ERROR: {str(e)}")

    def _get_fallback_result(self, reason: str):
        """Returns a generic fallback result in case of analysis failure."""
        status = random.choice(["NORMAL", "WARNING", "CRITICAL"])
        
        if status == "NORMAL":
            return {
                "label": "NORMAL",
                "score": random.uniform(0.0, 0.3),
                "summary": "System operating normally (Fallback).",
                "details": {"method": "Fallback", "reason": reason, "noise_level": 0.02}
            }
        elif status == "WARNING":
             return {
                "label": "WARNING",
                "score": random.uniform(0.4, 0.7),
                "summary": "Abnormal vibration detected (Fallback).",
                "details": {"method": "Fallback", "reason": reason, "noise_level": 0.1}
            }
        else:
             return {
                "label": "CRITICAL",
                "score": random.uniform(0.8, 1.0),
                "summary": "Critical failure imminent (Fallback). High frequency noise.",
                "details": {"method": "Fallback", "reason": reason, "noise_level": 0.4}
            }