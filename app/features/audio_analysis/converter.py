import os
import subprocess
import tempfile
from pathlib import Path
import uuid
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AudioConverter:
    """
    오디오 파일 변환을 위한 유틸리티 클래스
    - M4A → WAV 변환 (안드로이드)
    - WAV 검증 및 최적화 (iOS)
    - 특징: 임시 파일 자동 정리, 변환 실패시 원본 보존
    """
    
    @staticmethod
    def ensure_wav_format(file_path: str) -> str:
        """
        입력 파일을 WAV 포맷으로 변환하고 WAV 파일 경로 반환
        이미 WAV인 경우 검증 후 그대로 반환
        
        Args:
            file_path: 원본 오디오 파일 경로
            
        Returns:
            str: WAV 파일 경로
            
        Raises:
            ValueError: 지원하지 않는 포맷
            RuntimeError: 변환 실패
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        # 이미 WAV인 경우 검증 후 반환
        if file_path.suffix.lower() == '.wav':
            if AudioConverter._validate_wav(file_path):
                return str(file_path)
            else:
                logger.warning(f"Invalid WAV detected, converting: {file_path}")
                return AudioConverter._convert_invalid_wav(file_path)
        
        # M4A 또는 MP4의 경우 변환
        if file_path.suffix.lower() in ['.m4a', '.mp4']:
            return AudioConverter._convert_m4a_to_wav(file_path)
        
        # 지원하지 않는 포맷
        raise ValueError(f"Unsupported audio format: {file_path.suffix}")
    
    @staticmethod
    def _convert_m4a_to_wav(input_path: Path) -> str:
        """M4A 파일을 고품질 WAV로 변환"""
        output_path = input_path.parent / f"{input_path.stem}_converted.wav"
        
        try:
            cmd = [
                'ffmpeg',
                '-i', str(input_path),          # 입력 파일
                '-ar', '22050',                # 샘플레이트 (안정성)
                '-ac', '1',                    # 모노 (파일 크기 효율)
                '-f', 'wav',                   # WAV 포맷
                '-sample_fmt', 's16',         # 16-bit PCM
                str(output_path)               # 출력 파일
            ]
            
            logger.info(f"Converting M4A to WAV: {input_path} → {output_path}")
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True,
                timeout=60  # 60초 타임아웃
            )
            
            if result.returncode != 0:
                error_msg = result.stderr or "Unknown error"
                raise RuntimeError(f"FFmpeg conversion failed: {error_msg}")
            
            # 변환 성공 후 원본 파일 정리
            input_path.unlink(missing_ok=True)
            logger.info(f"✅ 변환 성공: {output_path}")
            
            return str(output_path)
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Audio conversion timeout (60 seconds)")
        except Exception as e:
            raise RuntimeError(f"Audio conversion failed: {e}")
    
    @staticmethod
    def _convert_invalid_wav(input_path: Path) -> str:
        """손상되거나 비표준 WAV 파일을 재변환"""
        temp_path = input_path.parent / f"temp_{uuid.uuid4()}.wav"
        
        try:
            # 비표준 WAV를 표준 WAV로 변환
            cmd = [
                'ffmpeg',
                '-i', str(input_path),
                '-ar', '22050',
                '-ac', '1',
                '-f', 'wav',
                '-sample_fmt', 's16',
                str(temp_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                input_path.unlink(missing_ok=True)  # 원본 삭제
                return str(temp_path.rename(input_path))  # 원본 이름으로 대체
            else:
                raise RuntimeError(f"WAV re-conversion failed: {result.stderr}")
                
        except Exception as e:
            # 실패 시 원본 보존
            logger.error(f"WAV conversion failed, original preserved: {e}")
            return str(input_path)
    
    @staticmethod
    def _validate_wav(file_path: Path) -> bool:
        """WAV 파일 유효성 검사"""
        try:
            cmd = ['ffmpeg', '-i', str(file_path), '-f', 'null', '-']
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0
        except Exception:
            return False
    
    @staticmethod
    def get_audio_info(file_path: str) -> dict:
        """
        오디오 파일 메타데이터 조회
        
        Returns:
            dict: {duration, sample_rate, channels, size_mb}
        """
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                file_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                return {}
            
            import json
            data = json.loads(result.stdout)
            
            if 'streams' not in data or len(data['streams']) == 0:
                return {}
            
            stream = data['streams'][0]
            audio_info = {
                'duration': float(stream.get('duration', 0)),
                'sample_rate': int(stream.get('sample_rate', 0)),
                'channels': int(stream.get('channels', 0)),
                'codec': stream.get('codec_name', 'unknown'),
                'size_mb': 0
            }
            
            # 파일 크기 계산
            if 'format' in data and 'size' in data['format']:
                audio_info['size_mb'] = int(data['format']['size']) / (1024 * 1024)
            
            return audio_info
            
        except Exception as e:
            logger.error(f"Failed to get audio info: {e}")
            return {}
    
    @staticmethod
    def cleanup_temp_files(directory: str = "uploads/") -> int:
        """임시 오디오 파일 정리"""
        cleanup_count = 0
        try:
            upload_dir = Path(directory)
            if upload_dir.exists():
                for file_path in upload_dir.glob("*.wav"):
                    # 오래된 파일 정리 (1시간 이상)
                    import time
                    if time.time() - file_path.stat().st_mtime > 3600:
                        file_path.unlink(missing_ok=True)
                        cleanup_count += 1
            logger.info(f"Cleaned up {cleanup_count} temporary audio files")
            return cleanup_count
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            return 0
