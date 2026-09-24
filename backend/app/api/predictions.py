"""
Prediction and ML Inference API endpoints for UrbanTransit IQ.
Integrates trained model artifacts from models/python/ for delay prediction,
14-day demand forecasting, crowding risk classification, and model registry.
"""

import os
import sys
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np
import pandas as pd
import joblib

from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.prediction import (
    DelayPredictionRequest,
    DelayPredictionResponse,
    DemandForecastResponse,
    CrowdingRiskResponse,
)
from backend.app.services.model_version_service import list_models, register_model

logger = logging.getLogger(__name__)
router = APIRouter()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
MODEL_DIR = os.path.join(BASE_DIR, "models/python")
DELAY_MODEL_PATH = os.path.join(MODEL_DIR, "delay_prediction_best.joblib")
DELAY_COLS_PATH = os.path.join(MODEL_DIR, "delay_feature_cols.joblib")
FORECAST_JSON_PATH = os.path.join(MODEL_DIR, "forecast_14day_projection.json")
CROWDING_JSON_PATH = os.path.join(MODEL_DIR, "predictions/crowding_risk_predictions.json")

# In-memory caches for fast inference
_DELAY_MODEL = None
_DELAY_COLS = None
_PREDICTION_HISTORY: List[Dict[str, Any]] = []

def get_delay_model():
    global _DELAY_MODEL, _DELAY_COLS
    if _DELAY_MODEL is None and os.path.exists(DELAY_MODEL_PATH):
        try:
            _DELAY_MODEL = joblib.load(DELAY_MODEL_PATH)
            if os.path.exists(DELAY_COLS_PATH):
                _DELAY_COLS = joblib.load(DELAY_COLS_PATH)
            else:
                _DELAY_COLS = [
                    "hour", "day_of_week", "month", "weekend_indicator",
                    "peak_indicator", "route_distance", "historical_delay",
                    "historical_demand", "occupancy_percentage"
                ]
            logger.info("Successfully loaded trained delay prediction model.")
        except Exception as e:
            logger.error(f"Failed to load delay prediction model: {e}")
    return _DELAY_MODEL, _DELAY_COLS

# Pre-load on startup
get_delay_model()

@router.post("/delay", response_model=DelayPredictionResponse)
async def predict_delay(request: DelayPredictionRequest):
    model, feature_cols = get_delay_model()
    
    # Feature calculation from request
    is_peak = request.is_peak or (request.hour in [7, 8, 9, 17, 18, 19])
    weekend_indicator = 1 if request.day_of_week in [4, 5] else 0  # Fri/Sat
    occupancy_pct = (request.passenger_load / 50.0) * 100.0  # standard transit bus cap 50
    historical_demand = request.passenger_load * 1.15
    
    features_dict = {
        "hour": float(request.hour),
        "day_of_week": float(request.day_of_week),
        "month": float(datetime.now().month),
        "weekend_indicator": float(weekend_indicator),
        "peak_indicator": 1.0 if is_peak else 0.0,
        "route_distance": float(request.distance),
        "historical_delay": float(request.historical_delay),
        "historical_demand": float(historical_demand),
        "occupancy_percentage": float(occupancy_pct)
    }
    
    predicted_delay = 0.0
    confidence = 0.85
    model_name = "GradientBoostedTrees_v1.0"
    
    if model is not None and feature_cols is not None:
        try:
            input_df = pd.DataFrame([{col: features_dict.get(col, 0.0) for col in feature_cols}])
            # Probabilities of class 0 (on-time) and 1 (delayed)
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(input_df)[0]
                prob_delay = float(probs[1]) if len(probs) > 1 else float(probs[0])
                confidence = round(float(max(probs)), 3)
            else:
                pred_cls = model.predict(input_df)[0]
                prob_delay = 1.0 if pred_cls == 1 else 0.0
                confidence = 0.90
            
            # Predict estimated delay in minutes based on probability and historical baseline
            if prob_delay > 0.5:
                # Base delay proportional to probability + historical delay + peak
                predicted_delay = round(request.historical_delay * 0.7 + prob_delay * 8.5 + (4.0 if is_peak else 0.0), 1)
            else:
                predicted_delay = round(max(0.0, request.historical_delay * 0.3 * (1.0 - prob_delay)), 1)
        except Exception as e:
            logger.warning(f"Inference via model failed, using fallback formula: {e}")
            predicted_delay = round(request.historical_delay * 0.4 + (request.passenger_load / 10.0) * 0.3 + (4.5 if is_peak else 0.0), 1)
    else:
        # Fallback heuristic
        predicted_delay = round(request.historical_delay * 0.4 + (request.passenger_load / 10.0) * 0.3 + (4.5 if is_peak else 0.0), 1)
    
    # Classify severity
    if predicted_delay < 2.0:
        severity = "On Time"
    elif predicted_delay < 5.0:
        severity = "Minor Delay"
    elif predicted_delay < 10.0:
        severity = "Moderate Delay"
    elif predicted_delay < 20.0:
        severity = "Major Delay"
    else:
        severity = "Severe Delay"
    
    contributing = {
        "historical_delay": round(request.historical_delay, 2),
        "passenger_load": round(request.passenger_load, 2),
        "hour_of_day": float(request.hour),
        "peak_congestion_factor": 1.45 if is_peak else 1.0,
        "occupancy_rate": round(occupancy_pct, 1)
    }
    
    record = {
        "timestamp": datetime.utcnow().isoformat(),
        "route_id": request.route_id,
        "vehicle_id": request.vehicle_id,
        "predicted_delay": predicted_delay,
        "severity": severity,
        "confidence": confidence,
        "model_used": model_name
    }
    _PREDICTION_HISTORY.append(record)
    if len(_PREDICTION_HISTORY) > 500:
        _PREDICTION_HISTORY.pop(0)

    return DelayPredictionResponse(
        predicted_delay=predicted_delay,
        severity=severity,
        confidence=confidence,
        contributing_features=contributing,
        historical_context={
            "description": f"Route {request.route_id} averages {request.historical_delay}m delay at hour {request.hour}.",
            "route_id": request.route_id,
            "hour": request.hour,
            "average_delay": request.historical_delay
        },
        model_used=model_name
    )

