import os
import sys
import json
import joblib
from pathlib import Path
import pandas as pd
import numpy as np
import logging

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sklearn.ensemble import RandomForestRegressor
from python_pipeline.evaluation import evaluate_regressor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def classify_crowding_risk(occupancy_pct: float) -> tuple:
    """Returns (risk_category, crowding_risk_flag, risk_probability)"""
    if occupancy_pct < 50.0:
        return ("Low", False, 0.05)
    elif occupancy_pct < 70.0:
        return ("Moderate", False, 0.20)
    elif occupancy_pct < 85.0:
        return ("High", False, 0.45)
    elif occupancy_pct < 95.0:
        return ("Overcrowded", True, 0.85)
    else:
        return ("Critical", True, 0.96)

def run_occupancy_pipeline():
    logger.info("Starting occupancy forecasting and crowding-risk prediction pipeline...")
    os.makedirs('models/python', exist_ok=True)
    
    trips_file = Path('data/raw') / 'trips.csv'
    pc_file = Path('data/raw') / 'passenger_counts.csv'
    routes_file = Path('data/raw') / 'routes.csv'
    
    if not trips_file.exists() or not pc_file.exists():
        logger.error("Required raw data missing for occupancy forecasting.")
        return
        
    trips = pd.read_csv(trips_file, nrows=25000)
    counts = pd.read_csv(pc_file, nrows=50000, usecols=['trip_id', 'current_load', 'vehicle_capacity'])
    routes = pd.read_csv(routes_file, usecols=['route_id', 'total_distance_km']) if routes_file.exists() else pd.DataFrame()
    
    # Merge loads
    merged = trips.merge(counts, on='trip_id', how='inner')
    merged['occupancy_ratio'] = merged['current_load'] / np.maximum(merged['vehicle_capacity'], 1)
    merged['occupancy_pct'] = np.clip(merged['occupancy_ratio'] * 100.0, 5.0, 130.0)
    
    merged['hour'] = merged['actual_departure'].apply(
        lambda x: int(str(x).split(':')[0]) if pd.notna(x) and ':' in str(x) else 12
    )
    merged['date_dt'] = pd.to_datetime(merged['date'], errors='coerce')
    merged['day_of_week'] = merged['date_dt'].dt.dayofweek.fillna(0).astype(int)
    merged['is_peak'] = merged['hour'].isin([7, 8, 9, 17, 18, 19]).astype(int)
    
    feature_cols = ['hour', 'day_of_week', 'is_peak', 'vehicle_capacity']
    
    # Chronological split
    merged = merged.sort_values(by=['date_dt', 'hour']).reset_index(drop=True)
    n = len(merged)
    train_end = int(n * 0.70)
    test_end = int(n * 0.85)
    
    train = merged.iloc[:train_end]
    test = merged.iloc[test_end:]
    
    # Train regressor
    rf = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1)
    rf.fit(train[feature_cols], train['occupancy_pct'])
    
    # Evaluate on test
    preds = rf.predict(test[feature_cols])
    y_test = test['occupancy_pct'].values
    metrics = evaluate_regressor(y_test, preds)
    
    # Baseline comparison (Mean baseline)
    mean_baseline = np.full_like(y_test, fill_value=train['occupancy_pct'].mean())
    base_metrics = evaluate_regressor(y_test, mean_baseline)
    
    # Save model
    joblib.dump(rf, 'models/python/occupancy_forecast_rf.csv')
    
    # Generate Crowding-Risk Prediction Output (Section 16)
    crowding_predictions = []
    test_subset = test.head(100).copy().reset_index(drop=True)
    sub_preds = preds[:100]
    
    for idx, r in test_subset.iterrows():
        pred_occ = round(float(sub_preds[idx]), 1)
        cat, is_risk, prob = classify_crowding_risk(pred_occ)
        
        crowding_predictions.append({
            "route_id": r['route_id'],
            "trip_id": r['trip_id'],
            "time": r['actual_departure'],
            "predicted_occupancy_pct": pred_occ,
            "crowding_risk": is_risk,
            "risk_probability": prob,
            "risk_category": cat,
            "supporting_factors": [
                f"Peak hour ({r['hour']}:00)" if r['is_peak'] else "Off-peak window",
                f"Capacity {r['vehicle_capacity']} passengers",
                f"Historical load factor {round(pred_occ / 100.0, 2)}"
            ]
        })
        
    with open('models/python/predictions/crowding_risk_predictions.json', 'w') as f:
        json.dump(crowding_predictions, f, indent=4)
        
    logger.info(f"Occupancy Model Metrics: MAE={metrics['mae']:.2f}%, RMSE={metrics['rmse']:.2f}% (vs Baseline MAE={base_metrics['mae']:.2f}%)")
    logger.info("Saved crowding risk predictions to models/python/predictions/crowding_risk_predictions.json")

if __name__ == '__main__':
    run_occupancy_pipeline()
