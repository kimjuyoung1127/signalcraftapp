import torch
from pathlib import Path
import logging
from typing import Optional

# Import config and model definition
from app.core.config_analysis import MODEL_DIR
from app.features.audio_analysis.train_autoencoder import IndustrialAutoencoder

logger = logging.getLogger(__name__)

class ModelLoader:
    _instance = None
    _autoencoder_model: Optional[IndustrialAutoencoder] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def load_autoencoder(self) -> Optional[IndustrialAutoencoder]:
        if self._autoencoder_model:
            return self._autoencoder_model

        model_path = MODEL_DIR / "autoencoder.pth"
        if not model_path.exists():
            logger.warning(f"Autoencoder model not found at {model_path}")
            return None

        try:
            model = IndustrialAutoencoder(input_dim=64, latent_dim=16)
            model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            model.eval() # Set to evaluation mode
            self._autoencoder_model = model
            logger.info("Autoencoder model loaded successfully.")
            return model
        except Exception as e:
            logger.error(f"Failed to load Autoencoder model: {e}")
            return None

# Global instance
model_loader = ModelLoader()
