import os
import sys
import asyncio

# 현재 디렉토리를 모듈 검색 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import sync_engine, Base
# 모든 모델을 임포트하여 Base.metadata에 등록되도록 함
from app import models
from app.features.audio_analysis import models as audio_models

from sqlalchemy import text, inspect

def reset_database():
    print("🔄 데이터베이스 초기화를 시작합니다...")
    print(f"📡 연결 정보: {sync_engine.url}")

    # --force 옵션 확인
    if "--force" in sys.argv:
        print("⚠️  --force 옵션이 감지되었습니다. 사용자 확인 없이 진행합니다.")
    else:
        confirm = input("⚠️  정말로 모든 데이터를 삭제하고 스키마를 재생성하시겠습니까? (y/n): ")
        if confirm.lower() != 'y':
            print("취소되었습니다.")
            return

    try:
        print("🗑️  기존 테이블 삭제 중 (CASCADE)...")
        # Base.metadata.drop_all(bind=sync_engine) # 기존 방식 (FK 문제 발생 가능)
        
        # 개선된 방식: 모든 테이블 조회 후 강제 삭제
        conn = sync_engine.connect()
        inspector = inspect(sync_engine)
        tables = inspector.get_table_names()
        
        if not tables:
            print("ℹ️  삭제할 테이블이 없습니다.")
        else:
            for table in tables:
                print(f" - Dropping table: {table}...")
                conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
            conn.commit()
            
        print("✅ 테이블 삭제 완료.")
        conn.close()
    except Exception as e:
        print(f"❌ 테이블 삭제 중 오류 발생: {e}")
        # 삭제 실패 시에도 생성 시도하면 또 꼬일 수 있으므로 여기서 중단하는 게 나음
        # 하지만 사용자가 강행을 원할 수 있으니 일단 진행


    try:
        print("🔨  테이블 생성 중...")
        Base.metadata.create_all(bind=sync_engine)
        print("✅ 테이블 생성 완료.")
        print("🚀 이제 백엔드 서버를 재시작하면 초기 데이터가 시딩됩니다.")
    except Exception as e:
        print(f"❌ 테이블 생성 실패: {e}")
        sys.exit(1) # 에러 발생 시 스크립트 종료

if __name__ == "__main__":
    reset_database()
