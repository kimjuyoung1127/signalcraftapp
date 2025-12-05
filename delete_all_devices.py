import asyncio
import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from sqlalchemy import select, text
from app.database import AsyncSessionLocal
from app.models import Device

async def delete_all_devices():
    print("Connecting to DB...")
    async with AsyncSessionLocal() as db:
        print("Deleting ALL devices...")
        # 모든 장비 삭제
        await db.execute(text("DELETE FROM devices"))
        await db.commit()
        print("Successfully deleted all devices.")

if __name__ == "__main__":
    asyncio.run(delete_all_devices())