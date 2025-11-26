import librosa
import numpy as np
import os

def analyze_audio_file(file_path: str):
    """
    Analyze the audio file using Librosa to extract physical properties.
    
    Returns a dictionary with:
    - label: "NORMAL" | "WARNING" | "CRITICAL"
    - score: float (0.0 - 1.0, generic anomaly score)
    - summary: str
    - details: {
        noise_level: float (dB),
        frequency: float (Hz),
        vibration: float (arbitrary unit based on RMS stability)
    }
    """
    try:
        # 1. Load Audio File
        # sr=None preserves the native sampling rate, but for consistent analysis we can use 22050
        y, sr = librosa.load(file_path, sr=22050)
        
        # 2. Extract Features
        
        # 2.1 RMS (Root Mean Square) -> Volume/Energy
        rms = librosa.feature.rms(y=y)
        avg_rms = np.mean(rms)
        # Convert to roughly dB (Note: this is relative to full scale, not absolute SPL without calibration)
        # We add an offset to make it look like realistic SPL for the demo
        db_level = 20 * np.log10(avg_rms + 1e-9) + 80  # Mapping -60~0 to 20~80 range roughly
        db_level = max(0, db_level) # Ensure non-negative

        # 2.2 Spectral Centroid -> Brightness/Average Frequency
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        avg_freq = np.mean(spectral_centroids)
        
        # 2.3 Harmonics and Percussive components (to guess vibration/impact)
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        percussive_strength = np.mean(librosa.feature.rms(y=y_percussive))
        vibration_index = percussive_strength * 100 # Scale up for display

        # 3. Anomaly Detection Logic (Simple Heuristics for Demo)
        label = "NORMAL"
        summary = "장비 작동음이 안정적입니다."
        score = 0.95 # High score = Good health
        
        # Rule 1: Loud noise (e.g. > 85 dB)
        if db_level > 85:
            label = "CRITICAL"
            summary = "위험 수준의 소음이 감지되었습니다. (과부하 의심)"
            score = 0.2
        # Rule 2: High frequency squeal (e.g. > 3000 Hz) -> Bearing fault
        elif avg_freq > 3000:
            label = "WARNING"
            summary = "고주파 소음이 감지되었습니다. (베어링 마모 의심)"
            score = 0.6
        # Rule 3: Moderate noise (e.g. > 75 dB)
        elif db_level > 75:
            label = "WARNING"
            summary = "평소보다 소음이 큽니다. 주의가 필요합니다."
            score = 0.7
        # Rule 4: Impact/Knocking sound
        elif vibration_index > 5.0:
             label = "CRITICAL"
             summary = "강한 충격음이 감지되었습니다. (부품 파손 위험)"
             score = 0.3

        return {
            "label": label,
            "score": round(score, 2),
            "summary": summary,
            "details": {
                "noise_level": round(float(db_level), 1),
                "frequency": round(float(avg_freq), 1),
                "vibration": round(float(vibration_index), 2)
            }
        }

    except Exception as e:
        print(f"[Analyzer] Error analyzing file {file_path}: {e}")
        # Return a safe fallback in case of processing error (e.g. empty file)
        return {
            "label": "WARNING",
            "score": 0.0,
            "summary": f"분석 중 오류가 발생했습니다: {str(e)}",
            "details": {
                "noise_level": 0,
                "frequency": 0,
                "vibration": 0
            }
        }
