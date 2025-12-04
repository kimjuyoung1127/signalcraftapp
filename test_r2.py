import os
from dotenv import load_dotenv
from app.storage import S3Storage
import tempfile

# Load env vars from .env file
load_dotenv()

def test_r2_integration():
    print("🧪 Testing Cloudflare R2 Integration...")
    
    # 1. Check Env Vars
    bucket = os.getenv("S3_BUCKET_NAME")
    if not bucket:
        print("❌ Error: S3_BUCKET_NAME is not set in .env")
        return
    print(f"✅ Configuration loaded. Bucket: {bucket}")

    storage = S3Storage()
    
    # 2. Create Dummy File
    content = b"Hello SignalCraft R2!"
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    
    object_name = "test_r2_integration.txt"
    
    try:
        # 3. Upload
        print(f"📤 Uploading to {object_name}...")
        uploaded = storage.upload_file(tmp_path, object_name)
        if not uploaded:
            raise Exception("Upload returned None")
        print("✅ Upload successful.")

        # 4. Download
        download_path = tmp_path + ".downloaded"
        print(f"📥 Downloading to {download_path}...")
        if storage.download_file(object_name, download_path):
            print("✅ Download successful.")
            with open(download_path, "rb") as f:
                downloaded_content = f.read()
            if downloaded_content == content:
                print("✅ Content verified.")
            else:
                print("❌ Content mismatch!")
        else:
            print("❌ Download failed.")

        # 5. Delete
        print(f"🗑️ Deleting {object_name}...")
        if storage.delete_file(object_name):
            print("✅ Delete successful.")
        else:
            print("❌ Delete failed.")

    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
    finally:
        # Cleanup local temps
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        if os.path.exists(download_path):
            os.remove(download_path)

if __name__ == "__main__":
    test_r2_integration()