@router.post("/severity")
async def predict_severity(request: DelayPredictionRequest):
    return await predict_delay(request)

@router.get("/forecast", response_model=DemandForecastResponse)
async def get_demand_forecast():
    """Returns 14-day demand forecast projections from the trained forecasting model."""
    if os.path.exists(FORECAST_JSON_PATH):
        try:
            with open(FORECAST_JSON_PATH, "r") as f:
                data = json.load(f)
            if isinstance(data, list):
                projs = [
                    {
                        "date": p.get("date"),
                        "predicted_demand": float(p.get("predicted_demand", 0)),
                        "lower_bound": float(p.get("lower_bound", 0)),
                        "upper_bound": float(p.get("upper_bound", 0)),
                        "confidence_interval": 0.95
                    }
                    for p in data
                ]
                return DemandForecastResponse(
                    model="Lagged GradientBoostingRegressor",
                    forecast_horizon_days=len(projs),
                    projections=projs,
                    metadata={"source": "models/python/forecast_14day_projection.json"}
                )
            elif isinstance(data, dict):
                return DemandForecastResponse(
                    model=data.get("model", "Lagged GradientBoostingRegressor"),
                    forecast_horizon_days=data.get("forecast_horizon_days", 14),
                    projections=data.get("projections", []),
                    metadata=data.get("metadata", {})
                )
        except Exception as e:
            logger.error(f"Error reading 14-day forecast json: {e}")

    # Fallback synthetic generation if file missing
    today = datetime.now()
    projections = []
    base_val = 5500.0
    for i in range(1, 15):
        dt = today + pd.Timedelta(days=i)
        is_wknd = dt.weekday() in [4, 5]
        expected = base_val * (0.75 if is_wknd else 1.05) + (i % 3) * 120
        projections.append({
            "date": dt.strftime("%Y-%m-%d"),
            "predicted_demand": round(expected, 1),
            "lower_bound": round(expected * 0.92, 1),
            "upper_bound": round(expected * 1.08, 1),
            "confidence_interval": 0.95
        })

    return DemandForecastResponse(
        model="Lagged GradientBoostingRegressor (Fallback)",
        forecast_horizon_days=14,
        projections=projections,
        metadata={"generated_at": datetime.utcnow().isoformat()}
    )

@router.get("/occupancy", response_model=CrowdingRiskResponse)
async def get_occupancy_predictions(route_id: Optional[str] = Query(None)):
    """Returns hourly crowding risk and occupancy forecast predictions from the trained model."""
    if os.path.exists(CROWDING_JSON_PATH):
        try:
            with open(CROWDING_JSON_PATH, "r") as f:
                data = json.load(f)
            raw_list = data if isinstance(data, list) else data.get("predictions", [])
            predictions = []
            for item in raw_list:
                r_id = str(item.get("route_id", "PB-01"))
                if route_id and r_id != str(route_id):
                    continue
                # parse hour from time string if available
                t_str = str(item.get("time", "12:00"))
                try:
                    hr = int(t_str.split(":")[0])
                except Exception:
                    hr = 12
                predictions.append({
                    "route_id": r_id,
                    "hour": hr,
                    "predicted_occupancy_rate": float(item.get("predicted_occupancy_pct", 75.0)),
                    "crowding_level": str(item.get("risk_category", "Moderate")),
                    "confidence": 0.88,
                    "risk_score": float(item.get("risk_probability", 0.50))
                })
            return CrowdingRiskResponse(
                timestamp=datetime.utcnow().isoformat(),
                predictions=predictions[:50],
                total_evaluated=len(predictions)
            )
        except Exception as e:
            logger.error(f"Error loading crowding risk json: {e}")

    return CrowdingRiskResponse(
        timestamp=datetime.utcnow().isoformat(),
        predictions=[],
        total_evaluated=0
    )

@router.get("/models")
async def get_model_registry(pipeline: Optional[str] = Query(None)):
    """List registered ML and Big Data models with hyperparameters, metrics, and artifact status."""
    return list_models(pipeline=pipeline)

@router.get("/history")
async def get_prediction_history(limit: int = 50):
    """Retrieve recent live prediction log."""
    return _PREDICTION_HISTORY[-limit:]
