from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class ModelMetadataModel(BaseModel):
    id: UUID
    name: str
    version: str
    pipeline: str
    algorithm: str
    feature_list: List[str]
    hyperparameters: Dict[str, Any]
    dataset_version: str
    training_date: datetime
    train_metrics: Dict[str, Any]
    validation_metrics: Dict[str, Any]
    test_metrics: Dict[str, Any]
    confusion_matrix: Optional[Dict[str, Any]]
    artifact_path: str
    creator: str
    is_active: bool
    sample_predictions: Optional[Dict[str, Any]]
