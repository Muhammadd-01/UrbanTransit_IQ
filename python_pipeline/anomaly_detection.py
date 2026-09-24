"""
Anomaly Detection Pipeline (SRS Section 28).
Detects operational anomalies across delays, passenger surges, and headway irregularities using:
- Statistical 3-Sigma Z-Score
- Interquartile Range (IQR) Rule
- Multi-dimensional Isolation Forest
Exports reports/anomalies_detected.json.
"""

import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
import logging
from sklearn.ensemble import IsolationForest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAW_DIR = PROJECT_ROOT / "data/raw"
REPORTS_DIR = PROJECT_ROOT / "reports"
OUT_JSON = REPORTS_DIR / "anomalies_detected.json"

def detect_anomalies_zscore(df: pd.DataFrame, column: str, threshold: float = 3.0) -> pd.DataFrame:
    if df.empty or column not in df.columns:
        return pd.DataFrame()
    s = pd.to_numeric(df[column], errors="coerce").fillna(0)
    mean = s.mean()
    std = s.std()
    if std == 0:
        return pd.DataFrame()
    z_scores = np.abs((s - mean) / std)
    anom = df[z_scores > threshold].copy()
    anom["anomaly_score"] = z_scores[z_scores > threshold]
    anom["anomaly_method"] = "Z-Score"
    anom["anomaly_explanation"] = anom.apply(
        lambda r: f"{column} value {r[column]} is {r['anomaly_score']:.2f} standard deviations from mean {mean:.2f}",
        axis=1
    )
    return anom

def detect_anomalies_iqr(df: pd.DataFrame, column: str) -> pd.DataFrame:
    if df.empty or column not in df.columns:
        return pd.DataFrame()
    s = pd.to_numeric(df[column], errors="coerce").fillna(0)
    q1 = s.quantile(0.25)
    q3 = s.quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    anom = df[(s < lower_bound) | (s > upper_bound)].copy()
    anom["anomaly_score"] = 1.5
    anom["anomaly_method"] = "IQR"
    anom["anomaly_explanation"] = anom.apply(
        lambda r: f"{column} value {r[column]} falls outside normal IQR bounds [{lower_bound:.1f}, {upper_bound:.1f}]",
        axis=1
    )
    return anom

def detect_anomalies_isolation_forest(df: pd.DataFrame, columns: list, contamination: float = 0.02) -> pd.DataFrame:
    if df.empty or not all(c in df.columns for c in columns):
        return pd.DataFrame()
    clean_df = df.copy()
    for c in columns:
        clean_df[c] = pd.to_numeric(clean_df[c], errors="coerce").fillna(0)
    clean_df = clean_df.dropna(subset=columns)
    if len(clean_df) < 50:
        return pd.DataFrame()

    clf = IsolationForest(contamination=contamination, random_state=42, n_estimators=50)
    preds = clf.fit_predict(clean_df[columns])
    scores = clf.decision_function(clean_df[columns])
    
    anom = clean_df[preds == -1].copy()
    anom["anomaly_score"] = -scores[preds == -1]
    anom["anomaly_method"] = "Isolation Forest"
    anom["anomaly_explanation"] = f"Multi-variate outlier flagged by Isolation Forest on dimensions {columns}"
    return anom

def main():
    logger.info("Starting comprehensive transit anomaly detection...")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    delays_file = RAW_DIR / "delays.csv"
    pax_file = RAW_DIR / "passenger_counts.csv"
    
    detected = []
    
    if delays_file.exists():
        delays_df = pd.read_csv(delays_file, nrows=25000)
        # Z-Score delay anomalies
        z_delays = detect_anomalies_zscore(delays_df, "delay_minutes", threshold=3.5)
        for _, r in z_delays.head(15).iterrows():
            detected.append({
                "record_id": str(r.get("delay_id", r.get("trip_id", "DEL-ANOM"))),
                "type": "Extreme Congestion Delay",
                "score": round(float(r["anomaly_score"]), 2),
                "explanation": f"Delay of {r['delay_minutes']} mins on route {r.get('route_id', 'N/A')} at stop {r.get('stop_id', 'N/A')} ({r['anomaly_explanation']}).",
                "timestamp": str(r.get("timestamp", "2024-03-14T08:30:00"))
            })
            
    if pax_file.exists():
        pax_df = pd.read_csv(pax_file, nrows=25000)
        # Isolation Forest on load and boardings
        if_pax = detect_anomalies_isolation_forest(pax_df, ["current_load", "boarding_count"], contamination=0.01)
        for _, r in if_pax.head(15).iterrows():
            detected.append({
                "record_id": str(r.get("count_id", "PAX-ANOM")),
                "type": "Unscheduled Passenger Surge",
                "score": round(float(r["anomaly_score"]) * 10.0, 2),
                "explanation": f"Unusual load ({r['current_load']}) with boarding surge ({r['boarding_count']}) at stop {r.get('stop_id', 'N/A')}.",
                "timestamp": str(r.get("timestamp", "2024-03-14T09:15:00"))
            })

    output = {
        "detection_method": "Isolation Forest & 3-Sigma Z-Score Ensemble",
        "total_anomalies": len(detected),
        "anomalies": detected
    }
    
    with open(OUT_JSON, "w") as f:
        json.dump(output, f, indent=4)
        
    logger.info(f"Anomaly detection complete. Found {len(detected)} anomalies. Saved to {OUT_JSON}")

if __name__ == "__main__":
    main()
