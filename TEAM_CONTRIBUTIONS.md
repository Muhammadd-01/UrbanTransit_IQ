# Team Contributions — UrbanTransit IQ

This document records meaningful contributions by every team member across the competition period.

---

## Muhammad Affan — Lead Developer & Architect

### Contributions
| Date | Module | Contribution | Evidence |
|------|--------|-------------|----------|
| | Architecture | Designed overall system architecture, tech stack selection | ARCHITECTURE.md, project structure |
| | Backend | FastAPI application setup, API design, authentication system | backend/app/ |
| | Integration | End-to-end pipeline integration, Spark ↔ API ↔ Frontend | All modules |
| | DevOps | Hadoop/HDFS setup, Spark configuration | hadoop/, config/ |
| | Testing | Integration tests, end-to-end verification | tests/ |
| | Documentation | README, project report, technical blog | Documentation files |

---

## Muhammad Hammad — Data Engineer

### Contributions
| Date | Module | Contribution | Evidence |
|------|--------|-------------|----------|
| | Data Generator | Karachi transit network synthetic data generator | data_generator/ |
| | Big Data | PySpark ingestion, cleaning, transformation pipelines | spark_jobs/ |
| | HDFS | HDFS upload scripts, data management, partitioning strategy | hadoop/hdfs_scripts/ |
| | Spark SQL | Analytical SQL queries for transit intelligence | spark_sql/ |
| | Data Quality | Data quality engine, record-level audit system | spark_jobs/data_quality.py |
| | Feature Engineering | Transportation feature creation pipeline | spark_jobs/feature_engineering.py |

---

## Shahmir Qadri — ML Engineer

### Contributions
| Date | Module | Contribution | Evidence |
|------|--------|-------------|----------|
| | Spark MLlib | Delay prediction, severity classification, route clustering models | spark_ml/ |
| | Python Pipeline | Independent Python ML pipeline (scikit-learn, XGBoost) | python_pipeline/ |
| | Forecasting | Demand and occupancy forecasting (SARIMA, XGBoost, Spark ML) | forecasting/ |
| | Anomaly Detection | Z-score, IQR, Isolation Forest implementations | anomaly_detection/ |
| | Model Evaluation | Model comparison, dual-pipeline comparison | python_pipeline/comparison.py |
| | Clustering | Route clustering, passenger segmentation | clustering/ |

---

## Waqas Rehman — Frontend & Analytics

### Contributions
| Date | Module | Contribution | Evidence |
|------|--------|-------------|----------|
| | Frontend | React dashboard, all 17 pages, responsive design | frontend/src/ |
| | Visualization | Plotly charts, Leaflet maps, KPI cards | frontend/src/components/ |
| | Analytics | Passenger flow, OD analysis, route performance analytics | backend/app/analytics/ |
| | Recommendations | Evidence-based recommendation engine | recommendation_engine/ |
| | Simulations | What-if simulation engine and UI | simulations/ |
| | Reports | Report generation and export functionality | backend/app/services/ |

---

## Collaboration Notes

- All team members participated in code reviews
- Daily standups conducted to track progress
- Each member can explain and defend their contributed modules
- No artificial or fabricated commits — all contributions are genuine
