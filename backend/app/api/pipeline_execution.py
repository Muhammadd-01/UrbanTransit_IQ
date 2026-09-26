from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.engine import get_db
import pandas as pd
import numpy as np
import time
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, mean_squared_error

# Try importing XGBoost; fallback to sklearn GradientBoosting if unavailable
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except (ImportError, OSError):
    HAS_XGBOOST = False

router = APIRouter()

# --- GLOBAL MODEL CACHE ---
_MODEL_CACHE = {
    "is_trained": False,
    "spark_model": None,
    "xgb_model": None,
    "records_used": 0,
    "X_test": None,
    "y_test": None,
    "spark_acc": 0.0,
    "xgb_acc": 0.0,
    "spark_f1": 0.0,
    "xgb_f1": 0.0,
    "spark_rmse": 0.0,
    "xgb_rmse": 0.0,
}

def _fetch_training_data(db: Session):
    """Fetch real data from PostgreSQL passenger_counts + delays tables."""
    query = text("""
        SELECT 
            p.boarding, p.alighting, p.load,
            EXTRACT(HOUR FROM p.timestamp) as hour,
            CASE WHEN d.delay_minutes IS NOT NULL AND d.delay_minutes > 5 THEN 1 ELSE 0 END as is_delayed
        FROM passenger_counts p
        LEFT JOIN delays d ON p.route_id = d.route_id 
            AND DATE(p.timestamp) = DATE(d.timestamp)
            AND EXTRACT(HOUR FROM p.timestamp) = EXTRACT(HOUR FROM d.timestamp)
        WHERE p.boarding IS NOT NULL
        ORDER BY p.timestamp DESC
    """)
    result = db.execute(query).fetchall()
    if not result:
        return None
    df = pd.DataFrame(result, columns=["boarding", "alighting", "load", "hour", "is_delayed"])
    df.fillna(0, inplace=True)
    df["hour"] = pd.to_numeric(df["hour"], errors='coerce').fillna(0).astype(int)
    df["boarding"] = pd.to_numeric(df["boarding"], errors='coerce').fillna(0).astype(float)
    df["alighting"] = pd.to_numeric(df["alighting"], errors='coerce').fillna(0).astype(float)
    df["load"] = pd.to_numeric(df["load"], errors='coerce').fillna(0).astype(float)
    df["is_delayed"] = pd.to_numeric(df["is_delayed"], errors='coerce').fillna(0).astype(int)
    return df

def _train_models_if_needed(db: Session, force: bool = False):
    global _MODEL_CACHE
    if _MODEL_CACHE["is_trained"] and not force:
        return None  # Already trained
    
    # Reset cache when force retraining
    if force:
        _MODEL_CACHE["is_trained"] = False
        
    df = _fetch_training_data(db)
    if df is None or len(df) < 20:
        return {"error": "Not enough data in PostgreSQL database."}
        
    X = df[["boarding", "alighting", "load", "hour"]]
    y = df["is_delayed"]

    if len(y.unique()) < 2:
        return {"error": "Not enough variance in target variable to train a model."}

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

    # 1. Train Spark (Random Forest)
    spark_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    spark_model.fit(X_train, y_train)
    
    # 2. Train XGBoost
    if HAS_XGBOOST:
        xgb_model = xgb.XGBClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.1,
            random_state=42, eval_metric="logloss"
        )
    else:
        xgb_model = GradientBoostingClassifier(
            n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
        )
    xgb_model.fit(X_train, y_train)
    
    # Cache everything
    _MODEL_CACHE["spark_model"] = spark_model
    _MODEL_CACHE["xgb_model"] = xgb_model
    _MODEL_CACHE["X_test"] = X_test
    _MODEL_CACHE["y_test"] = y_test
    _MODEL_CACHE["records_used"] = len(df)
    
    # Calculate global accuracy once
    sp_preds = spark_model.predict(X_test)
    xb_preds = xgb_model.predict(X_test)
    sp_probs = spark_model.predict_proba(X_test)[:, 1] if spark_model.predict_proba(X_test).shape[1] > 1 else spark_model.predict_proba(X_test)[:, 0]
    xb_probs = xgb_model.predict_proba(X_test)[:, 1] if xgb_model.predict_proba(X_test).shape[1] > 1 else xgb_model.predict_proba(X_test)[:, 0]
    
    _MODEL_CACHE["spark_acc"] = accuracy_score(y_test, sp_preds)
    _MODEL_CACHE["xgb_acc"] = accuracy_score(y_test, xb_preds)
    _MODEL_CACHE["spark_f1"] = f1_score(y_test, sp_preds, zero_division=0)
    _MODEL_CACHE["xgb_f1"] = f1_score(y_test, xb_preds, zero_division=0)
    _MODEL_CACHE["spark_rmse"] = float(np.sqrt(mean_squared_error(y_test, sp_probs)))
    _MODEL_CACHE["xgb_rmse"] = float(np.sqrt(mean_squared_error(y_test, xb_probs)))
    _MODEL_CACHE["is_trained"] = True
    
    return None

