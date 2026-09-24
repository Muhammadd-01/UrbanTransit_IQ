# UrbanTransit IQ — Competition Demonstration Checklist

Use this checklist to verify that all 24 mandatory demonstration items from the UrbanTransit IQ SRS are functional and prepared for presentation.

---

## Pre-Demo Setup Verification

- [x] Environment configured: `config/settings.py` and `config/thresholds.yaml`
- [x] Python dependencies installed in virtual environment
- [x] Supabase tables migrated using `backend/app/database/schema.sql`
- [x] Data directories initialized: `data/raw/`, `data/cleaned/`, `data/parquet/`, `models/`
- [x] Frontend dependencies installed: `frontend/package.json`

---

## 24 Mandatory Demonstration Items

| Item # | SRS Feature / Workflow | Module / File | Status | Notes |
|:------:|:-----------------------|:--------------|:------:|:------|
| **1** | **User Login & Authentication** | `backend/app/api/auth.py`, `frontend/src/pages/Login.jsx` | [x] Ready | JWT authentication with bcrypt password verification and role-based access. |
| **2** | **Dataset Generation** | `data_generator/generate_data.py` | [x] Ready | Supports `--scale small`, `medium`, and `competition`. 12 Karachi entities. |
| **3** | **HDFS Ingestion & Verification** | `hadoop/hdfs_scripts/upload_to_hdfs.sh`, `verify_hdfs.sh` | [x] Ready | Genuine HDFS directory structure `/urbantransit/raw/`. |
| **4** | **PySpark Processing & Partitioning**| `spark_jobs/ingestion.py`, `spark_jobs/partitioning.py` | [x] Ready | SparkSession with snappy-compressed Parquet partitioned by `(year, month)`. |
| **5** | **Data Quality Audit System** | `spark_jobs/data_quality.py`, `backend/app/api/quality.py` | [x] Ready | 4-tier audit classification (`VALID`, `CORRECTED`, `FLAGGED`, `QUARANTINED`). |
| **6** | **Passenger Flow Analysis** | `backend/app/analytics/passenger_flow.py`, `PassengerFlow.jsx` | [x] Ready | Boarding/alighting volume profiles, directionality, and temporal distributions. |
| **7** | **Origin-Destination (OD) Matrix** | `backend/app/analytics/od_analysis.py`, `ODAnalysis.jsx` | [x] Ready | Interactive matrix heatmap of passenger corridors across Karachi zones. |
| **8** | **Peak Period Detection** | `backend/app/analytics/peak_detection.py` | [x] Ready | Statistical peak derivation (z-score and percentile based; not hard-coded). |
| **9** | **Overcrowding Detection** | `backend/app/analytics/overcrowding.py` | [x] Ready | Multi-trip persistent pattern detection using configurable load thresholds. |
| **10** | **Underutilized Service Detection** | `backend/app/analytics/underutilization.py` | [x] Ready | Identifies low-demand lines (<25% occupancy over >10 days). |
| **11** | **Route Performance Scoring** | `backend/app/analytics/route_performance.py` | [x] Ready | Transparent composite score combining punctuality, demand, and reliability. |
| **12** | **Delay Analysis & Bottlenecks** | `backend/app/analytics/delay_analysis.py`, `bottleneck.py` | [x] Ready | Root-cause delay attribution and spatial bottleneck heatmap coordinates. |
| **13** | **Headway & Vehicle Bunching** | `backend/app/analytics/headway.py`, `vehicle_bunching.py` | [x] Ready | Detects bunching events (<0.4x headway) and irregular service gaps. |
| **14** | **Vehicle Fleet Utilization** | `backend/app/analytics/vehicle_utilization.py` | [x] Ready | Tracks vehicle load factors, daily trips, and maintenance delay correlations. |
| **15** | **Delay Prediction (Spark MLlib)** | `spark_ml/delay_prediction.py` | [x] Ready | Compares Logistic Regression, Random Forest, and GBT with test metrics. |
| **16** | **Delay Prediction (Python ML)** | `python_pipeline/delay_prediction.py` | [x] Ready | Independent Scikit-learn/XGBoost models trained on chronological splits. |
| **17** | **Delay Severity Classification** | `python_pipeline/delay_severity.py`, `spark_ml/delay_severity.py` | [x] Ready | 5-class classification (On Time, Minor, Moderate, Major, Severe). |
| **18** | **Route Clustering** | `python_pipeline/route_clustering.py`, `spark_ml/route_clustering.py` | [x] Ready | Unsupervised K-Means clustering with Silhouette score and descriptive profiles. |
| **19** | **Passenger Demand Forecasting** | `forecasting/demand_forecast.py`, `python_pipeline/demand_forecast.py` | [x] Ready | SARIMA and Lagged XGBoost models evaluated via MAE, RMSE, and MAPE. |
| **20** | **Occupancy Forecasting** | `forecasting/occupancy_forecast.py` | [x] Ready | Future occupancy projections with explicit capacity remaining and risk flags. |
| **21** | **Dual-Pipeline Comparison** | `python_pipeline/comparison.py`, `ModelComparison.jsx` | [x] Ready | Evaluates ≥100 unseen cases; calculates agreement rate and explains divergence. |
| **22** | **Evidence-Based Recommendations** | `recommendation_engine/engine.py`, `Recommendations.jsx` | [x] Ready | Pure rule-based engine linking computed metrics directly to operational advice. |
| **23** | **Interactive What-If Simulation** | `simulations/what_if.py`, `WhatIfSimulator.jsx` | [x] Ready | Modulates fleet/headway/capacity with distinct `SIMULATED` watermarking. |
| **24** | **Comprehensive Dashboard & Map** | `frontend/src/pages/Dashboard.jsx`, Leaflet Map | [x] Ready | Executive KPIs, interactive Karachi transit map, and global filter controls. |

---

## Evaluator Modification Verification

The evaluator can test system adaptability by:
1. Modifying thresholds in `config/thresholds.yaml` and witnessing immediate API reflection.
2. Adding a custom route to `data/raw/routes.csv` and validating pipeline ingestion.
3. Toggling between `DEVELOPMENT` and `COMPETITION` execution modes in `.env`.
