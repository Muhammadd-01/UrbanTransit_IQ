import os
import json
import joblib
import pandas as pd
import logging
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from .data_loader import load_all_data
from .preprocessing import clean_data
from .feature_engineering import create_trip_features, chronological_split
from .evaluation import evaluate_classifier, get_feature_importance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_and_evaluate(train_X, train_y, val_X, val_y, test_X, test_y, feature_names):
    models = {
        'lr': LogisticRegression(max_iter=1000, C=1.0, random_state=42),
        'rf': RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
        'xgb': XGBClassifier(n_estimators=100, max_depth=8, learning_rate=0.1, random_state=42)
    }
    
    best_f1 = -1
    best_model_name = None
    best_model = None
    results = {}
    
    for name, model in models.items():
        logger.info(f"Training {name}...")
        model.fit(train_X, train_y)
        
        preds = model.predict(val_X)
        probs = model.predict_proba(val_X) if hasattr(model, 'predict_proba') else None
        
        metrics = evaluate_classifier(val_y, preds, probs)
        results[name] = metrics
        
        if metrics['f1'] > best_f1:
            best_f1 = metrics['f1']
            best_model_name = name
            best_model = model
            
    logger.info(f"Best model: {best_model_name} with Validation F1: {best_f1}")
    
    # Evaluate best model on test
    test_preds = best_model.predict(test_X)
    test_probs = best_model.predict_proba(test_X) if hasattr(best_model, 'predict_proba') else None
    test_metrics = evaluate_classifier(test_y, test_preds, test_probs)
    
    feature_imp = get_feature_importance(best_model, feature_names)
    
    return best_model_name, best_model, test_metrics, feature_imp, test_preds, test_probs

def main():
    logger.info("Starting delay prediction pipeline...")
    os.makedirs('models/python', exist_ok=True)
    os.makedirs('models/python/predictions', exist_ok=True)
    
    # 1. Load data
    raw_data = load_all_data()
    
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
    
    # 4. Split
    train, val, test = chronological_split(features_df)
    
    # Features
    feature_cols = [
        'hour', 'day_of_week', 'month', 'weekend_indicator', 'peak_indicator',
        'route_distance', 'historical_delay', 'historical_demand', 'occupancy_percentage'
    ]
    target_col = 'is_delayed'
    
    # Ensure columns exist and impute NaNs if any
    for col in feature_cols:
        if col not in features_df.columns:
            train[col] = 0
            val[col] = 0
            test[col] = 0
            
    train_X = train[feature_cols].fillna(0)
    train_y = train[target_col].fillna(0)
    val_X = val[feature_cols].fillna(0)
    val_y = val[target_col].fillna(0)
    test_X = test[feature_cols].fillna(0)
    test_y = test[target_col].fillna(0)
    
    if len(train_X) == 0:
        logger.error("No training data available.")
        return
        
    # 5 & 6 & 7 & 8. Train, select best, evaluate
    best_name, model, metrics, importance, test_preds, test_probs = train_and_evaluate(
        train_X, train_y, val_X, val_y, test_X, test_y, feature_cols
    )
    
    # 9. Save model
    joblib.dump(model, f'models/python/delay_prediction_{best_name}.joblib')
    
    # 10. Save metrics
    with open('models/python/delay_prediction_metrics.json', 'w') as f:
        json.dump({'test_metrics': metrics, 'feature_importance': importance}, f, indent=4)
        
    # 11. Save sample predictions
    predictions_df = pd.DataFrame({
        'trip_id': test['trip_id'].values if 'trip_id' in test.columns else range(len(test_preds)),
        'actual': test_y.values,
        'prediction': test_preds,
        'probability': test_probs[:, 1] if test_probs is not None else 0
    })
    predictions_df.head(100).to_csv('models/python/predictions/delay_sample.csv', index=False)
    logger.info("Pipeline complete.")

if __name__ == '__main__':
    main()
