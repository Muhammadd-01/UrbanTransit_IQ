"""
Model version tracking and registry service for Spark MLlib and Python ML pipelines.
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from backend.app.database.engine import SessionLocal
from backend.app.database.models import ModelMetadata

logger = logging.getLogger(__name__)

_REGISTERED_MODELS: List[Dict[str, Any]] = [
    {
        "id": "model-spark-gbt-01",
        "name": "Spark_Delay_GBT",
        "version": "v1.0",
        "pipeline": "spark",
        "algorithm": "GBTClassifier",
        "feature_list": ["route_id", "hour", "day_of_week", "passenger_load", "historical_delay"],
        "hyperparameters": {"maxIter": 50, "maxDepth": 8},
        "dataset_version": "karachi-2024-comp",
        "training_date": "2024-09-24T10:00:00Z",
        "train_metrics": {"accuracy": 0.862, "f1": 0.854},
        "validation_metrics": {"accuracy": 0.845, "f1": 0.838},
        "test_metrics": {"accuracy": 0.841, "f1": 0.838, "roc_auc": 0.894},
        "artifact_path": "models/spark/delay_prediction_gbt",
        "creator": "UrbanTransit IQ Spark Engine",
        "is_active": True,
    },
    {
        "id": "model-python-gbt-01",
        "name": "Python_Delay_GBT",
        "version": "v1.0",
        "pipeline": "python",
        "algorithm": "GradientBoostingClassifier",
        "feature_list": ["hour", "day_of_week", "month", "weekend_indicator", "peak_indicator", "route_distance", "historical_delay", "historical_demand", "occupancy_percentage"],
        "hyperparameters": {"n_estimators": 100, "learning_rate": 0.1, "max_depth": 5, "random_state": 42},
        "dataset_version": "karachi-2024-comp-v1.0",
        "training_date": "2024-09-24T11:40:00Z",
        "train_metrics": {"accuracy": 0.941, "f1": 0.941},
        "validation_metrics": {"accuracy": 0.9221, "f1": 0.9219},
        "test_metrics": {"accuracy": 0.9256, "f1": 0.9255, "roc_auc": 0.9457},
        "artifact_path": "models/python/delay_prediction_best.csv",
        "creator": "UrbanTransit IQ ML Pipeline",
        "is_active": True,
    },
    {
        "id": "model-python-rf-01",
        "name": "Python_Delay_RandomForest",
        "version": "v1.0",
        "pipeline": "python",
        "algorithm": "RandomForestClassifier",
        "feature_list": ["hour", "day_of_week", "month", "weekend_indicator", "peak_indicator", "route_distance", "historical_delay", "historical_demand", "occupancy_percentage"],
        "hyperparameters": {"n_estimators": 100, "max_depth": 10, "random_state": 42},
        "dataset_version": "karachi-2024-comp-v1.0",
        "training_date": "2024-09-24T11:40:00Z",
        "train_metrics": {"accuracy": 0.912, "f1": 0.912},
        "validation_metrics": {"accuracy": 0.8949, "f1": 0.8948},
        "test_metrics": {"accuracy": 0.8997, "f1": 0.8998, "roc_auc": 0.9395},
        "artifact_path": "models/python/delay_prediction_random_forest.csv",
        "creator": "UrbanTransit IQ ML Pipeline",
        "is_active": False,
    },
    {
        "id": "model-python-gbr-forecast-01",
        "name": "Python_Demand_GBR",
        "version": "v1.0",
        "pipeline": "python",
        "algorithm": "GradientBoostingRegressor",
        "feature_list": ["lag_1", "lag_2", "lag_7", "rolling_mean_7", "day_of_week", "month", "is_weekend"],
        "hyperparameters": {"n_estimators": 100, "learning_rate": 0.05, "max_depth": 4},
        "dataset_version": "karachi-2024-comp-v1.0",
        "training_date": "2024-09-24T11:41:00Z",
        "train_metrics": {"mae": 52.1, "rmse": 78.4},
        "validation_metrics": {"mae": 68.2, "rmse": 98.1},
        "test_metrics": {"mae": 70.36, "rmse": 102.13, "mape": 1.25},
        "artifact_path": "models/python/demand_forecast_gbr.csv",
        "creator": "UrbanTransit IQ ML Pipeline",
        "is_active": True,
    },
    {
        "id": "model-python-occupancy-rf-01",
        "name": "Python_Occupancy_RF",
        "version": "v1.0",
        "pipeline": "python",
        "algorithm": "RandomForestRegressor",
        "feature_list": ["route_id", "hour", "day_of_week", "is_peak", "historical_load", "historical_delay"],
        "hyperparameters": {"n_estimators": 80, "max_depth": 8},
        "dataset_version": "karachi-2024-comp-v1.0",
        "training_date": "2024-09-24T11:42:00Z",
        "train_metrics": {"mae": 15.2, "rmse": 20.1},
        "validation_metrics": {"mae": 19.8, "rmse": 25.4},
        "test_metrics": {"mae": 20.68, "rmse": 26.88},
        "artifact_path": "models/python/occupancy_forecast_rf.csv",
        "creator": "UrbanTransit IQ ML Pipeline",
        "is_active": True,
    }
]

def _model_to_dict(model: ModelMetadata) -> Dict[str, Any]:
    return {
        "id": str(model.id),
        "name": model.name,
        "version": model.version,
        "pipeline": model.pipeline,
        "algorithm": model.algorithm,
        "feature_list": model.feature_list,
        "hyperparameters": model.hyperparameters,
        "dataset_version": model.dataset_version,
        "training_date": model.training_date.isoformat() if model.training_date else None,
        "train_metrics": model.train_metrics,
        "validation_metrics": model.validation_metrics,
        "test_metrics": model.test_metrics,
        "artifact_path": model.artifact_path,
        "creator": model.creator,
        "is_active": model.is_active,
    }

def list_models(pipeline: Optional[str] = None) -> List[Dict[str, Any]]:
    try:
        with SessionLocal() as db:
            query = db.query(ModelMetadata)
            if pipeline:
                query = query.filter(ModelMetadata.pipeline == pipeline)
            models = query.all()
            if models:
                return [_model_to_dict(m) for m in models]
    except Exception as e:
        logger.warning(f"Failed to fetch model metadata from PostgreSQL: {e}")

    if pipeline:
        return [m for m in _REGISTERED_MODELS if m["pipeline"] == pipeline]
    return _REGISTERED_MODELS


def register_model(model_data: Dict[str, Any]) -> Dict[str, Any]:
    model_id = model_data.get("id", str(uuid.uuid4()))
    record = {
        "id": model_id,
        "name": model_data.get("name"),
        "version": model_data.get("version", "v1.0"),
        "pipeline": model_data.get("pipeline"),
        "algorithm": model_data.get("algorithm"),
        "feature_list": model_data.get("feature_list", []),
        "hyperparameters": model_data.get("hyperparameters", {}),
        "dataset_version": model_data.get("dataset_version", "v1.0"),
        "training_date": datetime.utcnow().isoformat(),
        "train_metrics": model_data.get("train_metrics", {}),
        "validation_metrics": model_data.get("validation_metrics", {}),
        "test_metrics": model_data.get("test_metrics", {}),
        "artifact_path": model_data.get("artifact_path", ""),
        "creator": model_data.get("creator", "System"),
        "is_active": model_data.get("is_active", True),
    }

    try:
        with SessionLocal() as db:
            new_model = ModelMetadata(
                id=model_id,
                name=record["name"],
                version=record["version"],
                pipeline=record["pipeline"],
                algorithm=record["algorithm"],
                feature_list=record["feature_list"],
                hyperparameters=record["hyperparameters"],
                dataset_version=record["dataset_version"],
                train_metrics=record["train_metrics"],
                validation_metrics=record["validation_metrics"],
                test_metrics=record["test_metrics"],
                artifact_path=record["artifact_path"],
                creator=record["creator"],
                is_active=record["is_active"],
            )
            db.add(new_model)
            db.commit()
    except Exception as e:
        logger.warning(f"Could not insert model metadata in PostgreSQL: {e}")

    _REGISTERED_MODELS.append(record)
    return record
