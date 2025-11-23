# database.py 예시
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 접속 정보 (본인 설정에 맞게 수정)
# 포트는 SSH 터널링한 5433 포트를 사용합니다!
SQLALCHEMY_DATABASE_URL = "postgresql://dev_user:qwas1127@localhost:5433/signalcraft_dev"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 연결 테스트
try:
    with engine.connect() as connection:
        print("✅ signalcraft_dev DB 연결 성공!")
except Exception as e:
    print(f"❌ 연결 실패: {e}")