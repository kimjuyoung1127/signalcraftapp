import torch
from pathlib import Path
import logging
from typing import Optional, Dict, Any, List
import json
import joblib # [NEW] for Isolation Forest

# Import config and model definition
from app.core.config_analysis import MODEL_DIR
from app.features.audio_analysis.train_autoencoder import IndustrialAutoencoder
from sklearn.ensemble import IsolationForest # [NEW]
from sklearn.preprocessing import StandardScaler # [NEW]

logger = logging.getLogger(__name__)

class ModelLoader:
    _instance = None
    _loaded_models: Dict[str, Any] = {} # [수정] 딕셔너리로 변경하여 여러 모델 캐싱

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            # Register initial models (if any) from registry.json
            # This is a good place to pre-load default models
            # cls._instance._load_default_models_from_registry() # Optional pre-load
        return cls._instance

    def _load_registry(self) -> Dict[str, Any]:
        registry_path = MODEL_DIR / "registry.json"
        if registry_path.exists():
            with open(registry_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        logger.warning(f"Model registry not found at {registry_path}. Returning empty registry.")
        return {"models": []}

    def get_available_models(self, device_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Loads the registry and filters models based on device_type.
        If device_type is None, returns all models.
        """
        registry = self._load_registry()
        models = registry.get("models", [])
        
        if device_type:
            filtered_models = []
            for model_info in models:
                # Filter by checking if device_type is in model 'id' or 'description'
                if device_type.lower() in model_info.get("id", "").lower() or \
                   device_type.lower() in model_info.get("description", "").lower():
                    filtered_models.append(model_info)
            return filtered_models
        return models

    def get_model_info(self, model_id: str) -> Optional[Dict[str, Any]]:
        registry = self._load_registry()
        for model_info in registry.get("models", []):
            if model_info.get("id") == model_id:
                return model_info
        return None

    def load_model(self, model_id: str) -> Optional[Any]: # [수정] load_autoencoder -> load_model
        if model_id in self._loaded_models:
            return self._loaded_models[model_id]

        model_info = self.get_model_info(model_id)
        if not model_info:
            logger.warning(f"Model info for '{model_id}' not found in registry.json.")
            return None
        
        model_type = model_info.get("type")
        file_name = model_info.get("file_name") # For Autoencoder
        file_name_model = model_info.get("file_name_model") # For IF
        file_name_scaler = model_info.get("file_name_scaler") # For IF

        if not file_name and not file_name_model:
            logger.error(f"Model file name not specified for '{model_id}' in registry.")
            return None

        try:
            loaded_model = None
            if model_type == "level2_autoencoder":
                model_path = MODEL_DIR / file_name
                if not model_path.exists():
                    logger.warning(f"Autoencoder model file not found at {model_path}")
                    return None
                model = IndustrialAutoencoder(input_dim=64, latent_dim=16)
                model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
                model.eval()
                loaded_model = model
                logger.info(f"Autoencoder model '{model_id}' loaded successfully.")
            
            elif model_type == "level1_isolation_forest":
                model_path = MODEL_DIR / file_name_model
                scaler_path = MODEL_DIR / file_name_scaler
                if not model_path.exists() or not scaler_path.exists():
                    logger.warning(f"Isolation Forest model or scaler file not found for '{model_id}' at {model_path}/{scaler_path}")
                    return None
                if_model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                loaded_model = {"model": if_model, "scaler": scaler}
                logger.info(f"Isolation Forest model '{model_id}' loaded successfully.")

            else:
                logger.warning(f"Unsupported model type '{model_type}' for model_id '{model_id}'.")
                return None

            self._loaded_models[model_id] = loaded_model
            return loaded_model

        except Exception as e:
            logger.error(f"Failed to load model '{model_id}': {e}")
            return None

# Global instance (optional, for convenience)
model_loader = ModelLoader()
