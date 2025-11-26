# 베이스 이미지 설정 - Python 3.10 사용
FROM python:3.10-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치 (필요한 경우)
# [수정] Librosa/SoundFile 오디오 처리를 위해 ffmpeg, libsndfile1 필수 추가
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Python 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 컨테이너 실행 시 명령어
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]