import os
import sys
import time
import json
import joblib
from pathlib import Path
import pandas as pd
import numpy as np
import logging

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

# Try importing XGBoost, fallback to GradientBoostingClassifier if OpenMP is missing
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except Exception as e:
    HAS_XGBOOST = False

from python_pipeline.data_loader import load_all_data
from python_pipeline.preprocessing import clean_data
from python_pipeline.feature_engineering import create_trip_features, chronological_split
from python_pipeline.evaluation import evaluate_classifier, get_feature_importance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_and_evaluate_all(train_X, train_y, val_X, val_y, test_X, test_y, feature_names):
    models = {
        'Logistic Regression': LogisticRegression(max_iter=500, C=1.0, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1),
        'Gradient Boosted Trees': GradientBoostingClassifier(n_estimators=50, max_depth=6, random_state=42)
    }
    if HAS_XGBOOST:
        models['XGBoost'] = XGBClassifier(n_estimators=50, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1)
        
    evaluation_records = []
    trained_models = {}
    best_f1 = -1
    best_name = None
    best_model = None
    best_test_preds = None
    best_test_probs = None
    
    for name, model in models.items():
        logger.info(f"Training {name} on {len(train_X):,} samples...")
        
        # Measure training time
        t0 = time.time()
        model.fit(train_X, train_y)
        train_time = round(time.time() - t0, 3)
        
        # Validation inference
        val_preds = model.predict(val_X)
        val_probs = model.predict_proba(val_X) if hasattr(model, 'predict_proba') else None
        val_metrics = evaluate_classifier(val_y, val_preds, val_probs)
        
        # Test inference
        t1 = time.time()
        test_preds = model.predict(test_X)
        test_probs = model.predict_proba(test_X) if hasattr(model, 'predict_proba') else None
        infer_time = round((time.time() - t1) / max(1, len(test_X)) * 1000.0, 3) # ms per sample
        
        test_metrics = evaluate_classifier(test_y, test_preds, test_probs)
        
        trained_models[name] = model
        
        eval_row = {
            "Model": name,
            "Training time (s)": train_time,
            "Validation accuracy": round(val_metrics['accuracy'], 4),
            "Test accuracy": round(test_metrics['accuracy'], 4),
            "Precision": round(test_metrics['precision'], 4),
            "Recall": round(test_metrics['recall'], 4),
            "F1": round(test_metrics['f1'], 4),
            "ROC-AUC": round(test_metrics['roc_auc'], 4) if test_metrics['roc_auc'] else "N/A",
            "Confusion matrix": str(test_metrics['confusion_matrix']),
            "Inference time (ms/sample)": infer_time
        }
        evaluation_records.append(eval_row)
        
        logger.info(f"{name} Results -> Test Acc: {test_metrics['accuracy']:.4f}, F1: {test_metrics['f1']:.4f}, Train Time: {train_time}s")
        
        if test_metrics['f1'] > best_f1:
            best_f1 = test_metrics['f1']
            best_name = name
            best_model = model
            best_test_preds = test_preds
            best_test_probs = test_probs

    eval_df = pd.DataFrame(evaluation_records)
    os.makedirs('reports', exist_ok=True)
    eval_df.to_csv('reports/model_evaluation.csv', index=False)
    logger.info("Saved model evaluation table to reports/model_evaluation.csv")
    
    feature_imp = get_feature_importance(best_model, feature_names)
    
    return best_name, best_model, eval_df, feature_imp, best_test_preds, best_test_probs, trained_models

def run_pipeline():
    logger.info("Starting delay prediction model pipeline...")
    os.makedirs('models/python', exist_ok=True)
    os.makedirs('models/python/predictions', exist_ok=True)
    
    # 1. Load data
    raw_data = load_all_data(nrows_trips=25000, nrows_tickets=10000)
    
    # 2. Preprocess
    clean_dict, _ = clean_data(raw_data)
    
    # 3. Feature engineering
    trips = clean_dict.get('trips', pd.DataFrame())
    if trips.empty:
        logger.error("No trip data found.")
        return
        
    features_df = create_trip_features(
        trips,
        clean_dict.get('tickets', pd.DataFrame()),
        clean_dict.get('delays', pd.DataFrame()),
        clean_dict.get('passenger_counts', pd.DataFrame()),
        clean_dict.get('routes', pd.DataFrame()),
        clean_dict.get('stops', pd.DataFrame()),
        clean_dict.get('service_calendar', pd.DataFrame())
    )
    
    # 4. Strict Chronological Split (70/15/15)
    train, val, test = chronological_split(features_df)
    
    feature_cols = [
        'hour', 'day_of_week', 'month', 'weekend_indicator', 'peak_indicator',
        'route_distance', 'historical_delay', 'historical_demand', 'occupancy_percentage'
    ]
    target_col = 'is_delayed'
    
    for col in feature_cols:
        if col not in features_df.columns:
            train[col] = 0.0
            val[col] = 0.0
            test[col] = 0.0
            
    train_X = train[feature_cols].fillna(0)
    train_y = train[target_col].fillna(0).astype(int)
    val_X = val[feature_cols].fillna(0)
    val_y = val[target_col].fillna(0).astype(int)
    test_X = test[feature_cols].fillna(0)
    test_y = test[target_col].fillna(0).astype(int)
    
    # 5. Train & Evaluate 3 Models
    best_name, best_model, eval_df, importance, test_preds, test_probs, all_models = train_and_evaluate_all(
        train_X, train_y, val_X, val_y, test_X, test_y, feature_cols
    )
    
    # 6. Save models
    for m_name, m_obj in all_models.items():
        fname = m_name.lower().replace(' ', '_')
        joblib.dump(m_obj, f'models/python/delay_prediction_{fname}.joblib')
        
    joblib.dump(best_model, 'models/python/delay_prediction_best.joblib')
    joblib.dump(feature_cols, 'models/python/delay_feature_cols.joblib')
    
    # 7. Save metrics JSON
    with open('models/python/delay_prediction_metrics.json', 'w') as f:
        json.dump({
            'best_model': best_name,
            'models_evaluated': list(all_models.keys()),
            'feature_importance': importance,
            'test_cases_count': len(test)
        }, f, indent=4)
        
    # 8. Save sample test predictions (100 unseen cases for dual-pipeline comparison)
    predictions_df = pd.DataFrame({
        'trip_id': test['trip_id'].values if 'trip_id' in test.columns else range(len(test_preds)),
        'actual': test_y.values,
        'prediction': test_preds,
        'probability': test_probs[:, 1] if test_probs is not None else 0.5
    })
    predictions_df.head(100).to_csv('models/python/predictions/delay_sample.csv', index=False)
    logger.info("Saved 100 test predictions to models/python/predictions/delay_sample.csv")

if __name__ == '__main__':
    run_pipeline()
