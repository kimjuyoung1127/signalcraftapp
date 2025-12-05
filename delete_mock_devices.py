import asyncio
import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from sqlalchemy import select
from sqlalchemy.future import select as f_select # For async
from app.database import AsyncSessionLocal
from app.models import Device

async def delete_mock_devices():
    print("Connecting to DB...")
    async with AsyncSessionLocal() as db:
        print("Checking for MOCK devices...")
        # device_id가 'MOCK-'으로 시작하는 모든 장비 조회
        result = await db.execute(f_select(Device).filter(Device.device_id.startswith("MOCK-")))
        mock_devices = result.scalars().all()
        
        if not mock_devices:
            print("No MOCK devices found in the database.")
            return

        print(f"Found {len(mock_devices)} MOCK devices to delete:")
        for device in mock_devices:
            print(f"  - Deleting Device: ID={device.id}, DeviceID='{device.device_id}', Name='{device.name}'")
            await db.delete(device)
        
        await db.commit()
        print("Successfully deleted all MOCK devices.")

if __name__ == "__main__":
    asyncio.run(delete_mock_devices())
