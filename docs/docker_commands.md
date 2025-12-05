# 🐳 SignalCraft Docker Command Cheat Sheet

SignalCraft 프로젝트의 원격 서버(Ubuntu) 관리 및 Docker 컨테이너 운영을 위한 필수 명령어 모음입니다.

## 🔍 1. 상태 확인 및 로그 조회

### 컨테이너 상태 확인
실행 중인 모든 컨테이너의 상태를 확인합니다.
```bash
cd /home/ubuntu/singalcraftapp
docker-compose ps
```

### 실시간 로그 조회 (Tail)
특정 서비스(`backend`, `worker`, `redis`)의 로그를 실시간으로 확인합니다.
```bash
# 백엔드 로그 (최신 100줄 + 실시간)
docker-compose logs -f --tail 100 backend

# 워커 로그 (최신 100줄 + 실시간)
docker-compose logs -f --tail 100 worker
```

---

## 🚀 2. 서비스 관리 (실행/중지/재배포)

### 전체 서비스 시작 (백그라운드)
이미지를 새로 빌드하지 않고 기존 이미지를 사용하여 시작합니다.
```bash
docker-compose up -d
```

### 전체 서비스 재빌드 및 시작 (추천)
코드가 변경되었거나 `docker-compose.yml` 설정이 바뀌었을 때 사용합니다.
```bash
docker-compose up -d --build
```

### 특정 서비스만 재시작
```bash
# 백엔드만 재시작
docker-compose restart backend

# 워커만 재시작
docker-compose restart worker
```

### 전체 서비스 중지
```bash
docker-compose down
```

---

## 💻 3. 컨테이너 내부 접속 및 명령 실행

### 컨테이너 내부 쉘(Bash) 접속
컨테이너 내부 파일 시스템을 확인하거나 패키지를 설치해볼 때 유용합니다.
```bash
# 백엔드 컨테이너 접속
docker-compose exec backend bash

# 워커 컨테이너 접속
docker-compose exec worker bash
```

### 컨테이너 내부에서 파이썬 스크립트 실행
DB 데이터 확인 등을 위해 일회성 스크립트를 실행할 때 사용합니다.
```bash
# check_devices.py 스크립트 실행 (백엔드 환경에서)
docker-compose exec backend python3 check_devices.py
```

### DB(PostgreSQL) 접속 (psql)
(주의: DB는 Docker 컨테이너가 아닌 호스트에 설치되어 있을 수 있음. Docker라면 아래 명령)
```bash
docker-compose exec db psql -U user -d signalcraft_dev
```

---

## 🧹 4. 유지보수 및 정리

### 디스크 공간 확보 (Prune)
사용하지 않는 이미지, 컨테이너, 네트워크를 모두 삭제하여 용량을 확보합니다. 빌드 에러(`no space left`) 시 필수.
```bash
docker system prune -af
```

---

## 📤 5. 로컬 -> 원격 파일 전송 (SCP)

Windows PowerShell에서 실행하는 명령어입니다.

### `app` 폴더 전체 업로드 (코드 배포)
```powershell
scp -r -i "C:\Users\gmdqn\pem\signalcraft.pem" C:\Users\gmdqn\singalcraftapp\app ubuntu@3.39.124.0:/home/ubuntu/singalcraftapp/
```

### 단일 파일 업로드
```powershell
scp -i "C:\Users\gmdqn\pem\signalcraft.pem" C:\Users\gmdqn\singalcraftapp\docker-compose.yml ubuntu@3.39.124.0:/home/ubuntu/singalcraftapp/
```

---

## 🔑 6. SSH 접속

원격 서버에 접속합니다.
```powershell
ssh -i "C:\Users\gmdqn\pem\signalcraft.pem" ubuntu@3.39.124.0
```
