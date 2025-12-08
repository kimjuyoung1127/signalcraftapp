import logging
import numpy as np
from pathlib import Path
from typing import Tuple

# Librosa is a heavy library, so import it only if needed
try:
    import librosa
except ImportError:
    librosa = None
    logging.warning("Librosa is not available. Audio loading and processing will be disabled.")

from scipy.signal import butter, lfilter, hilbert
from scipy.fft import fft, fftfreq
from scipy.ndimage import maximum_filter1d

# Import constants from config_analysis
from app.core.config_analysis import SAMPLE_RATE, BP_LOW, BP_HIGH

logger = logging.getLogger(__name__)

class DSPFilter:
    """
    디지털 신호 처리(DSP) 필터링 및 전처리 모듈.
    오디오 리샘플링, 밴드패스 필터링 등을 수행합니다.
    """

    def __init__(self):
        if librosa is None:
            logger.error("DSPFilter requires librosa but it's not available.")
            raise ImportError("librosa is required for DSPFilter but not found.")

    async def process_audio(self, audio_path: Path) -> Tuple[np.ndarray, int]:
        """
        오디오 파일을 로드하고 리샘플링 및 전처리를 수행합니다.

        Args:
            audio_path (Path): 오디오 파일의 경로.

        Returns:
            Tuple[np.ndarray, int]: 전처리된 오디오 데이터 (y)와 샘플링 레이트 (sr).
        """
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE, duration=10) # Load and resample to SAMPLE_RATE
        
        logger.info(f"Audio loaded and resampled to {SAMPLE_RATE}Hz from {audio_path.name}")

        # Apply bandpass filter if needed (or keep it in envelope_analysis/calculate_band_energy)
        # For now, just resampling and returning. Further filtering will be in specific analysis functions.
        
        return y, SAMPLE_RATE

    def calculate_band_energy(self, y: np.ndarray, sr: int, low_freq: float, high_freq: float) -> float:
        """지정된 주파수 대역의 에너지 비율 계산"""
        try:
            # STFT를 사용하여 스펙트로그램 얻기
            S = np.abs(librosa.stft(y))
            
            # 주파수 축 가져오기
            freqs = librosa.fft_frequencies(sr=sr)
            
            # 해당 주파수 대역의 인덱스 찾기
            if high_freq > freqs[-1]:
                high_freq = freqs[-1]
            
            if low_freq >= high_freq:
                return 0.0

            idx_low = np.where(freqs >= low_freq)[0][0] if np.any(freqs >= low_freq) else 0
            idx_high = np.where(freqs <= high_freq)[0][-1] if np.any(freqs <= high_freq) else len(freqs) - 1
            
            # 해당 대역의 에너지 합산
            band_energy = np.sum(S[idx_low:idx_high+1, :])
            
            # 전체 에너지 합산
            total_energy = np.sum(S)
            
            return band_energy / total_energy if total_energy > 0 else 0
        except Exception as e:
            logger.warning(f"   ⚠️ 에너지 계산 중 오류: {e}")
            return 0.0

    def envelope_analysis(self, y: np.ndarray, sr: int) -> list:
        """
        Performs envelope analysis to identify bearing fault frequencies.
        Uses BP_LOW and BP_HIGH from config_analysis for the bandpass filter.
        """
        # 1. Bandpass Filter (from config)
        lowcut = BP_LOW
        highcut = BP_HIGH
        order = 5
        nyquist = 0.5 * sr
        
        if lowcut >= nyquist or highcut >= nyquist or lowcut >= highcut:
            logger.warning(f"Invalid filter frequencies for SR {sr}. Nyquist: {nyquist}. Lowcut: {lowcut}, Highcut: {highcut}")
            return []

        try:
            b, a = butter(order, [lowcut, highcut], btype='band', fs=sr)
            filtered_signal = lfilter(b, a, y)
        except Exception as e:
            logger.warning(f"Bandpass filtering failed: {e}")
            return []

        # 2. Hilbert Transform (Extract Envelope)
        analytic_signal = hilbert(filtered_signal)
        amplitude_envelope = np.abs(analytic_signal)

        # 3. FFT (Spectrum of the Envelope)
        n = len(amplitude_envelope)
        yf = fft(amplitude_envelope)
        xf = fftfreq(n, 1 / sr)[:n//2]

        magnitude = 2.0/n * np.abs(yf[0:n//2])

        # 4. Find significant peaks
        peak_frequencies = []
        freq_limit = 500 # Bearing fault frequencies are usually low frequency components
        valid_indices = np.where(xf <= freq_limit)
        
        if len(valid_indices[0]) == 0:
            return []

        window_size = int(sr / 200) # Tune as needed
        peaks = maximum_filter1d(magnitude[valid_indices], size=window_size) == magnitude[valid_indices]
        
        min_peak_magnitude = np.mean(magnitude[valid_indices]) + np.std(magnitude[valid_indices])
        
        for i, is_peak in enumerate(peaks):
            if is_peak and magnitude[valid_indices][i] > min_peak_magnitude:
                peak_frequencies.append(xf[valid_indices][i])
                
        return sorted(list(set(peak_frequencies)))
