import asyncio
import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.database import AsyncSessionLocal
from app.models import User
from app.security import get_password_hash
from sqlalchemy import select

async def fix_admin_user():
    target_email = "gmdqn2tp@gmail.com"
    new_password = "1"
    
    print(f"Connecting to DB to fix user: {target_email}...")
    
    async with AsyncSessionLocal() as db:
        # 유저 조회
        result = await db.execute(select(User).filter(User.email == target_email))
        user = result.scalars().first()
        
        if user:
            print(f"User found: {user.username} (ID: {user.id})")
            # 비밀번호 및 권한 강제 업데이트
            user.password_hash = get_password_hash(new_password)
            user.role = "admin"
            await db.commit()
            print(f"✅ SUCCESS: Password reset to '{new_password}' and role set to 'admin'.")
        else:
            print("⚠️ User not found. Creating new admin user...")
            # 유저가 없으면 생성
            new_user = User(
                email=target_email,
                username="김주영",
                full_name="김주영",
                password_hash=get_password_hash(new_password),
                role="admin"
            )
            db.add(new_user)
            await db.commit()
            print(f"✅ SUCCESS: Created new admin user with password '{new_password}'.")

if __name__ == "__main__":
    asyncio.run(fix_admin_user())