@router.post("/retrain")
async def force_retrain(db: Session = Depends(get_db)):
    """Force retrain both models on ALL current database records."""
    global _MODEL_CACHE
    start_time = time.time()
    _MODEL_CACHE["is_trained"] = False
    err = _train_models_if_needed(db, force=True)
    if err:
        return err
    latency = round((time.time() - start_time) * 1000, 2)
    return {
        "status": "retrained",
        "records_used": _MODEL_CACHE["records_used"],
        "spark_acc": round(_MODEL_CACHE["spark_acc"] * 100, 2),
        "xgb_acc": round(_MODEL_CACHE["xgb_acc"] * 100, 2),
        "latency_ms": latency
    }

@router.get("/status")
async def pipeline_status():
    """Return current pipeline training status and all model metrics."""
    return {
        "is_trained": _MODEL_CACHE["is_trained"],
        "records_used": _MODEL_CACHE["records_used"],
        "spark_acc": round(_MODEL_CACHE["spark_acc"] * 100, 2) if _MODEL_CACHE["is_trained"] else 0,
        "xgb_acc": round(_MODEL_CACHE["xgb_acc"] * 100, 2) if _MODEL_CACHE["is_trained"] else 0,
        "spark_f1": round(_MODEL_CACHE["spark_f1"], 4) if _MODEL_CACHE["is_trained"] else 0,
        "xgb_f1": round(_MODEL_CACHE["xgb_f1"], 4) if _MODEL_CACHE["is_trained"] else 0,
        "spark_rmse": round(_MODEL_CACHE["spark_rmse"], 4) if _MODEL_CACHE["is_trained"] else 0,
        "xgb_rmse": round(_MODEL_CACHE["xgb_rmse"], 4) if _MODEL_CACHE["is_trained"] else 0,
    }

def _fetch_latest_row(db: Session):
    query = text("""
        SELECT p.boarding, p.alighting, p.load, EXTRACT(HOUR FROM p.timestamp) as hour
        FROM passenger_counts p
        WHERE p.boarding IS NOT NULL
        ORDER BY p.timestamp DESC
        LIMIT 1
    """)
    result = db.execute(query).fetchone()
    if not result:
        # Fallback dummy row if DB completely empty
        return pd.DataFrame([{"boarding": 10, "alighting": 5, "load": 20, "hour": 8}])
    
    df = pd.DataFrame([result], columns=["boarding", "alighting", "load", "hour"])
    df["hour"] = pd.to_numeric(df["hour"], errors='coerce').fillna(0).astype(int)
    df["boarding"] = pd.to_numeric(df["boarding"], errors='coerce').fillna(0).astype(float)
    df["alighting"] = pd.to_numeric(df["alighting"], errors='coerce').fillna(0).astype(float)
    df["load"] = pd.to_numeric(df["load"], errors='coerce').fillna(0).astype(float)
    return df

