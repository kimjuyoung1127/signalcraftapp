import sys
from pathlib import Path
import argparse
from datetime import datetime
import json
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
import librosa
import logging
import random
import soundfile as sf
# import pandas as pd # [NEW] pandas 추가 -> moved to AudioDataset.__getitem__

# Add project root to sys.path to fix ModuleNotFoundError when running directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import config
from app.core.config_analysis import BASE_DIR, MODEL_DIR, SAMPLE_RATE, TRAINING_AUDIO_DATA_DIR_AE

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# --- Model Definition (from industrial_audio_advanced.md) ---
class IndustrialAutoencoder(nn.Module):
    """
    산업용 오디오 이상탐지 AutoEncoder
    """
    def __init__(self, input_dim=64, latent_dim=16):
        super(IndustrialAutoencoder, self).__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, latent_dim)
        )
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, input_dim)
        )

    def forward(self, x):
        z = self.encoder(x)
        x_recon = self.decoder(z)
        return x_recon

# --- Dataset Definition ---
class AudioDataset(Dataset):
    def __init__(self, audio_dir: Path, sample_rate=16000, n_mels=64, duration=10):
        # [수정] WAV 및 CSV 파일 모두 검색
        self.files = list(audio_dir.glob("*.wav")) + list(audio_dir.glob("*.csv"))
        self.sr = sample_rate
        self.n_mels = n_mels
        self.duration = duration
        if not self.files:
            logger.warning(f"No WAV or CSV files found in {audio_dir}. Using dummy data if needed.")

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        file_path = self.files[idx]
        try:
            # [수정] 파일 확장자에 따른 로딩
            if file_path.suffix.lower() == '.wav':
                y, sr = librosa.load(file_path, sr=self.sr, duration=self.duration)
            elif file_path.suffix.lower() == '.csv':
                # CSV 로드 (헤더 없음 가정, 첫 번째 컬럼이 신호)
                try:
                    import pandas as pd # Import pandas only when needed for CSV
                    df = pd.read_csv(file_path, header=None)
                    # 데이터가 문자열일 경우 처리 필요할 수 있음, 일단 float로 변환 시도
                    y = df.iloc[:, 0].values.astype(np.float32)
                    sr = self.sr # CSV는 SR 정보가 없으므로 설정값 사용
                    
                    # Duration 처리
                    target_len = self.sr * self.duration
                    if len(y) > target_len:
                        y = y[:target_len]
                except Exception as csv_err:
                    logger.error(f"Failed to parse CSV {file_path}: {csv_err}")
                    return torch.zeros(self.n_mels)
            else:
                return torch.zeros(self.n_mels) # Should not happen
            
            # Pad if shorter than duration
            target_len = self.sr * self.duration
            if len(y) < target_len:
                y = np.pad(y, (0, target_len - len(y)))
            else:
                y = y[:target_len]

            # Mel Spectrogram
            mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=self.n_mels)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            
            mel_spec_norm = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min() + 1e-6)
            
            feature_vector = np.mean(mel_spec_norm, axis=1) # Shape: (n_mels,)
            
            return torch.FloatTensor(feature_vector)
            
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return torch.zeros(self.n_mels)

# --- Model Registry Update Function ---
def _update_model_registry(model_info: dict):
    registry_path = MODEL_DIR / "registry.json"
    registry_data = {"models": []}

    if registry_path.exists():
        with open(registry_path, 'r') as f:
            registry_data = json.load(f)

    # Remove existing entry with same id
    registry_data["models"] = [m for m in registry_data["models"] if m.get("id") != model_info["id"]]
    registry_data["models"].append(model_info)

    with open(registry_path, 'w') as f:
        json.dump(registry_data, f, indent=4)
    logger.info(f"Model {model_info['id']} registered in {registry_path}")


# --- Training Script ---
def train_autoencoder(data_dir: Path, output_name: str):
    
    # Check if data exists, if not, create dummy
    actual_training_dir = data_dir
    # [수정] WAV 및 CSV 확인
    has_files = list(actual_training_dir.glob("*.wav")) or list(actual_training_dir.glob("*.csv"))

    if not actual_training_dir.exists() or not has_files:
        logger.warning(f"No WAV or CSV files found in {actual_training_dir}. Creating dummy data for test.")
        actual_training_dir.mkdir(parents=True, exist_ok=True)
        # Create dummy file if not exists
        dummy_file_path = actual_training_dir / "dummy_normal.wav"
        if not dummy_file_path.exists():
            dummy_y = np.random.uniform(-1, 1, SAMPLE_RATE * 10)
            sf.write(dummy_file_path, dummy_y, SAMPLE_RATE)

    dataset = AudioDataset(actual_training_dir, sample_rate=SAMPLE_RATE)
    if len(dataset) == 0:
        logger.error("No training data (real or dummy) available. Exiting.")
        return
        
    dataloader = DataLoader(dataset, batch_size=16, shuffle=True)
    
    model = IndustrialAutoencoder(input_dim=64, latent_dim=16)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 50 # Increase for real training
    
    logger.info("Starting Autoencoder training...")
    
    for epoch in range(epochs):
        total_loss = 0
        for batch in dataloader:
            optimizer.zero_grad()
            outputs = model(batch)
            loss = criterion(outputs, batch)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        if (epoch+1) % 10 == 0:
            logger.info(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss/len(dataloader):.4f}")
            
    # Save Model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model_save_path = MODEL_DIR / output_name
    torch.save(model.state_dict(), model_save_path)
    logger.info(f"Model saved to {model_save_path}")

    # [NEW] Save Metadata JSON
    model_id = output_name.split('.')[0]
    metadata = {
        "model_id": model_id,
        "model_type": "level2_autoencoder",
        "file_name": output_name,
        "created_at": datetime.now().isoformat(),
        "dataset_path": str(actual_training_dir),
        "sample_count": len(dataset),
        "training_parameters": {
            "epochs": epochs,
            "learning_rate": 0.001,
            "batch_size": 16,
            "input_dim": 64,
            "latent_dim": 16
        },
        "training_metrics": {
            "final_loss": total_loss/len(dataloader)
        },
        "description": f"Autoencoder trained on data from {actual_training_dir}"
    }
    
    metadata_save_path = MODEL_DIR / f"{model_id}_meta.json"
    with open(metadata_save_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    logger.info(f"Metadata saved to {metadata_save_path}")

    # [NEW] Update Model Registry
    registry_entry = {
        "id": model_id,
        "name": f"{model_id.replace('_', ' ').title()} (Autoencoder)",
        "type": "level2_autoencoder",
        "file": output_name,
        "meta_file": f"{model_id}_meta.json",
        "description": metadata["description"],
        "is_default": False # 새로 생성된 모델은 기본값이 아님
    }
    _update_model_registry(registry_entry)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train an Industrial Autoencoder model.")
    parser.add_argument(
        "--data_dir", 
        type=Path, 
        default=TRAINING_AUDIO_DATA_DIR_AE, # config에서 기본값 가져오기
        help="Path to the directory containing normal audio WAV or CSV files for training."
    )
    parser.add_argument(
        "--output_name", 
        type=str, 
        default="autoencoder.pth", # 기본 모델 파일명
        help="Name of the output model file (e.g., pump_autoencoder_v1.pth)."
    )
    args = parser.parse_args()
    
    train_autoencoder(args.data_dir, args.output_name)