# UrbanTransit IQ — Task Tracker

## Phase 1 — Architecture & Foundation
- [x] Repository structure and root files (README.md, LICENSE, AI_USAGE.md, .gitignore, .env.example)
- [x] Configuration system (settings.py, thresholds.yaml, spark_config.py)
- [x] Backend FastAPI skeleton (main.py, 16 routers, middleware)
- [x] Supabase schema (schema.sql with 14 tables, FKs, indexes, RLS)
- [x] Backend models and schemas (Pydantic models and response schemas)
- [x] Authentication service (JWT, bcrypt password hashing, roles)
- [x] Audit logging service (13 action types, immutable log)
- [x] Frontend React skeleton (package.json, index.html, index.js, App.js, CSS)
- [x] Environment configuration (development & competition modes)

## Phase 2 — Dataset Generator
- [x] Generator framework and CLI (`generate_data.py --scale small|medium|competition`)
- [x] Karachi transit network model (Peoples Bus, Green Line, Orange Line, 10 zones)
- [x] All 12 entity generators (routes, stops, route_stops, vehicles, calendar, schedules, trips, passengers, tickets, passenger_counts, delays, gps_events)
- [x] Correlation engine (peak hours, weather, stop sequences, delay accumulation)
- [x] Noise/data-quality issue injection (missing values, duplicates, out-of-bounds coords)
- [x] Hidden-data readiness patterns (new routes, unseen stops, unknown vehicles)
- [x] Scale configurations (small: 50K, medium: 500K, competition: 2,000,000+)

## Phase 3 — Big Data Infrastructure
- [x] Hadoop pseudo-distributed setup script (`setup_hadoop.sh` for 16GB Mac)
- [x] HDFS configuration (`core-site.xml`, `hdfs-site.xml`)
- [x] Spark standalone setup script (`setup_spark.sh`)
- [x] Spark session configuration (`config/spark_config.py`)
- [x] HDFS upload and automated verification scripts (`upload_to_hdfs.sh`, `verify_hdfs.sh`)
- [x] PySpark ingestion with explicit `StructType` schemas (`spark_jobs/ingestion.py`)
- [x] Parquet partitioning strategy with evidence (`spark_jobs/partitioning.py`)

## Phase 4 — Data Quality Engine
- [x] Spark distributed data quality job (`spark_jobs/data_quality.py`)
- [x] Python data quality module (`backend/app/analytics/data_quality.py`)
- [x] 4-tier audit classification system (`VALID`, `CORRECTED`, `FLAGGED`, `QUARANTINED`)
- [x] Data quality report generation with completeness, consistency, validity
- [x] API endpoints for quality reports and record-level audits

## Phase 5 — Analytics
- [x] Passenger flow analysis (boarding/alighting volume, directionality)
- [x] OD matrix (zone-to-zone passenger exchange, top 20 corridors)
- [x] Peak detection (statistical derivation, non-hardcoded)
- [x] Overcrowding detection (persistent multi-trip pattern detection)
- [x] Underutilization detection (<25% occupancy over >10 days)
- [x] Route performance composite scoring (punctuality, occupancy, reliability)
- [x] Delay analysis and pattern detection
- [x] Headway and vehicle bunching analysis (<0.4x scheduled headway)
- [x] Vehicle utilization analytics
- [x] Spatial bottleneck detection with heatmap coordinates

## Phase 6 — Machine Learning
- [x] Spark MLlib delay prediction (Logistic Regression, Random Forest, GBT)
- [x] Python delay prediction (Logistic Regression, Random Forest, XGBoost)
- [x] Delay severity classification (5 classes: On Time, Minor, Moderate, Major, Severe)
- [x] Route clustering (K-Means with Silhouette scoring and descriptive profiles)
- [x] Anomaly detection (Z-score, IQR fences, Isolation Forest)
- [x] Passenger segmentation (behavioral commuter clustering)

## Phase 7 — Forecasting
- [x] Demand forecasting (SARIMA, Lagged XGBoost, Spark ML)
- [x] Occupancy forecasting with remaining capacity and overcrowding risk
- [x] Chronological train/validation/test splits (70/15/15 — no data leakage)

## Phase 8 — Decision Intelligence
- [x] Evidence-based recommendation engine (rule + metric driven, no external LLM)
- [x] What-if simulation engine (fleet, frequency, headway, capacity, demand)
- [x] Explicit `SIMULATED` labeling on all simulation outputs

## Phase 9 — Dual Pipeline
- [x] Independent Python pipeline (Pandas, Scikit-learn, XGBoost, Statsmodels)
- [x] Strict pipeline decoupling (Python never consumes Spark outputs)
- [x] Dual-pipeline comparison on ≥100 unseen cases (`python_pipeline/comparison.py`)
- [x] Disagreement attribution and consistency status tracking

## Phase 10 — Frontend
- [x] Dashboard with 9 KPI cards and dynamic API integration
- [x] All 17 dedicated pages matching SRS Section 37
- [x] Interactive Leaflet Karachi transit map with stops, routes, bottlenecks
- [x] Plotly.js charts (demand trends, OD matrix heatmaps, delay distributions)
- [x] Global interactive filter bar (route, date, direction, day, hour, peak)
- [x] Competition Demo Mode workflow

## Phase 11 — Testing
- [x] API endpoint tests (`tests/test_api/`)
- [x] Authentication security tests (`tests/test_auth/`)
- [x] Data schema and validator tests (`tests/test_data/`)
- [x] ML evaluation metric tests (`tests/test_ml/`)
- [x] Spark asset and SQL tests (`tests/test_spark/`)
- [x] Time-series chronological split tests (`tests/test_forecasting/`)
- [x] Dual-pipeline independence tests (`tests/test_pipeline/`)

## Phase 12 — Competition Preparation
- [x] `PROJECT_REPORT.md` (comprehensive executive and technical report)
- [x] `DATA_DICTIONARY.md` (all 12 entities with PKs, FKs, descriptions)
- [x] `ARCHITECTURE.md` (system topology, data flow, memory budget)
- [x] `ASSUMPTIONS.md` (data, technical, and analytical assumptions)
- [x] `LIMITATIONS.md` (hardware, big data, and ML boundaries)
- [x] `DEVELOPMENT_LOG.md` (detailed log across all 12 phases)
- [x] `TECHNICAL_BLOG.md` (engineering article >2,500 words)
- [x] `AI_USAGE.md` (AI disclosure declaration)
- [x] `TEAM_CONTRIBUTIONS.md` (all 4 team members)
- [x] `DEMO_CHECKLIST.md` (all 24 mandatory demonstration items)
- [x] `DEMO_SCRIPT.md` (step-by-step evaluator script)
- [x] `competition_submission/CHECKLIST.md` (master submission checklist)
- [x] 15 detailed manuals in `docs/`
