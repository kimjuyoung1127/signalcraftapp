import boto3
import os
import logging
from botocore.exceptions import ClientError
from typing import Optional

logger = logging.getLogger(__name__)

class S3Storage:
    def __init__(self):
        self.bucket_name = os.getenv("S3_BUCKET_NAME")
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL")
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.region = os.getenv("AWS_DEFAULT_REGION", "auto")

        if not all([self.bucket_name, self.endpoint_url, self.access_key, self.secret_key]):
            logger.warning("⚠️ Cloudflare R2 credentials are missing. Storage operations may fail.")

        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region
        )

    def upload_file(self, file_path: str, object_name: Optional[str] = None) -> Optional[str]:
        """Upload a file to an S3 bucket"""
        if object_name is None:
            object_name = os.path.basename(file_path)

        try:
            self.s3_client.upload_file(file_path, self.bucket_name, object_name)
            logger.info(f"✅ Uploaded {file_path} to R2 as {object_name}")
            return object_name
        except ClientError as e:
            logger.error(f"❌ Failed to upload to R2: {e}")
            return None

    def download_file(self, object_name: str, file_path: str) -> bool:
        """Download a file from an S3 bucket"""
        try:
            self.s3_client.download_file(self.bucket_name, object_name, file_path)
            logger.info(f"✅ Downloaded {object_name} from R2 to {file_path}")
            return True
        except ClientError as e:
            logger.error(f"❌ Failed to download from R2: {e}")
            return False

    def delete_file(self, object_name: str) -> bool:
        """Delete a file from an S3 bucket"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_name)
            logger.info(f"✅ Deleted {object_name} from R2")
            return True
        except ClientError as e:
            logger.error(f"❌ Failed to delete from R2: {e}")
            return False
