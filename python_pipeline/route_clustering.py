"""
Route Clustering Pipeline (SRS Section 27 / Section 28).
Clusters transit routes based on operational profiles:
- Average demand, average occupancy, average delay, reliability/punctuality,
  trip frequency, route distance.
Evaluates K-Means, DBSCAN, and Agglomerative Clustering using:
- Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Index.
Exports models/python/route_clusters.json and connects to API.
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
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAW_DIR = PROJECT_ROOT / "data/raw"
MODEL_DIR = PROJECT_ROOT / "models/python"
OUT_JSON = MODEL_DIR / "route_clusters.json"

def main():
    logger.info("Starting route clustering pipeline...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    routes_file = RAW_DIR / "routes.csv"
    trips_file = RAW_DIR / "trips.csv"
    pax_file = RAW_DIR / "passenger_counts.csv"
    delays_file = RAW_DIR / "delays.csv"
    
    if not (routes_file.exists() and trips_file.exists()):
        logger.error("Required raw files missing for route clustering.")
        return

    routes_df = pd.read_csv(routes_file)
    trips_df = pd.read_csv(trips_file, usecols=["trip_id", "route_id"])
    
    # 1. Fast Vectorized Aggregations
    if pax_file.exists():
        pax_df = pd.read_csv(pax_file, usecols=["trip_id", "boarding_count", "current_load", "vehicle_capacity"])
        pax_df["current_load"] = pd.to_numeric(pax_df["current_load"], errors="coerce").fillna(0).clip(lower=0)
        pax_df["boarding_count"] = pd.to_numeric(pax_df["boarding_count"], errors="coerce").fillna(0).clip(lower=0)
        pax_df["vehicle_capacity"] = pd.to_numeric(pax_df["vehicle_capacity"], errors="coerce").fillna(50).clip(lower=10)
        
        trip_pax = pax_df.groupby("trip_id").agg({
            "current_load": "max",
            "boarding_count": "sum",
            "vehicle_capacity": "first"
        }).reset_index()
    else:
        trip_pax = pd.DataFrame(columns=["trip_id", "current_load", "boarding_count", "vehicle_capacity"])

    if delays_file.exists():
        delays_df = pd.read_csv(delays_file, usecols=["trip_id", "delay_minutes"])
        delays_df["delay_minutes"] = pd.to_numeric(delays_df["delay_minutes"], errors="coerce").fillna(0.0)
        trip_delays = delays_df.groupby("trip_id").agg({"delay_minutes": "mean"}).reset_index()
    else:
        trip_delays = pd.DataFrame(columns=["trip_id", "delay_minutes"])

    merged = pd.merge(trips_df, trip_pax, on="trip_id", how="left")
    merged = pd.merge(merged, trip_delays, on="trip_id", how="left")
    
    merged["current_load"] = merged["current_load"].fillna(25.0)
    merged["vehicle_capacity"] = merged["vehicle_capacity"].fillna(50.0)
    merged["boarding_count"] = merged["boarding_count"].fillna(40.0)
    merged["delay_minutes"] = merged["delay_minutes"].fillna(2.5)
    merged["occupancy"] = merged["current_load"] / merged["vehicle_capacity"].replace(0, 50)
    merged["on_time"] = (merged["delay_minutes"] <= 5.0).astype(float)
    
    # Group by route_id
    route_agg = merged.groupby("route_id").agg({
        "boarding_count": "mean",
        "occupancy": "mean",
        "delay_minutes": "mean",
        "on_time": "mean",
        "trip_id": "count"
    }).reset_index().rename(columns={
        "boarding_count": "avg_demand",
        "occupancy": "avg_occupancy",
        "delay_minutes": "avg_delay",
        "on_time": "punctuality",
        "trip_id": "trip_frequency"
    })
    route_agg["punctuality"] = route_agg["punctuality"] * 100.0

    # Add distance_km from routes
    if "distance_km" in routes_df.columns:
        route_agg = pd.merge(route_agg, routes_df[["route_id", "distance_km"]], on="route_id", how="left")
        route_agg["route_distance"] = route_agg["distance_km"].fillna(18.5)
    else:
        route_agg["route_distance"] = 18.5
        
    feature_cols = ["avg_demand", "avg_occupancy", "avg_delay", "punctuality", "trip_frequency", "route_distance"]
    X = route_agg[feature_cols].fillna(0.0)
    
    # 2. Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 3. Evaluate clustering algorithms
    k_range = [3, 4, 5]
    best_k = 3
    best_sil = -1
    best_kmeans = None
    
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels)
        if sil > best_sil:
            best_sil = sil
            best_k = k
            best_kmeans = km

    route_agg["cluster"] = best_kmeans.labels_
    
    # Evaluate DBSCAN and Agglomerative
    agg = AgglomerativeClustering(n_clusters=best_k)
    agg_labels = agg.fit_predict(X_scaled)
    agg_sil = silhouette_score(X_scaled, agg_labels)
    
    db = DBSCAN(eps=1.5, min_samples=3)
    db_labels = db.fit_predict(X_scaled)
    db_sil = silhouette_score(X_scaled, db_labels) if len(set(db_labels)) > 1 else -1.0
    
    db_score = davies_bouldin_score(X_scaled, route_agg["cluster"])
    ch_score = calinski_harabasz_score(X_scaled, route_agg["cluster"])
    
    logger.info(f"Clustering evaluation: KMeans (k={best_k}) Sil={best_sil:.3f}, Agglomerative Sil={agg_sil:.3f}, DBSCAN Sil={db_sil:.3f}")
    logger.info(f"Best K-Means Metrics: Davies-Bouldin={db_score:.3f}, Calinski-Harabasz={ch_score:.1f}")
    
    cluster_names = [
        "High Demand / High Congestion Trunk",
        "High Frequency / High Reliability Express & BRT",
        "Suburban Feeder / Moderate Demand",
        "Peripheral Low-Density Route"
    ]
    
    cluster_info = []
    for c_id in sorted(route_agg["cluster"].unique()):
        c_df = route_agg[route_agg["cluster"] == c_id]
        name = cluster_names[c_id % len(cluster_names)]
        centroid = {col: round(float(c_df[col].mean()), 2) for col in feature_cols}
        members = c_df["route_id"].tolist()
        
        cluster_info.append({
            "cluster_id": int(c_id),
            "name": name,
            "description": f"Cluster of {len(members)} routes with average demand {centroid['avg_demand']} and occupancy {centroid['avg_occupancy']:.1%}.",
            "centroid": centroid,
            "route_count": len(members),
            "members": members[:10]
        })
        
    result = {
        "method": f"K-Means (k={best_k}) with StandardScaler",
        "silhouette_score": round(best_sil, 3),
        "davies_bouldin_index": round(db_score, 3),
        "calinski_harabasz_index": round(ch_score, 1),
        "total_routes_clustered": len(route_agg),
        "clusters": cluster_info,
        "comparison_metrics": {
            "kmeans_silhouette": round(best_sil, 3),
            "agglomerative_silhouette": round(agg_sil, 3),
            "dbscan_silhouette": round(db_sil, 3) if db_sil != -1.0 else "N/A"
        }
    }
    
    with open(OUT_JSON, "w") as f:
        json.dump(result, f, indent=4)
        
    joblib.dump(best_kmeans, MODEL_DIR / "route_clustering_kmeans.csv")
    joblib.dump(scaler, MODEL_DIR / "route_clustering_scaler.csv")
    logger.info(f"Route clustering pipeline complete. Saved to {OUT_JSON}")

if __name__ == "__main__":
    main()
