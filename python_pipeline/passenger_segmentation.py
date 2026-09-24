"""
Passenger Segmentation Pipeline (SRS Section 28).
Clusters transit riders into behavioral segments using:
- Trip frequency, average fare, peak hour ratio, transit pass adoption, payment methods.
Evaluates K-Means clustering with Silhouette Score.
Exports models/python/passenger_segments.json.
"""

import os
import sys
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAW_DIR = PROJECT_ROOT / "data/raw"
MODEL_DIR = PROJECT_ROOT / "models/python"
OUT_JSON = MODEL_DIR / "passenger_segments.json"

def main():
    logger.info("Starting passenger segmentation pipeline...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    tickets_file = RAW_DIR / "tickets.csv"
    if not tickets_file.exists():
        logger.error("tickets.csv missing for passenger segmentation.")
        return

    # Sample up to 100,000 tickets for fast, representative passenger profiling
    sample_size = 100000
    df = pd.read_csv(tickets_file, nrows=sample_size, usecols=[
        "passenger_id", "route_id", "boarding_time", "fare", "ticket_type", "payment_method"
    ])
    
    # Filter valid passengers
    df = df[df["passenger_id"].str.startswith("P-", na=False) & ~df["passenger_id"].str.contains("UNKNOWN", na=False)]
    if df.empty:
        logger.warning("No valid passenger IDs found in sample.")
        return
        
    # Extract boarding hour
    def parse_hour(val):
        try:
            return int(str(val).split(":")[0])
        except Exception:
            return 12
            
    df["hour"] = df["boarding_time"].apply(parse_hour)
    df["is_peak"] = df["hour"].isin([7, 8, 9, 17, 18, 19]).astype(float)
    df["is_pass"] = df["ticket_type"].str.contains("pass", case=False, na=False).astype(float)
    df["is_cash"] = (df["payment_method"] == "cash").astype(float)
    df["fare"] = pd.to_numeric(df["fare"], errors="coerce").fillna(50.0).clip(lower=0, upper=500)
    
    # Aggregate per passenger
    pax_agg = df.groupby("passenger_id").agg({
        "fare": ["count", "mean"],
        "is_peak": "mean",
        "is_pass": "mean",
        "is_cash": "mean"
    }).reset_index()
    pax_agg.columns = ["passenger_id", "frequency", "avg_fare", "peak_ratio", "pass_ratio", "cash_ratio"]
    
    feature_cols = ["frequency", "avg_fare", "peak_ratio", "pass_ratio", "cash_ratio"]
    X = pax_agg[feature_cols].fillna(0.0)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    k = 4
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    pax_agg["cluster"] = km.fit_predict(X_scaled)
    sil = silhouette_score(X_scaled[:5000], pax_agg["cluster"][:5000])
    
    logger.info(f"Passenger Segmentation K-Means (k=4) Silhouette Score: {sil:.3f}")
    
    segment_names = [
        "Daily Commercial Commuters",
        "Student & Concession Pass Holders",
        "Off-Peak Retail & General Public",
        "Occasional Cash Transit Users"
    ]
    
    segments = []
    total_pax = len(pax_agg)
    for c_id in sorted(pax_agg["cluster"].unique()):
        c_df = pax_agg[pax_agg["cluster"] == c_id]
        name = segment_names[c_id % len(segment_names)]
        pct = round(len(c_df) / total_pax * 100.0, 1)
        mean_peak = float(c_df["peak_ratio"].mean())
        mean_freq = float(c_df["frequency"].mean())
        mean_fare = float(c_df["avg_fare"].mean())
        
        peak_desc = "08:00 & 18:00 (Rush Hours)" if mean_peak > 0.50 else "11:00 - 16:00 (Midday Off-Peak)"
        
        segments.append({
            "segment_id": int(c_id),
            "name": name,
            "percentage": pct,
            "count": len(c_df),
            "average_frequency": round(mean_freq, 2),
            "average_fare_pkr": round(mean_fare, 1),
            "peak_travel_ratio": round(mean_peak, 3),
            "peak_usage": peak_desc
        })
        
    result = {
        "method": "K-Means (k=4) on Passenger Travel Profiles",
        "silhouette_score": round(sil, 3),
        "total_passengers_analyzed": total_pax,
        "segments": segments
    }
    
    with open(OUT_JSON, "w") as f:
        json.dump(result, f, indent=4)
        
    logger.info(f"Saved passenger segmentation results to {OUT_JSON}")

if __name__ == "__main__":
    main()
