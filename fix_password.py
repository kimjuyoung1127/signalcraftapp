import asyncio
import os
from app.database import AsyncSessionLocal
from app import models, security
from sqlalchemy import select

async def fix_password():
    print("🔧 Starting password fix...")
    async with AsyncSessionLocal() as db:
        # 1. Find the user
        email = "gmdqn2tp@gmail.com"
        result = await db.execute(select(models.User).filter(models.User.email == email))
        user = result.scalars().first()

        if not user:
            print(f"❌ User {email} not found!")
            return

        print(f"✅ Found user: {user.username} (ID: {user.id})")
        
        # 2. Check current hash (optional, but good for debug)
        print(f"   Current Hash (First 20 chars): {user.password_hash[:20]}...")

        # 3. Reset password
        new_password = "1"
        hashed_password = security.get_password_hash(new_password)
        
        user.password_hash = hashed_password
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        print(f"✅ Password updated to '{new_password}' (Hashed)")
        print(f"   New Hash (First 20 chars): {user.password_hash[:20]}...")

if __name__ == "__main__":
    asyncio.run(fix_password())
