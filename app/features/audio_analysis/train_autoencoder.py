import sys
from pathlib import Path

# Add project root to sys.path to fix ModuleNotFoundError when running directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import numpy as np
import librosa
import logging
import random

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
        self.files = list(audio_dir.glob("*.wav"))
        self.sr = sample_rate
        self.n_mels = n_mels
        self.duration = duration
        if not self.files:
            logger.warning(f"No WAV files found in {audio_dir}")

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        file_path = self.files[idx]
        try:
            y, sr = librosa.load(file_path, sr=self.sr, duration=self.duration)
            
            # Pad if shorter than duration
            target_len = self.sr * self.duration
            if len(y) < target_len:
                y = np.pad(y, (0, target_len - len(y)))
            else:
                y = y[:target_len]

            # Mel Spectrogram
            mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=self.n_mels)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            
            # Normalize to 0-1 (approx) - standard for AE input
            # Simple min-max normalization per sample or global
            # Here: (x - min) / (max - min)
            mel_spec_norm = (mel_spec_db - mel_spec_db.min()) / (mel_spec_db.max() - mel_spec_db.min() + 1e-6)
            
            # Flatten time frames? Or Average over time?
            # Industrial AE usually takes averaged frames or treats each frame as a sample.
            # Let's take mean over time to get a single vector representing the clip (Simple)
            # OR treat (time_steps, n_mels) as batch of vectors.
            # Let's verify Section C.1 intent. "input_dim=64" implies feature vector size 64.
            # Usually this means we average over time or input single frames.
            # Averaging over time captures "timbre" but loses temporal pattern.
            # Let's try averaging over time for simplicity and robustness.
            feature_vector = np.mean(mel_spec_norm, axis=1) # Shape: (n_mels,)
            
            return torch.FloatTensor(feature_vector)
            
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return torch.zeros(self.n_mels)

# --- Training Script ---
def train_autoencoder():
    training_dir = TRAINING_AUDIO_DATA_DIR_AE
    
    # Check if data exists
    if not training_dir.exists() or not list(training_dir.glob("*.wav")):
        logger.warning("No training data found. Creating dummy data for test.")
        training_dir.mkdir(parents=True, exist_ok=True)
        # Create dummy file
        import soundfile as sf
        dummy_y = np.random.uniform(-1, 1, 16000*10)
        sf.write(training_dir / "dummy_normal.wav", dummy_y, 16000)

    dataset = AudioDataset(training_dir, sample_rate=SAMPLE_RATE)
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
    torch.save(model.state_dict(), MODEL_DIR / "autoencoder.pth")
    logger.info(f"Model saved to {MODEL_DIR / 'autoencoder.pth'}")

if __name__ == "__main__":
    train_autoencoder()