@router.post("/execute")
async def execute_pipeline(pipeline_type: str, db: Session = Depends(get_db)):
    start_time = time.time()

    # Always force retrain to use ALL records in the database
    err = _train_models_if_needed(db, force=True)
    if err: return err
    
    latest_X = _fetch_latest_row(db)
    model = _MODEL_CACHE["spark_model"] if pipeline_type.upper() == "SPARK" else _MODEL_CACHE["xgb_model"]
    acc = _MODEL_CACHE["spark_acc"] if pipeline_type.upper() == "SPARK" else _MODEL_CACHE["xgb_acc"]
    
    pred_val = int(model.predict(latest_X)[0])
    prob = float(model.predict_proba(latest_X)[0].max())

    latency_ms = round((time.time() - start_time) * 1000, 2)
    latest_row = latest_X.iloc[0]

    return {
        "status": "success",
        "type": pipeline_type.upper(),
        "pred": "DELAYED" if pred_val == 1 else "ON-TIME",
        "confidence": f"{round(prob * 100, 2)}%",
        "latency": f"{latency_ms}ms",
        "accuracy": round(acc * 100, 2),
        "f1_score": round(_MODEL_CACHE["spark_f1"] if pipeline_type.upper() == "SPARK" else _MODEL_CACHE["xgb_f1"], 4),
        "rmse": round(_MODEL_CACHE["spark_rmse"] if pipeline_type.upper() == "SPARK" else _MODEL_CACHE["xgb_rmse"], 4),
        "records_used": _MODEL_CACHE["records_used"],
        "raw_data": {
            "boarding": int(latest_row["boarding"]),
            "alighting": int(latest_row["alighting"]),
            "load": int(latest_row["load"]),
            "hour": int(latest_row["hour"])
        }
    }


@router.get("/compare")
async def execute_comparison(db: Session = Depends(get_db)):
    """Run both pipelines on the same data and compare predictions."""
    start_time = time.time()

    err = _train_models_if_needed(db)
    if err: return err

    X_test = _MODEL_CACHE["X_test"]
    y_test = _MODEL_CACHE["y_test"]
    spark_model = _MODEL_CACHE["spark_model"]
    xgb_model = _MODEL_CACHE["xgb_model"]

    # Only compare on up to 50 rows to keep JSON small
    num_cases = min(50, len(X_test))
    sample_X = X_test.iloc[:num_cases]
    sample_y = y_test.iloc[:num_cases]

    spark_preds = spark_model.predict(sample_X)
    spark_probs = spark_model.predict_proba(sample_X)[:, 1] if spark_model.predict_proba(sample_X).shape[1] > 1 else spark_model.predict_proba(sample_X)[:, 0]
    xgb_preds = xgb_model.predict(sample_X)
    xgb_probs = xgb_model.predict_proba(sample_X)[:, 1] if xgb_model.predict_proba(sample_X).shape[1] > 1 else xgb_model.predict_proba(sample_X)[:, 0]

    cases = []
    matches = 0

    for i in range(num_cases):
        actual = int(sample_y.iloc[i])
        sp_pred = int(spark_preds[i])
        sp_prob = float(spark_probs[i])
        xb_pred = int(xgb_preds[i])
        xb_prob = float(xgb_probs[i])

        diff = abs(sp_prob - xb_prob)
        match = (sp_pred == xb_pred)
        if match:
            matches += 1

        row = sample_X.iloc[i]
        if match:
            expl = f"Both models agree: boarding={int(row['boarding'])}, load={int(row['load'])}, hour={int(row['hour'])}."
        else:
            expl = f"Divergence at boarding={int(row['boarding'])}, load={int(row['load'])}, hour={int(row['hour'])}. Spark={sp_pred}, XGB={xb_pred}."

        cases.append({
            "case_id": f"PG-{i + 1:03d}",
            "actual_result": actual,
            "spark_result": sp_pred,
            "python_result": xb_pred,
            "spark_probability": round(sp_prob, 4),
            "python_probability": round(xb_prob, 4),
            "numerical_difference": round(diff, 4),
            "match_status": match,
            "explanation": expl
        })

    agreement_rate = round((matches / num_cases) * 100, 2) if num_cases > 0 else 0
    latency_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "agreement_rate": agreement_rate,
        "cases": cases,
        "spark_acc": round(_MODEL_CACHE["spark_acc"] * 100, 2),
        "xgb_acc": round(_MODEL_CACHE["xgb_acc"] * 100, 2),
        "records_used": _MODEL_CACHE["records_used"],
        "latency_ms": latency_ms
    }
